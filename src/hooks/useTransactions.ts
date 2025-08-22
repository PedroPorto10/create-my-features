import { useState, useEffect } from 'react';
import { Transaction, MonthlyData } from '../types/transaction';
import { BankNotifications, type BankNotificationEvent } from '../lib/bankNotifications';

const STORAGE_KEY = 'transactions_v1';

const loadStored = (): Transaction[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as any[];
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
    const sub = BankNotifications.addListener((ev: BankNotificationEvent) => {
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

    return () => {
      try { (sub as any)?.remove?.(); } catch {}
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
    
    // Use range around existing transactions
    const allDates = transactions.map(t => t.date.getTime());
    const now = Date.now();
    const minTime = allDates.length ? Math.min(...allDates) : now;
    const months = new Set<string>();
    const base = new Date(minTime);
    base.setDate(1);
    const cursor = new Date(base);
    const end = new Date();
    end.setMonth(end.getMonth() + 4);

    while (cursor <= end) {
      const monthKey = cursor.toISOString().substring(0, 7);
      const monthName = cursor.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
      if (!months.has(monthKey)) {
        months.add(monthKey);
        monthlyData[monthKey] = { month: monthName, received: 0, sent: 0 };
      }
      cursor.setMonth(cursor.getMonth() + 1);
    }
    
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
    
    return Object.values(monthlyData);
  };
  
  return {
    transactions,
    getRecentTransactions,
    getCurrentMonthTransactions,
    getReceivedCurrentMonth,
    getSentCurrentMonth,
    getMonthlyData
  };
};