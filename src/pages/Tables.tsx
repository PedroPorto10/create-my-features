import { ArrowLeft, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useTransactions } from '@/hooks/useTransactions';
import { useNavigate } from 'react-router-dom';
import { useBackButton } from '@/hooks/useBackButton';
import { Transaction } from '../types/transaction';
import { CategoryDialog } from '@/components/CategoryDialog';
import { useState, useRef } from 'react';

const Tables = () => {
  const navigate = useNavigate();
  const { getReceivedCurrentMonth, getSentCurrentMonth, deleteTransaction, updateTransactionCategory } = useTransactions();
  const [swipingTransaction, setSwipingTransaction] = useState<string | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const { handleBack } = useBackButton({ targetRoute: '/' });
  
  const receivedTransactions = getReceivedCurrentMonth();
  const sentTransactions = getSentCurrentMonth();
  
  
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

  const handleTransactionClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setCategoryDialogOpen(true);
  };

  const handleCategorySelect = (transactionId: string, category: Transaction['category']) => {
    updateTransactionCategory(transactionId, category);
  };

  const SwipeableTableRow = ({ transaction }: { transaction: Transaction }) => {
    const [dragX, setDragX] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const rowRef = useRef<HTMLTableRowElement>(null);

    const handleTouchStart = (e: React.TouchEvent) => {
      setStartX(e.touches[0].clientX);
      setIsDragging(true);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
      if (!isDragging) return;
      
      const currentX = e.touches[0].clientX;
      const deltaX = currentX - startX;
      
      // Allow swiping both left and right
      setDragX(Math.max(Math.min(deltaX, 100), -100));
    };

    const handleTouchEnd = () => {
      if (!isDragging) return;
      
      if (Math.abs(dragX) > 50) {
        // Swipe threshold reached (either left or right), delete transaction
        deleteTransaction(transaction.id);
      }
      
      // Reset position
      setDragX(0);
      setIsDragging(false);
    };

    const handleMouseDown = (e: React.MouseEvent) => {
      setStartX(e.clientX);
      setIsDragging(true);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
      if (!isDragging) return;
      
      const currentX = e.clientX;
      const deltaX = currentX - startX;
      
      // Allow dragging both left and right
      setDragX(Math.max(Math.min(deltaX, 100), -100));
    };

    const handleMouseUp = () => {
      if (!isDragging) return;
      
      if (Math.abs(dragX) > 50) {
        deleteTransaction(transaction.id);
      }
      
      setDragX(0);
      setIsDragging(false);
    };

    return (
      <TableRow 
        ref={rowRef}
        key={`${transaction.type}-${transaction.id}`}
        className={`${
          transaction.type === 'received' 
            ? 'bg-green-50 dark:bg-green-900/10 hover:bg-green-100 dark:hover:bg-green-900/20' 
            : 'bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20'
        } transition-colors relative cursor-grab ${isDragging ? 'cursor-grabbing' : ''}`}
        style={{
          transform: `translateX(${dragX}px)`,
          transition: isDragging ? 'none' : 'transform 0.2s ease-out'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={(e) => {
          if (!isDragging && Math.abs(dragX) < 5) {
            handleTransactionClick(transaction);
          }
        }}
      >
        <TableCell className="font-medium truncate max-w-0">
          {transaction.contact}
          {transaction.category && (
            <div className="text-xs text-muted-foreground mt-1">
              {transaction.category === 'Alimentação' && '🍽️'} 
              {transaction.category === 'Laser' && '🎯'} 
              {transaction.category === 'Contas' && '📄'} 
              {transaction.category === 'Transporte' && '🚗'} 
              {transaction.category === 'Outros' && '📦'} 
              {transaction.category}
            </div>
          )}
        </TableCell>
        <TableCell className="text-muted-foreground text-sm">
          {transaction.date.toLocaleDateString('pt-BR', { 
            day: '2-digit', 
            month: '2-digit',
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </TableCell>
        <TableCell className="text-right">
          <span className={`font-bold text-sm ${
            transaction.type === 'received' 
              ? 'text-green-600 dark:text-green-400' 
              : 'text-red-600 dark:text-red-400'
          }`}>
            {transaction.type === 'received' ? '+' : ''} {formatCurrency(transaction.amount)}
          </span>
        </TableCell>
      </TableRow>
    );
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
        className="bg-gradient-card shadow-xl rounded-2xl border-0"
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
          <button 
            onClick={handleBack}
            className="text-primary p-3 rounded-2xl hover:bg-primary/10 bg-transparent border-none cursor-pointer flex items-center justify-center"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Transações do Mês</h1>
            <p className="text-muted-foreground text-lg">
              {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>
        
        {/* Graphs Button */}
        <div className="mb-6">
          <Button
            onClick={() => navigate('/charts')}
            className="w-full h-16 bg-gradient-primary hover:shadow-xl text-primary-foreground rounded-2xl transition-all duration-200"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary-foreground/10 rounded-xl">
                <BarChart3 className="h-7 w-7" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-lg">Ver Gráficos</p>
                <p className="text-base opacity-90">Análise visual das transações</p>
              </div>
            </div>
          </Button>
        </div>
        
        {/* Combined Transactions Table */}
        <Card className="bg-gradient-card shadow-xl rounded-2xl border-0">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-card-foreground text-xl">
              <TrendingUp className="h-6 w-6 text-primary" />
              Todas as Transações
            </CardTitle>
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-green-600"></div>
                <span>Recebido ({receivedTransactions.length})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-red-600"></div>
                <span>Enviado ({sentTransactions.length})</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="max-h-[70vh] overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40%]">Contato</TableHead>
                    <TableHead className="w-[30%]">Data</TableHead>
                    <TableHead className="text-right w-[30%]">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...receivedTransactions, ...sentTransactions]
                    .sort((a, b) => b.date.getTime() - a.date.getTime())
                    .map((transaction) => (
                      <SwipeableTableRow key={`${transaction.type}-${transaction.id}`} transaction={transaction} />
                  ))}
                  {receivedTransactions.length === 0 && sentTransactions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground py-12">
                        <p className="text-lg">Nenhuma transação encontrada este mês</p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <CategoryDialog
        transaction={selectedTransaction}
        open={categoryDialogOpen}
        onOpenChange={setCategoryDialogOpen}
        onCategorySelect={handleCategorySelect}
      />
    </div>
  );
};

export default Tables;