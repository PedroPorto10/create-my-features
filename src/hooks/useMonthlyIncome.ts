import { useState, useEffect } from 'react';

const STORAGE_KEY = 'monthly_income';

export const useMonthlyIncome = () => {
  const [monthlyIncome, setMonthlyIncomeState] = useState<number>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? parseFloat(stored) : 0;
    } catch {
      return 0;
    }
  });

  const setMonthlyIncome = (income: number) => {
    setMonthlyIncomeState(income);
    localStorage.setItem(STORAGE_KEY, income.toString());
  };

  return {
    monthlyIncome,
    setMonthlyIncome
  };
};