import { useState, useEffect } from 'react';
import { Transaction, MonthlyData } from '../types/transaction';
import { HybridBankNotifications, type BankTransactionEvent } from '../lib/hybridBankNotifications';

const STORAGE_KEY = 'transactions_v1';

interface StoredTransaction {
  id: string;
  type: 'received' | 'sent';
  amount: number;
  date: string; // ISO string in storage
  contact: string;
  description?: string;
}

const loadStored = (): Transaction[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as StoredTransaction[];
    return arr.map((t) => ({
      ...t,
      date: new Date(t.date)
    }));
  } catch {
    return [];
  }
};

const persist = (txs: Transaction[]) => {
  const serializable = txs.map((t) => ({ ...t, date: t.date.toISOString() }));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
};

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>(loadStored());
  
  useEffect(() => {
    let cleanup: (() => void) | undefined;

    const setupListeners = async () => {
      // Check permissions but let UI handle the requests
      try {
        const status = await HybridBankNotifications.isEnabled();
        console.log('Services status:', status);
      } catch (error) {
        console.error('Failed to check permissions:', error);
      }

      // Drain any backlog captured while the app was closed
      try {
        const res = await HybridBankNotifications.drainBacklog();
        const events = res?.events ?? [];
        if (events.length > 0) {
          setTransactions((prev) => {
            const toAdd: Transaction[] = events.map((ev) => ({
              id: ev.id,
              type: ev.type,
              amount: Math.round((ev.amount || 0) * 100) / 100,
              date: new Date(ev.date || Date.now()),
              contact: ev.contact || 'Desconhecido',
              description: ev.description
            }));
            // More efficient deduplication using Set
            const seenKeys = new Set<string>();
            const merged = [...toAdd, ...prev]
              .filter(t => {
                const key = `${t.id}-${t.date.getTime()}`;
                if (seenKeys.has(key)) {
                  return false;
                }
                seenKeys.add(key);
                return true;
              })
              .sort((a, b) => b.date.getTime() - a.date.getTime());
            persist(merged);
            return merged;
          });
        }
      } catch (error) {
        console.error('Failed to drain backlog:', error);
      }

      // Live updates while app is running
      try {
        const listenerResult = await HybridBankNotifications.addListener('bankTransaction', (ev: BankTransactionEvent) => {
          const newTx: Transaction = {
            id: ev.id,
            type: ev.type,
            amount: Math.round((ev.amount || 0) * 100) / 100,
            date: new Date(ev.date || Date.now()),
            contact: ev.contact || 'Desconhecido',
            description: ev.description
          };
          setTransactions((prev) => {
            const next = [newTx, ...prev].sort((a, b) => b.date.getTime() - a.date.getTime());
            persist(next);
            return next;
          });
        });
        cleanup = listenerResult.remove;
      } catch (error) {
        console.error('Failed to setup listener:', error);
      }
    };

    setupListeners();

    return () => {
      if (cleanup) {
        try {
          cleanup();
        } catch (error) {
          console.error('Failed to cleanup listener:', error);
        }
      }
    };
  }, []);
  
  const getRecentTransactions = (limit: number = 10) => {
    return transactions.slice(0, limit);
  };
  
  const getCurrentMonthTransactions = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    return transactions.filter(t => 
      t.date.getMonth() === currentMonth && 
      t.date.getFullYear() === currentYear
    );
  };
  
  const getReceivedCurrentMonth = () => {
    return getCurrentMonthTransactions().filter(t => t.type === 'received');
  };
  
  const getSentCurrentMonth = () => {
    return getCurrentMonthTransactions().filter(t => t.type === 'sent');
  };
  
  const getMonthlyData = (): MonthlyData[] => {
    const monthlyData: { [key: string]: MonthlyData } = {};
    
    // Create correct 5-month sequence: last 2 + current + next 2
    const now = new Date();
    const startMonth = new Date(now.getFullYear(), now.getMonth() - 2, 1);
    const cursor = new Date(startMonth);

    // Generate exactly 5 months: 2 previous + current + 2 future
    for (let i = 0; i < 5; i++) {
      const monthKey = cursor.toISOString().substring(0, 7);
      const monthName = cursor.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
      monthlyData[monthKey] = { month: monthName, received: 0, sent: 0 };
      cursor.setMonth(cursor.getMonth() + 1);
    }
    
    // Aggregate transactions into the months
    transactions.forEach(t => {
      const monthKey = t.date.toISOString().substring(0, 7);
      if (monthlyData[monthKey]) {
        if (t.type === 'received') {
          monthlyData[monthKey].received += t.amount;
        } else {
          monthlyData[monthKey].sent += t.amount;
        }
      }
    });
    
    // Get sorted data for trend calculation
    const sortedData = Object.keys(monthlyData)
      .sort()
      .map(key => monthlyData[key]);
    
    // Calculate trend-based predictions for future months
    const calculateTrendPrediction = (values: number[], isReceived: boolean = true) => {
      const hasRealData = values.some(v => v > 0);
      
      if (!hasRealData) {
        // Generate realistic sample data for demonstration when no real data exists
        const baseAmount = isReceived ? 1500 + Math.random() * 500 : 800 + Math.random() * 400;
        return Math.round(baseAmount * 100) / 100;
      }
      
      if (values.length < 2) return values[values.length - 1] || 0;
      
      // Calculate growth trend from historical data
      let totalGrowth = 0;
      let growthCount = 0;
      
      for (let i = 1; i < values.length; i++) {
        if (values[i - 1] > 0) {
          const growth = values[i] - values[i - 1];
          totalGrowth += growth;
          growthCount++;
        }
      }
      
      const averageGrowth = growthCount > 0 ? totalGrowth / growthCount : 0;
      const lastValue = values[values.length - 1];
      
      // Add some realistic variation to predictions
      const variation = (Math.random() - 0.5) * 0.2; // ±10% variation
      const prediction = lastValue + averageGrowth + (lastValue * variation);
      
      return Math.max(0, Math.round(prediction * 100) / 100);
    };
    
    // Apply predictions to future months (indexes 3 and 4)
    if (sortedData.length >= 5) {
      // Get historical data for trend calculation
      const historicalReceived = sortedData.slice(0, 3).map(d => d.received);
      const historicalSent = sortedData.slice(0, 3).map(d => d.sent);
      
      // Check if we have any real data at all
      const hasAnyRealData = [...historicalReceived, ...historicalSent].some(v => v > 0);
      
      if (hasAnyRealData) {
        // Use real data for predictions
        const receivedPrediction = calculateTrendPrediction(historicalReceived, true);
        const sentPrediction = calculateTrendPrediction(historicalSent, false);
        
        sortedData[3].received = receivedPrediction;
        sortedData[3].sent = sentPrediction;
        
        // For the month after that, apply trend again
        const nextReceivedPrediction = calculateTrendPrediction([...historicalReceived, receivedPrediction], true);
        const nextSentPrediction = calculateTrendPrediction([...historicalSent, sentPrediction], false);
        
        sortedData[4].received = nextReceivedPrediction;
        sortedData[4].sent = nextSentPrediction;
      }
    }
    
    return sortedData;
  };
  
  const clearTransactions = () => {
    setTransactions([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return {
    transactions,
    getRecentTransactions,
    getCurrentMonthTransactions,
    getReceivedCurrentMonth,
    getSentCurrentMonth,
    getMonthlyData,
    clearTransactions
  };
};