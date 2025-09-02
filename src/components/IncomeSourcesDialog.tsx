import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Edit2, Check, X } from 'lucide-react';
import { IncomeSource } from '@/types/incomeSource';

interface IncomeSourcesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  incomeSources: IncomeSource[];
  onAddSource: (source: Omit<IncomeSource, 'id'>) => void;
  onUpdateSource: (id: string, updates: Partial<IncomeSource>) => void;
  onDeleteSource: (id: string) => void;
}

export const IncomeSourcesDialog = ({ 
  open, 
  onOpenChange, 
  incomeSources,
  onAddSource,
  onUpdateSource,
  onDeleteSource
}: IncomeSourcesDialogProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    type: 'work' as IncomeSource['type'],
    contactPattern: '',
    expectedAmount: '',
    isActive: true
  });

  const incomeTypes = [
    { value: 'work', label: 'Trabalho CLT', emoji: '💼' },
    { value: 'freelance', label: 'Freelance/PJ', emoji: '💻' },
    { value: 'investment', label: 'Investimentos', emoji: '📈' },
    { value: 'pension', label: 'Aposentadoria', emoji: '🏦' },
    { value: 'benefits', label: 'Benefícios', emoji: '🎯' },
    { value: 'other', label: 'Outros', emoji: '💰' }
  ];

  const getTypeInfo = (type: IncomeSource['type']) => 
    incomeTypes.find(t => t.value === type) || incomeTypes[5];

  const handleSubmit = () => {
    if (!formData.name.trim() || !formData.contactPattern.trim()) return;

    const newSource: Omit<IncomeSource, 'id'> = {
      name: formData.name.trim(),
      type: formData.type,
      contactPattern: formData.contactPattern.trim(),
      expectedAmount: formData.expectedAmount ? parseFloat(formData.expectedAmount.replace(',', '.')) : undefined,
      isActive: formData.isActive
    };

    if (editingId) {
      onUpdateSource(editingId, newSource);
      setEditingId(null);
    } else {
      onAddSource(newSource);
      setShowAddForm(false);
    }

    setFormData({
      name: '',
      type: 'work',
      contactPattern: '',
      expectedAmount: '',
      isActive: true
    });
  };

  const handleEdit = (source: IncomeSource) => {
    setFormData({
      name: source.name,
      type: source.type,
      contactPattern: source.contactPattern,
      expectedAmount: source.expectedAmount?.toString().replace('.', ',') || '',
      isActive: source.isActive
    });
    setEditingId(source.id);
    setShowAddForm(false);
  };

  const handleCancel = () => {
    setEditingId(null);
    setShowAddForm(false);
    setFormData({
      name: '',
      type: 'work',
      contactPattern: '',
      expectedAmount: '',
      isActive: true
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gerenciar Fontes de Renda</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Existing Sources */}
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {incomeSources.map((source) => {
              const typeInfo = getTypeInfo(source.type);
              return (
                <Card key={source.id} className={`${!source.isActive ? 'opacity-60' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{typeInfo.emoji}</span>
                          <h4 className="font-semibold">{source.name}</h4>
                          <Badge variant={source.isActive ? 'default' : 'secondary'}>
                            {source.isActive ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Padrão: "{source.contactPattern}"
                        </p>
                        {source.expectedAmount && (
                          <p className="text-sm font-medium text-green-600">
                            Esperado: {formatCurrency(source.expectedAmount)}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(source)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => onDeleteSource(source.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Add/Edit Form */}
          {(showAddForm || editingId) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {editingId ? 'Editar Fonte de Renda' : 'Nova Fonte de Renda'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nome da fonte</Label>
                    <Input
                      id="name"
                      placeholder="Ex: Empresa ABC, Freelance Design"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">Tipo</Label>
                    <Select value={formData.type} onValueChange={(value) => 
                      setFormData(prev => ({ ...prev, type: value as IncomeSource['type'] }))
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {incomeTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            <span className="flex items-center gap-2">
                              {type.emoji} {type.label}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="pattern">Padrão do contato</Label>
                  <Input
                    id="pattern"
                    placeholder="Ex: EMPRESA ABC, João Silva, Salário"
                    value={formData.contactPattern}
                    onChange={(e) => setFormData(prev => ({ ...prev, contactPattern: e.target.value }))}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Digite parte do nome que aparece nas transações desta fonte
                  </p>
                </div>

                <div>
                  <Label htmlFor="amount">Valor esperado (opcional)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">R$</span>
                    <Input
                      id="amount"
                      className="pl-10"
                      placeholder="0,00"
                      value={formData.expectedAmount}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^\d,]/g, '');
                        setFormData(prev => ({ ...prev, expectedAmount: value }));
                      }}
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={handleCancel} className="flex-1">
                    <X className="h-4 w-4 mr-2" />
                    Cancelar
                  </Button>
                  <Button onClick={handleSubmit} className="flex-1">
                    <Check className="h-4 w-4 mr-2" />
                    {editingId ? 'Atualizar' : 'Adicionar'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Add Button */}
          {!showAddForm && !editingId && (
            <Button 
              onClick={() => setShowAddForm(true)} 
              className="w-full"
              variant="outline"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Nova Fonte de Renda
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};