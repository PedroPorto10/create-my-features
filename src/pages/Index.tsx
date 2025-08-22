import { useState, useEffect } from 'react';
import { ArrowLeft, Table2, Wallet, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTransactions } from '@/hooks/useTransactions';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();
  const { getRecentTransactions } = useTransactions();
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  
  useEffect(() => {
    setRecentTransactions(getRecentTransactions(10));
  }, []);
  
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
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Wallet className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">C6 Finance</h1>
              <p className="text-muted-foreground">Organize suas finanças</p>
            </div>
          </div>
        </div>
        
        {/* Balance Card */}
        <Card className="bg-gradient-primary shadow-button mb-6">
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-primary-foreground/80 text-sm mb-1">Saldo das Últimas Transações</p>
              <p className="text-3xl font-bold text-primary-foreground">
                {formatCurrency(getTotalBalance())}
              </p>
            </div>
          </CardContent>
        </Card>
        
        {/* Quick Actions */}
        <div className="grid grid-cols-1 gap-4 mb-6">
          <Button
            onClick={() => navigate('/tables')}
            className="h-16 bg-gradient-card text-card-foreground hover:shadow-soft border border-border"
            variant="ghost"
          >
            <div className="flex items-center gap-3">
              <Table2 className="h-6 w-6 text-primary" />
              <div className="text-left">
                <p className="font-semibold">Ver Tabelas Detalhadas</p>
                <p className="text-sm text-muted-foreground">Transações do mês atual</p>
              </div>
            </div>
          </Button>
        </div>
        
        {/* Recent Transactions */}
        <Card className="bg-gradient-card shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Últimas 10 Transações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex justify-between items-center p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      transaction.type === 'received' 
                        ? 'bg-success-light text-success' 
                        : 'bg-warning-light text-expense'
                    }`}>
                      {transaction.type === 'received' 
                        ? <TrendingUp className="h-4 w-4" />
                        : <TrendingDown className="h-4 w-4" />
                      }
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{transaction.contact}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(transaction.date)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${
                      transaction.type === 'received' ? 'text-success' : 'text-expense'
                    }`}>
                      {transaction.type === 'received' ? '+' : '-'} {formatCurrency(transaction.amount)}
                    </p>
                  </div>
                </div>
              ))}
              {recentTransactions.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Wallet className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Nenhuma transação encontrada</p>
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
