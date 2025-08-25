import { useState } from 'react';
import { ExternalLink, Info, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { investmentTypes } from '@/data/investmentTypes';
import { InvestmentType } from '@/types/investment';

interface InvestmentInstructionsProps {
  investmentTypeId: string;
}

export const InvestmentInstructions = ({ investmentTypeId }: InvestmentInstructionsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const investmentType = investmentTypes.find(type => type.id === investmentTypeId);
  
  if (!investmentType) return null;

  const formatInstructions = (instructions: string) => {
    return instructions.split('\n').map((line, index) => (
      <div key={index} className="mb-2">
        {line.trim() === '' ? (
          <div className="h-2" />
        ) : line.startsWith('💡') ? (
          <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <p className="text-blue-800 dark:text-blue-200 text-sm">{line.replace('💡 ', '')}</p>
          </div>
        ) : line.startsWith('⚠️') ? (
          <div className="flex items-start gap-2 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
            <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
            <p className="text-orange-800 dark:text-orange-200 text-sm">{line.replace('⚠️ ', '')}</p>
          </div>
        ) : line.match(/^\d+\./) ? (
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-primary/20 text-primary rounded-full text-xs flex items-center justify-center font-medium mt-0.5">
              {line.match(/^\d+/)?.[0]}
            </div>
            <p className="text-sm text-foreground flex-1">{line.replace(/^\d+\.\s*/, '')}</p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{line}</p>
        )}
      </div>
    ));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <ExternalLink className="h-4 w-4" />
          Como investir no C6 Bank
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span className="text-2xl">{investmentType.icon}</span>
            <div>
              <div className="flex items-center gap-2">
                Como investir em {investmentType.name}
                {investmentType.c6BankAvailable ? (
                  <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Disponível no C6
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    Não disponível no C6
                  </Badge>
                )}
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Investment Summary */}
          <Card className="bg-muted/30">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-muted-foreground mb-1">Retorno Esperado</p>
                  <p className="text-foreground">{investmentType.expectedReturn}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground mb-1">Investimento Mínimo</p>
                  <p className="text-foreground">R$ {investmentType.minAmount.toLocaleString('pt-BR')}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground mb-1">Liquidez</p>
                  <p className="text-foreground">{investmentType.liquidity}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground mb-1">Nível de Risco</p>
                  <p className="text-foreground">
                    {investmentType.riskLevel === 'low' ? 'Baixo' : 
                     investmentType.riskLevel === 'medium' ? 'Médio' : 'Alto'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {investmentType.c6BankAvailable 
                  ? 'Passo a passo no C6 Bank' 
                  : 'Alternativas para investir'
                }
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {formatInstructions(investmentType.c6BankInstructions)}
              </div>
            </CardContent>
          </Card>

          {/* Additional Info */}
          <Card className="border-dashed">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm mb-1">Sobre este investimento</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {investmentType.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Fechar
          </Button>
          {investmentType.c6BankAvailable && (
            <Button onClick={() => {
              // This would open C6 Bank app if available, for now just show an alert
              alert('Abrindo C6 Bank... (Esta funcionalidade seria integrada com o app do banco)');
            }}>
              Abrir C6 Bank
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};