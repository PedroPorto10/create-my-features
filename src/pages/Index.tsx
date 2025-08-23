import { useState, useEffect } from 'react';
import { Table2, Wallet, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTransactions } from '@/hooks/useTransactions';
import { useNavigate } from 'react-router-dom';
import { Transaction } from '../types/transaction';

const Index = () => {
  const navigate = useNavigate();
  const { getRecentTransactions } = useTransactions();
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  
  useEffect(() => {
    setRecentTransactions(getRecentTransactions(10));
  }, [getRecentTransactions]);
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };
  
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  const getTotalBalance = () => {
    return recentTransactions.reduce((balance, transaction) => {
      return transaction.type === 'received' 
        ? balance + transaction.amount 
        : balance - transaction.amount;
    }, 0);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 px-4 py-6">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-lg">
              <Wallet className="h-7 w-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">C6 Finance</h1>
              <p className="text-muted-foreground text-lg">Organize suas finanças</p>
            </div>
          </div>
        </div>
        
        {/* Balance Card */}
        <Card className="bg-gradient-primary shadow-xl mb-8 rounded-2xl">
          <CardContent className="p-8">
            <div className="text-center">
              <p className="text-primary-foreground/80 text-base mb-2">Saldo das Últimas Transações</p>
              <p className="text-4xl font-bold text-primary-foreground">
                {formatCurrency(getTotalBalance())}
              </p>
            </div>
          </CardContent>
        </Card>
        
        {/* Quick Actions */}
        <div className="grid grid-cols-1 gap-4 mb-8">
          <Button
            onClick={() => navigate('/tables')}
            className="h-20 bg-gradient-card text-card-foreground hover:shadow-xl border border-border rounded-2xl transition-all duration-200"
            variant="ghost"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-xl">
                <Table2 className="h-7 w-7 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-lg">Ver Tabelas Detalhadas</p>
                <p className="text-base text-muted-foreground">Transações do mês atual</p>
              </div>
            </div>
          </Button>
        </div>
        
        {/* Recent Transactions */}
        <Card className="bg-gradient-card shadow-xl rounded-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-xl">
              <DollarSign className="h-6 w-6 text-primary" />
              Últimas 10 Transações
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              {recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex justify-between items-center p-4 bg-muted/20 rounded-2xl hover:bg-muted/40 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl shadow-sm ${
                      transaction.type === 'received' 
                        ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400' 
                        : 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                    }`}>
                      {transaction.type === 'received' 
                        ? <TrendingUp className="h-5 w-5" />
                        : <TrendingDown className="h-5 w-5" />
                      }
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-foreground text-base truncate">{transaction.contact}</p>
                      <p className="text-muted-foreground text-sm">
                        {formatDate(transaction.date)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p className={`font-bold text-lg ${
                      transaction.type === 'received' 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {transaction.type === 'received' ? '+' : '-'} {formatCurrency(transaction.amount)}
                    </p>
                  </div>
                </div>
              ))}
              {recentTransactions.length === 0 && (
                <div className="text-center py-16 text-muted-foreground">
                  <div className="p-6 bg-muted/10 rounded-3xl inline-block mb-6">
                    <Wallet className="h-20 w-20 mx-auto opacity-50" />
                  </div>
                  <p className="mb-3 text-xl font-medium">Nenhuma transação encontrada</p>
                  <p className="text-base">Faça uma transação PIX no C6 Bank para começar</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;