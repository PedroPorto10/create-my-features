import { ArrowLeft, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTransactions } from '@/hooks/useTransactions';
import { useNavigate } from 'react-router-dom';
import { Transaction } from '../types/transaction';

const Tables = () => {
  const navigate = useNavigate();
  const { getReceivedCurrentMonth, getSentCurrentMonth } = useTransactions();
  
  const receivedTransactions = getReceivedCurrentMonth();
  const sentTransactions = getSentCurrentMonth();
  
  const handleTableClick = (type: 'received' | 'sent') => {
    navigate(`/charts/${type}`);
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };
  
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR').format(date);
  };
  
  const TransactionTable = ({ 
    transactions, 
    type, 
    title, 
    icon 
  }: { 
    transactions: Transaction[], 
    type: 'received' | 'sent',
    title: string,
    icon: React.ReactNode 
  }) => {
    const total = transactions.reduce((sum, t) => sum + t.amount, 0);
    
    return (
      <Card 
        className="bg-gradient-card shadow-card hover:shadow-soft transition-all cursor-pointer"
        onClick={() => handleTableClick(type)}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-card-foreground">
            {icon}
            {title}
          </CardTitle>
          <p className="text-2xl font-bold text-balance">
            {formatCurrency(total)}
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex justify-between items-center p-3 bg-muted/50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-foreground">{transaction.contact}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(transaction.date)}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${
                    type === 'received' ? 'text-success' : 'text-expense'
                  }`}>
                    {type === 'received' ? '+' : '-'} {formatCurrency(transaction.amount)}
                  </p>
                </div>
              </div>
            ))}
            {transactions.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                Nenhuma transação encontrada este mês
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };
  
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/')}
            className="text-primary"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Transações do Mês</h1>
            <p className="text-muted-foreground">
              {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          <TransactionTable
            transactions={receivedTransactions}
            type="received"
            title="Transferências Recebidas"
            icon={<TrendingUp className="h-5 w-5 text-success" />}
          />
          
          <TransactionTable
            transactions={sentTransactions}
            type="sent"
            title="Transferências Enviadas"
            icon={<TrendingDown className="h-5 w-5 text-expense" />}
          />
        </div>
      </div>
    </div>
  );
};

export default Tables;