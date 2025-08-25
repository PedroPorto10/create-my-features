import { useState } from 'react';
import { Check, ChevronDown, TrendingUp, Shield, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { investmentTypes, getRiskColor, getRiskLabel } from '@/data/investmentTypes';
import { InvestmentType } from '@/types/investment';

interface InvestmentTypeSelectorProps {
  selectedType?: string;
  onSelect: (type: InvestmentType) => void;
  aiRecommendedType?: string;
}

export const InvestmentTypeSelector = ({ 
  selectedType, 
  onSelect, 
  aiRecommendedType 
}: InvestmentTypeSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRiskFilter, setSelectedRiskFilter] = useState<string>('all');

  const selectedInvestment = investmentTypes.find(type => type.id === selectedType);
  const aiRecommended = investmentTypes.find(type => type.id === aiRecommendedType);

  const filteredTypes = selectedRiskFilter === 'all' 
    ? investmentTypes 
    : investmentTypes.filter(type => type.riskLevel === selectedRiskFilter);

  const handleSelect = (type: InvestmentType) => {
    onSelect(type);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between h-auto p-4 text-left hover:bg-muted/50"
        >
          <div className="flex items-center gap-3">
            {selectedInvestment ? (
              <>
                <span className="text-2xl">{selectedInvestment.icon}</span>
                <div>
                  <p className="font-medium">{selectedInvestment.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedInvestment.expectedReturn}
                  </p>
                </div>
              </>
            ) : (
              <div>
                <p className="font-medium">Selecionar tipo de investimento</p>
                <p className="text-sm text-muted-foreground">
                  Clique para ver as opções disponíveis
                </p>
              </div>
            )}
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Escolha seu tipo de investimento
          </DialogTitle>
        </DialogHeader>

        {/* AI Recommendation Banner */}
        {aiRecommended && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800 mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-full">
                <Zap className="h-4 w-4 text-blue-600 dark:text-blue-300" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                  💡 Recomendação da IA
                </p>
                <p className="text-blue-700 dark:text-blue-200 text-sm">
                  Com base no seu perfil financeiro, recomendamos: <strong>{aiRecommended.name}</strong>
                </p>
              </div>
              <Button
                onClick={() => handleSelect(aiRecommended)}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Escolher
              </Button>
            </div>
          </div>
        )}

        {/* Risk Filter */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <Button
            variant={selectedRiskFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedRiskFilter('all')}
          >
            Todos
          </Button>
          <Button
            variant={selectedRiskFilter === 'low' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedRiskFilter('low')}
            className="text-green-600 hover:text-green-700"
          >
            <Shield className="h-3 w-3 mr-1" />
            Baixo
          </Button>
          <Button
            variant={selectedRiskFilter === 'medium' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedRiskFilter('medium')}
            className="text-yellow-600 hover:text-yellow-700"
          >
            Médio
          </Button>
          <Button
            variant={selectedRiskFilter === 'high' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedRiskFilter('high')}
            className="text-red-600 hover:text-red-700"
          >
            Alto
          </Button>
        </div>

        {/* Investment Types Grid */}
        <div className="grid gap-3">
          {filteredTypes.map((type) => (
            <Card
              key={type.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedType === type.id
                  ? 'ring-2 ring-primary bg-primary/5'
                  : 'hover:bg-muted/30'
              } ${
                aiRecommendedType === type.id && selectedType !== type.id
                  ? 'ring-1 ring-blue-300 dark:ring-blue-700'
                  : ''
              }`}
              onClick={() => handleSelect(type)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{type.icon}</span>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{type.name}</h3>
                        {aiRecommendedType === type.id && (
                          <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                            IA Recomenda
                          </Badge>
                        )}
                      </div>
                      <Badge className={`text-xs px-2 py-1 ${getRiskColor(type.riskLevel)}`}>
                        {getRiskLabel(type.riskLevel)}
                      </Badge>
                    </div>
                  </div>
                  {selectedType === type.id && (
                    <div className="p-1 bg-primary rounded-full">
                      <Check className="h-3 w-3 text-primary-foreground" />
                    </div>
                  )}
                </div>

                <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                  {type.description}
                </p>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="font-medium text-muted-foreground mb-1">Retorno</p>
                    <p className="text-foreground text-xs">{type.expectedReturn}</p>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground mb-1">Min. Inicial</p>
                    <p className="text-foreground text-xs">
                      R$ {type.minAmount.toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
                <div className="mt-2 text-xs">
                  <p className="font-medium text-muted-foreground mb-1">Liquidez</p>
                  <p className="text-foreground text-xs">{type.liquidity}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-xs text-muted-foreground mt-4 p-3 bg-muted/30 rounded-lg">
          <p className="font-medium mb-1">💡 Dica:</p>
          <p>
            A IA analisa seu perfil financeiro atual para sugerir o investimento mais adequado. 
            Considere diversificar entre diferentes tipos para reduzir riscos.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};