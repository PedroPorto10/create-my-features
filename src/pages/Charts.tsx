import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTransactions } from '@/hooks/useTransactions';
import { aiService, SpendingCategory } from '@/lib/aiService';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const Charts = () => {
  const navigate = useNavigate();
  const { getMonthlyData, transactions } = useTransactions();
  const [spendingCategories, setSpendingCategories] = useState<SpendingCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  
  const monthlyData = getMonthlyData();

  useEffect(() => {
    const loadSpendingCategories = async () => {
      setLoadingCategories(true);
      try {
        const categories = await aiService.categorizeTransactions(transactions);
        setSpendingCategories(categories);
      } catch (error) {
        console.error('Error loading spending categories:', error);
      } finally {
        setLoadingCategories(false);
      }
    };

    if (transactions.length > 0) {
      loadSpendingCategories();
    }
  }, [transactions]);
  
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
      receivedValue: data.received,
      sentValue: data.sent,
      isPrediction: index >= 3 // Primeiros 3 são históricos (2 anteriores + atual), últimos 2 são previsão
    }));
  };
  
  const chartData = getChartData();
  const hasRealData = chartData.some(d => d.receivedValue > 0 || d.sentValue > 0);
  const title = 'Análise Financeira Completa';
  const receivedColor = '#16a34a'; // Green
  const sentColor = '#dc2626'; // Red
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const isPrediction = data.isPrediction;
      
      return (
        <div className="bg-card border border-border p-3 rounded-lg shadow-lg">
          <p className="font-medium mb-2">
            {label} {isPrediction && <span className="text-orange-600 font-semibold">(Previsão)</span>}
          </p>
          <div className="space-y-1">
            <p className="font-bold text-green-600">
              📈 Recebido{isPrediction ? ' (Previsto)' : ''}: {formatCurrency(data.receivedValue)}
            </p>
            <p className="font-bold text-red-600">
              📉 Enviado{isPrediction ? ' (Previsto)' : ''}: {formatCurrency(data.sentValue)}
            </p>
            <p className="font-bold text-blue-600">
              💰 Saldo{isPrediction ? ' (Previsto)' : ''}: {formatCurrency(data.receivedValue - data.sentValue)}
            </p>
          </div>
          {isPrediction && (
            <p className="text-xs text-orange-600 font-medium mt-2 text-center">
              🔮 Baseado em tendência histórica
            </p>
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
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              navigate('/tables');
            }}
            className="text-primary"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{title}</h1>
            <p className="text-muted-foreground">Últimos 2 meses, atual e próximos 2</p>
          </div>
        </div>
        
        <Card className="bg-gradient-card shadow-card">
          <CardHeader>
            <CardTitle className="text-center">
              Evolução Temporal (Linhas)
            </CardTitle>
            <div className="flex justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-green-600"></div>
                <span>Recebido</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-red-600"></div>
                <span>Enviado</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {hasRealData ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
                  <Line 
                    type="monotone"
                    dataKey="receivedValue" 
                    stroke={receivedColor}
                    strokeWidth={3}
                    strokeDasharray="0"
                    dot={(props: any) => {
                      const { cx, cy, payload } = props;
                      return (
                        <circle
                          cx={cx}
                          cy={cy}
                          r={6}
                          fill={receivedColor}
                          fillOpacity={payload.isPrediction ? 0.85 : 1}
                          stroke={receivedColor}
                          strokeWidth={2}
                          strokeOpacity={payload.isPrediction ? 0.85 : 1}
                        />
                      );
                    }}
                    name="Recebido"
                  />
                  <Line 
                    type="monotone"
                    dataKey="sentValue" 
                    stroke={sentColor}
                    strokeWidth={3}
                    strokeDasharray="0"
                    dot={(props: any) => {
                      const { cx, cy, payload } = props;
                      return (
                        <circle
                          cx={cx}
                          cy={cy}
                          r={6}
                          fill={sentColor}
                          fillOpacity={payload.isPrediction ? 0.85 : 1}
                          stroke={sentColor}
                          strokeWidth={2}
                          strokeOpacity={payload.isPrediction ? 0.85 : 1}
                        />
                      );
                    }}
                    name="Enviado"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-[250px] text-muted-foreground">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-xl font-semibold mb-2">Sem dados disponíveis</h3>
                <p className="text-center text-sm">
                  Faça algumas transações PIX no C6 Bank<br />
                  para ver seus gráficos aqui
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bar Chart */}
        <Card className="bg-gradient-card shadow-card mt-6">
          <CardHeader>
            <CardTitle className="text-center">
              Comparação Mensal (Barras)
            </CardTitle>
            <div className="flex justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-green-600"></div>
                <span>Recebido</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-red-600"></div>
                <span>Enviado</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {hasRealData ? (
              <ResponsiveContainer width="100%" height={250}>
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
                    dataKey="receivedValue" 
                    fill={receivedColor}
                    radius={[4, 4, 0, 0]}
                    fillOpacity={0.8}
                    name="Recebido"
                    shape={(props: any) => {
                      const { fill, x, y, width, height, payload } = props;
                      const opacity = payload?.isPrediction ? 0.85 : 0.8;
                      return (
                        <rect
                          x={x}
                          y={y}
                          width={width}
                          height={height}
                          fill={fill}
                          fillOpacity={opacity}
                          rx={4}
                          ry={4}
                        />
                      );
                    }}
                  />
                  <Bar 
                    dataKey="sentValue" 
                    fill={sentColor}
                    radius={[4, 4, 0, 0]}
                    fillOpacity={0.8}
                    name="Enviado"
                    shape={(props: any) => {
                      const { fill, x, y, width, height, payload } = props;
                      const opacity = payload?.isPrediction ? 0.85 : 0.8;
                      return (
                        <rect
                          x={x}
                          y={y}
                          width={width}
                          height={height}
                          fill={fill}
                          fillOpacity={opacity}
                          rx={4}
                          ry={4}
                        />
                      );
                    }}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-[250px] text-muted-foreground">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-xl font-semibold mb-2">Sem dados disponíveis</h3>
                <p className="text-center text-sm">
                  Faça algumas transações PIX no C6 Bank<br />
                  para ver seus gráficos aqui
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Spending Categories Pie Chart */}
        <Card className="bg-gradient-card shadow-card mt-6">
          <CardHeader>
            <CardTitle className="text-center">
              Categorias de Gastos (IA)
            </CardTitle>
            <p className="text-center text-sm text-muted-foreground">
              Análise inteligente dos seus padrões de gastos
            </p>
          </CardHeader>
          <CardContent>
            {loadingCategories ? (
              <div className="flex items-center justify-center h-[250px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="ml-3 text-muted-foreground">Analisando transações com IA...</p>
              </div>
            ) : spendingCategories.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={spendingCategories}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={false}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="amount"
                      >
                        {spendingCategories.map((entry, index) => {
                          // Darker grey shades array - more visible and elegant
                          const greyShades = [
                            '#CBD5E1', // Medium light grey
                            '#94A3B8', // Medium grey  
                            '#64748B', // Medium dark grey
                            '#475569', // Dark grey
                            '#334155', // Very dark grey
                            '#1E293B', // Almost black grey
                            '#374151', // Cool dark grey
                            '#4B5563', // Neutral dark grey
                            '#6B7280', // Medium cool grey
                          ];
                          return (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={greyShades[index % greyShades.length]} 
                            />
                          );
                        })}
                      </Pie>
                      <Tooltip 
                        formatter={(value: any, name: string) => [
                          formatCurrency(value),
                          'Total Gasto'
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-lg mb-4">Gastos por Categoria</h4>
                  {spendingCategories.map((category, index) => (
                    <div 
                      key={category.category}
                      className="flex items-center justify-between p-3 bg-muted/20 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded"
                          style={{ 
                            backgroundColor: [
                              '#CBD5E1', '#94A3B8', '#64748B', '#475569',
                              '#334155', '#1E293B', '#374151', '#4B5563', '#6B7280'
                            ][index % 9] 
                          }}
                        />
                        <div>
                          <p className="font-medium">{category.category}</p>
                          <p className="text-xs text-muted-foreground">
                            Média/mês: {formatCurrency(category.monthlyAverage)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatCurrency(category.amount)}</p>
                        <p className="text-xs text-muted-foreground">
                          {category.percentage.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[250px] text-muted-foreground">
                <div className="text-6xl mb-4">🤖</div>
                <h3 className="text-xl font-semibold mb-2">Análise IA indisponível</h3>
                <p className="text-center text-sm">
                  Faça algumas transações de gastos<br />
                  para ver a análise inteligente aqui
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Charts;