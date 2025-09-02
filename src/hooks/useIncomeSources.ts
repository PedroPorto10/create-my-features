import { useState, useEffect } from 'react';
import { IncomeSource, IncomeAnalysis } from '@/types/incomeSource';
import { Transaction } from '@/types/transaction';

const STORAGE_KEY = 'income_sources';

export const useIncomeSources = () => {
  const [incomeSources, setIncomeSourcesState] = useState<IncomeSource[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const setIncomeSources = (sources: IncomeSource[]) => {
    setIncomeSourcesState(sources);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sources));
  };

  const addIncomeSource = (source: Omit<IncomeSource, 'id'>) => {
    const newSource: IncomeSource = {
      ...source,
      frequency: source.frequency || 'monthly', // Default to monthly if not specified
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
    };
    const updated = [...incomeSources, newSource];
    setIncomeSources(updated);
    return newSource.id;
  };

  const updateIncomeSource = (id: string, updates: Partial<IncomeSource>) => {
    const updated = incomeSources.map(source => 
      source.id === id ? { ...source, ...updates } : source
    );
    setIncomeSources(updated);
  };

  const deleteIncomeSource = (id: string) => {
    const updated = incomeSources.filter(source => source.id !== id);
    setIncomeSources(updated);
  };

  const analyzeIncome = (transactions: Transaction[]): IncomeAnalysis => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const currentMonthReceived = transactions.filter(t => 
      t.type === 'received' && 
      t.date.getMonth() === currentMonth && 
      t.date.getFullYear() === currentYear
    );

    const incomeBreakdown: IncomeAnalysis['incomeBreakdown'] = [];
    let workIncome = 0;
    let otherIncome = 0;

    // Create a map to track matched transactions to avoid double counting
    const matchedTransactions = new Set<string>();

    // Match transactions to income sources
    incomeSources.forEach(source => {
      if (!source.isActive) return;

      const sourceTransactions = currentMonthReceived.filter(t => {
        if (matchedTransactions.has(t.id)) return false;
        
        // Normalize both strings for better matching
        const contactNormalized = t.contact.toLowerCase()
          .replace(/\s+/g, ' ')  // Multiple spaces to single space
          .replace(/[^\w\s]/g, '') // Remove special characters
          .trim();
          
        const patternNormalized = source.contactPattern.toLowerCase()
          .replace(/\s+/g, ' ')  // Multiple spaces to single space
          .replace(/[^\w\s]/g, '') // Remove special characters
          .trim();
        
        // Check if pattern is found in contact name
        return contactNormalized.includes(patternNormalized) || 
               patternNormalized.includes(contactNormalized);
      });

      if (sourceTransactions.length > 0) {
        const sourceAmount = sourceTransactions.reduce((sum, t) => sum + t.amount, 0);
        
        // Mark these transactions as matched
        sourceTransactions.forEach(t => matchedTransactions.add(t.id));

        incomeBreakdown.push({
          sourceId: source.id,
          sourceName: source.name,
          type: source.type,
          amount: sourceAmount
        });

        if (source.type === 'work' || source.type === 'freelance') {
          workIncome += sourceAmount;
        } else {
          otherIncome += sourceAmount;
        }
      }
    });

    // Add unmatched received transactions as "other income"
    const unmatchedTransactions = currentMonthReceived.filter(t => !matchedTransactions.has(t.id));
    if (unmatchedTransactions.length > 0) {
      const unmatchedAmount = unmatchedTransactions.reduce((sum, t) => sum + t.amount, 0);
      otherIncome += unmatchedAmount;
      
      incomeBreakdown.push({
        sourceId: 'unmatched',
        sourceName: 'Outras receitas não categorizadas',
        type: 'other',
        amount: unmatchedAmount
      });
    }

    return {
      workIncome,
      otherIncome,
      totalIncome: workIncome + otherIncome,
      incomeBreakdown
    };
  };

  const getMonthlyAmountFromSource = (source: IncomeSource): number => {
    if (!source.expectedAmount) return 0;
    
    switch (source.frequency) {
      case 'monthly':
        return source.expectedAmount;
      case 'biweekly':
        return source.expectedAmount * 2;
      case 'weekly':
        return source.expectedAmount * 4.33; // Average weeks per month
      case 'daily':
        return source.expectedAmount * 22; // Working days per month
      case 'custom':
        if (source.customFrequencyDays) {
          const paymentsPerMonth = 30 / source.customFrequencyDays;
          return source.expectedAmount * paymentsPerMonth;
        }
        return source.expectedAmount;
      default:
        return source.expectedAmount;
    }
  };

  const getTotalExpectedIncome = (): number => {
    return incomeSources
      .filter(source => source.isActive && source.expectedAmount)
      .reduce((sum, source) => sum + getMonthlyAmountFromSource(source), 0);
  };

  return {
    incomeSources,
    setIncomeSources,
    addIncomeSource,
    updateIncomeSource,
    deleteIncomeSource,
    analyzeIncome,
    getTotalExpectedIncome,
    getMonthlyAmountFromSource
  };
};