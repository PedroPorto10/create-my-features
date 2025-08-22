import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTransactions } from '@/hooks/useTransactions';
import { useNavigate, useParams } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Charts = () => {
  const navigate = useNavigate();
  const { type } = useParams<{ type: 'received' | 'sent' }>();
  const { getMonthlyData } = useTransactions();
  
  const monthlyData = getMonthlyData();
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0
    }).format(value);
  };
  
  const getChartData = () => {
    return monthlyData.map((data, index) => ({
      ...data,
      value: type === 'received' ? data.received : data.sent,
      isPrediction: index >= 5 // Primeiros 5 são históricos, resto é previsão
    }));
  };
  
  const chartData = getChartData();
  const isReceived = type === 'received';
  const title = isReceived ? 'Transferências Recebidas' : 'Transferências Enviadas';
  const color = isReceived ? '#16a34a' : '#dc2626';
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-border p-3 rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          <p className={`font-bold ${isReceived ? 'text-success' : 'text-expense'}`}>
            {formatCurrency(payload[0].value)}
          </p>
          {data.isPrediction && (
            <p className="text-xs text-muted-foreground">Previsão</p>
          )}
        </div>
      );
    }
    return null;
  };
  
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/tables')}
            className="text-primary"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{title}</h1>
            <p className="text-muted-foreground">Histórico e Previsão (9 meses)</p>
          </div>
        </div>
        
        <Card className="bg-gradient-card shadow-card">
          <CardHeader>
            <CardTitle className="text-center">
              Análise de {isReceived ? 'Recebimentos' : 'Envios'}
            </CardTitle>
            <div className="flex justify-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded ${isReceived ? 'bg-success' : 'bg-expense'}`}></div>
                <span>Histórico</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded ${isReceived ? 'bg-success/50' : 'bg-expense/50'}`}></div>
                <span>Previsão</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => 
                    new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                      minimumFractionDigits: 0,
                      notation: 'compact'
                    }).format(value)
                  }
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="value" 
                  fill={color}
                  radius={[4, 4, 0, 0]}
                  fillOpacity={0.9}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-2 gap-4 mt-6">
          <Card className="bg-gradient-card shadow-card">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Média Mensal</p>
                <p className="text-xl font-bold text-balance">
                  {formatCurrency(
                    chartData.slice(0, 5).reduce((sum, d) => sum + d.value, 0) / 5
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-card shadow-card">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Previsão Próximo Mês</p>
                <p className="text-xl font-bold text-balance">
                  {formatCurrency(chartData[5]?.value || 0)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Charts;