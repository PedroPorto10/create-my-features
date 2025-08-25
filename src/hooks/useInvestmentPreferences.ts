import { useState, useEffect } from 'react';

const STORAGE_KEY = 'investment_preferences_v1';

interface InvestmentPreferences {
  selectedInvestmentType: string;
}

const loadStored = (): InvestmentPreferences => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { selectedInvestmentType: '' };
    return JSON.parse(raw) as InvestmentPreferences;
  } catch {
    return { selectedInvestmentType: '' };
  }
};

const persist = (preferences: InvestmentPreferences) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
};

export const useInvestmentPreferences = () => {
  const [preferences, setPreferences] = useState<InvestmentPreferences>(loadStored());

  const setSelectedInvestmentType = (investmentType: string) => {
    const newPreferences = { ...preferences, selectedInvestmentType: investmentType };
    setPreferences(newPreferences);
    persist(newPreferences);
  };

  const clearPreferences = () => {
    const defaultPreferences = { selectedInvestmentType: '' };
    setPreferences(defaultPreferences);
    localStorage.removeItem(STORAGE_KEY);
  };

  return {
    selectedInvestmentType: preferences.selectedInvestmentType,
    setSelectedInvestmentType,
    clearPreferences
  };
};