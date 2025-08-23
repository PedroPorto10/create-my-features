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
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit'
    }).format(date);
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
        className="bg-gradient-card shadow-xl hover:shadow-2xl transition-all cursor-pointer rounded-2xl border-0"
        onClick={() => handleTableClick(type)}
      >
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-card-foreground text-xl">
            {icon}
            {title}
          </CardTitle>
          <p className="text-3xl font-bold text-balance">
            {formatCurrency(total)}
          </p>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <div className="space-y-3 max-h-[50vh] overflow-y-auto">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex justify-between items-center p-4 bg-muted/20 rounded-2xl hover:bg-muted/30 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-foreground text-base truncate">{transaction.contact}</p>
                  <p className="text-muted-foreground text-sm">
                    {formatDate(transaction.date)}
                  </p>
                </div>
                <div className="text-right ml-4">
                  <p className={`font-bold text-lg ${
                    type === 'received' 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {type === 'received' ? '+' : '-'} {formatCurrency(transaction.amount)}
                  </p>
                </div>
              </div>
            ))}
            {transactions.length === 0 && (
              <div className="text-center text-muted-foreground py-12">
                <p className="text-lg">Nenhuma transação encontrada este mês</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 px-4 py-6 safe-area-inset">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/')}
            className="text-primary p-3 rounded-2xl hover:bg-primary/10"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Transações do Mês</h1>
            <p className="text-muted-foreground text-lg">
              {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>
        
        {/* Transaction Tables - Stack on mobile */}
        <div className="space-y-6">
          <TransactionTable
            transactions={receivedTransactions}
            type="received"
            title="Recebidas"
            icon={<TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />}
          />
          
          <TransactionTable
            transactions={sentTransactions}
            type="sent"
            title="Enviadas"
            icon={<TrendingDown className="h-6 w-6 text-red-600 dark:text-red-400" />}
          />
        </div>
      </div>
    </div>
  );
};

export default Tables;