import { useState, useEffect } from 'react';
import { Transaction, MonthlyData } from '../types/transaction';

// Simulando dados do C6 Bank
const generateMockTransactions = (): Transaction[] => {
  const transactions: Transaction[] = [];
  const contacts = ['João Silva', 'Maria Santos', 'Pedro Costa', 'Ana Lima', 'Carlos Oliveira', 'Fernanda Rocha'];
  
  // Últimos 5 meses incluindo atual
  for (let monthOffset = 0; monthOffset < 5; monthOffset++) {
    const date = new Date();
    date.setMonth(date.getMonth() - monthOffset);
    
    // 10-15 transações por mês
    const transactionsPerMonth = Math.floor(Math.random() * 6) + 10;
    
    for (let i = 0; i < transactionsPerMonth; i++) {
      const transactionDate = new Date(date);
      transactionDate.setDate(Math.floor(Math.random() * 28) + 1);
      
      transactions.push({
        id: `${monthOffset}-${i}`,
        type: Math.random() > 0.5 ? 'received' : 'sent',
        amount: Math.floor(Math.random() * 2000) + 50,
        date: transactionDate,
        contact: contacts[Math.floor(Math.random() * contacts.length)],
        description: Math.random() > 0.7 ? 'PIX' : undefined
      });
    }
  }
  
  return transactions.sort((a, b) => b.date.getTime() - a.date.getTime());
};

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  useEffect(() => {
    const mockData = generateMockTransactions();
    setTransactions(mockData);
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
    
    // Últimos 4 meses + atual
    for (let i = 4; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = date.toISOString().substring(0, 7);
      const monthName = date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
      
      monthlyData[monthKey] = {
        month: monthName,
        received: 0,
        sent: 0
      };
    }
    
    // Previsão próximos 4 meses
    for (let i = 1; i <= 4; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() + i);
      const monthKey = date.toISOString().substring(0, 7);
      const monthName = date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
      
      // Simulando previsão baseada na média dos últimos meses
      const avgReceived = transactions
        .filter(t => t.type === 'received')
        .reduce((sum, t) => sum + t.amount, 0) / 5;
      const avgSent = transactions
        .filter(t => t.type === 'sent')
        .reduce((sum, t) => sum + t.amount, 0) / 5;
      
      monthlyData[monthKey] = {
        month: monthName,
        received: Math.floor(avgReceived * (0.8 + Math.random() * 0.4)),
        sent: Math.floor(avgSent * (0.8 + Math.random() * 0.4))
      };
    }
    
    // Preencher com dados reais
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