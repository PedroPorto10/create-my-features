import { useState, useEffect } from 'react';
import { Table2, Wallet, TrendingUp, TrendingDown, DollarSign, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTransactions } from '@/hooks/useTransactions';
import { aiService, InvestmentInsight } from '@/lib/aiService';
import { useNavigate } from 'react-router-dom';
import { Transaction } from '../types/transaction';
import { HybridBankNotifications } from '../lib/hybridBankNotifications';
import { PermissionDialog } from '../components/PermissionDialog';

const Index = () => {
  const navigate = useNavigate();
  const { transactions } = useTransactions();
  const [investmentInsight, setInvestmentInsight] = useState<InvestmentInsight | null>(null);
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [serviceStatus, setServiceStatus] = useState({ enabled: false, notificationEnabled: false, accessibilityEnabled: false });
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);

  
  useEffect(() => {
    const loadInvestmentInsight = async () => {
      setLoadingInsight(true);
      try {
        const insight = await aiService.generateInvestmentInsight(transactions);
        setInvestmentInsight(insight);
      } catch (error) {
        console.error('Error loading investment insight:', error);
      } finally {
        setLoadingInsight(false);
      }
    };

    loadInvestmentInsight();
    
    // Check service status
    HybridBankNotifications.isEnabled().then(status => {
      setServiceStatus(status);
      
      // Show permission dialog if no services are enabled and we have no transactions
      if (!status.enabled && transactions.length === 0) {
        // Wait a moment to let the UI settle
        setTimeout(() => setShowPermissionDialog(true), 1000);
      }
    });
  }, [transactions]);
  
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
  
  

  const handlePermissionComplete = () => {
    setShowPermissionDialog(false);
    // Refresh service status
    HybridBankNotifications.isEnabled().then(status => {
      setServiceStatus(status);
    });
  };
  
  // Permission dialog removed - always show main app
  
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
              <h1 className="text-3xl font-bold text-foreground">Finance</h1>
              <p className="text-muted-foreground text-lg">Organize suas finanças</p>
            </div>
          </div>
        </div>
        
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

        {/* AI Investment Insights */}
        <Card className="bg-gradient-primary shadow-xl mb-8 rounded-2xl">
          <CardContent className="p-6">
            {loadingInsight ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-foreground"></div>
                <p className="ml-3 text-primary-foreground/80">Gerando insights de IA...</p>
              </div>
            ) : investmentInsight ? (
              <div>
                <div className="text-center mb-6">
                  <p className="text-primary-foreground/80 text-sm mb-1">💡 Insight de Investimento (IA)</p>
                  <p className="text-2xl font-bold text-primary-foreground">
                    Poupe {formatCurrency(investmentInsight.recommendedSavings)}/mês
                  </p>
                  <p className="text-primary-foreground/70 text-sm">
                    {investmentInsight.savingsPercentage.toFixed(1)}% da sua renda
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-primary-foreground/70 text-xs">Renda Mensal</p>
                    <p className="text-lg font-semibold text-primary-foreground">
                      {formatCurrency(investmentInsight.monthlyIncome)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-primary-foreground/70 text-xs">Gastos Mensais</p>
                    <p className="text-lg font-semibold text-primary-foreground">
                      {formatCurrency(investmentInsight.monthlyExpenses)}
                    </p>
                  </div>
                </div>
                
                <div className="bg-primary-foreground/10 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-primary-foreground/20 rounded-full flex items-center justify-center">
                      <span className="text-xs">💎</span>
                    </div>
                    <span className="font-medium text-primary-foreground text-sm">
                      {investmentInsight.investmentType}
                    </span>
                  </div>
                  <p className="text-primary-foreground/80 text-xs leading-relaxed">
                    {investmentInsight.recommendation}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-primary-foreground/80 text-sm">
                  Faça algumas transações para receber insights personalizados
                </p>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Service Setup Card for users with no transactions */}
        {transactions.length === 0 && (
          <Card className="bg-gradient-card shadow-xl rounded-2xl">
            <CardContent className="px-6 py-8">
              <div className="text-center text-muted-foreground">
                <div className="p-6 bg-muted/10 rounded-3xl inline-block mb-6">
                  <Wallet className="h-20 w-20 mx-auto opacity-50" />
                </div>
                <p className="mb-3 text-xl font-medium">Nenhuma transação encontrada</p>
                <p className="text-base mb-6">Faça uma transação PIX no C6 Bank para começar</p>
                
                {!serviceStatus.enabled && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-2xl border border-blue-200 dark:border-blue-800">
                    <Settings className="h-12 w-12 mx-auto mb-4 text-blue-600 dark:text-blue-400" />
                    <p className="text-blue-800 dark:text-blue-200 font-medium mb-4">Configure os serviços para capturar transações</p>
                    <div className="space-y-2">
                      <Button 
                        onClick={() => HybridBankNotifications.openNotificationSettings()}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        size="sm"
                      >
                        1. Habilitar Acesso a Notificações
                      </Button>
                      <Button 
                        onClick={() => HybridBankNotifications.openAccessibilitySettings()}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        size="sm"
                      >
                        2. Habilitar Acessibilidade (backup)
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Index;