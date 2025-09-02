import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface MonthlyIncomeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentIncome: number;
  onIncomeSet: (income: number) => void;
}

export const MonthlyIncomeDialog = ({ 
  open, 
  onOpenChange, 
  currentIncome, 
  onIncomeSet 
}: MonthlyIncomeDialogProps) => {
  const [income, setIncome] = useState(currentIncome.toString());

  const handleSave = () => {
    const parsedIncome = parseFloat(income.replace(',', '.')) || 0;
    onIncomeSet(parsedIncome);
    onOpenChange(false);
  };

  const formatCurrency = (value: string) => {
    const numericValue = value.replace(/[^\d,]/g, '');
    return numericValue;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrency(e.target.value);
    setIncome(formatted);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Definir Renda Mensal</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="income">Renda mensal (R$)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                R$
              </span>
              <Input
                id="income"
                type="text"
                placeholder="0,00"
                value={income}
                onChange={handleInputChange}
                className="pl-10"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Esta informação será usada para calcular insights de investimento mais precisos
            </p>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancelar
            </Button>
            <Button onClick={handleSave} className="flex-1">
              Salvar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};