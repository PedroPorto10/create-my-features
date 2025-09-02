import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Transaction } from '@/types/transaction';

interface CategoryDialogProps {
  transaction: Transaction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCategorySelect: (transactionId: string, category: Transaction['category']) => void;
}

export const CategoryDialog = ({ transaction, open, onOpenChange, onCategorySelect }: CategoryDialogProps) => {
  const categories = [
    { id: 'Alimentação', name: 'Alimentação', emoji: '🍽️' },
    { id: 'Laser', name: 'Laser', emoji: '🎉' },
    { id: 'Contas', name: 'Contas', emoji: '📄' },
    { id: 'Transporte', name: 'Transporte', emoji: '🚗' },
    { id: 'Outros', name: 'Outros', emoji: '📦' },
  ] as const;

  const handleCategorySelect = (category: Transaction['category']) => {
    if (transaction) {
      onCategorySelect(transaction.id, category);
      onOpenChange(false);
    }
  };

  if (!transaction) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Categorizar Transação</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="font-semibold">{transaction.contact}</p>
            <p className="text-sm text-muted-foreground">
              R$ {transaction.amount.toFixed(2).replace('.', ',')}
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Selecione uma categoria:</p>
            <div className="grid grid-cols-1 gap-2">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant="outline"
                  className={`justify-start h-12 ${
                    transaction.category === category.id ? 'bg-primary/10 border-primary' : ''
                  }`}
                  onClick={() => handleCategorySelect(category.id as Transaction['category'])}
                >
                  <span className="mr-3 text-lg">{category.emoji}</span>
                  {category.name}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};