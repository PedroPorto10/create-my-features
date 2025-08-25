import { GoogleGenerativeAI } from '@google/generative-ai';
import { Transaction } from '../types/transaction';

// Initialize the AI with API key (you'll need to add this to your .env file)
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');

export interface SpendingCategory {
  category: string;
  amount: number;
  percentage: number;
  transactions: Transaction[];
  monthlyAverage: number;
}

export interface InvestmentInsight {
  recommendedSavings: number;
  savingsPercentage: number;
  investmentType: string;
  recommendation: string;
  monthlyExpenses: number;
  monthlyIncome: number;
}

export class AIService {
  private model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  async categorizeTransactions(transactions: Transaction[]): Promise<SpendingCategory[]> {
    if (transactions.length === 0) return [];

    // Filter only sent (expense) transactions
    const expenses = transactions.filter(t => t.type === 'sent');
    
    if (expenses.length === 0) return [];

    // Group transactions by contact to analyze patterns
    const contactGroups = expenses.reduce((acc, t) => {
      if (!acc[t.contact]) acc[t.contact] = [];
      acc[t.contact].push(t);
      return acc;
    }, {} as Record<string, Transaction[]>);

    try {
      const prompt = `
Analise os seguintes contatos e categorize-os em setores de gastos. Para cada contato, forneça apenas uma categoria principal baseada no nome/tipo de estabelecimento:

Contatos: ${Object.keys(contactGroups).join(', ')}

Categorias possíveis:
- Alimentação (restaurantes, delivery, mercados)
- Transporte (uber, 99, combustível, estacionamento)
- Entretenimento (cinema, streaming, jogos, bares)
- Saúde (farmácias, médicos, exames)
- Educação (cursos, livros, universidade)
- Roupas (lojas de vestuário, calçados)
- Casa (móveis, decoração, limpeza)
- Serviços (cabelereiro, academia, manutenção)
- Outros

Responda APENAS no formato JSON:
{
  "categories": {
    "nome_do_contato": "categoria"
  }
}
`;

      const result = await this.model.generateContent(prompt);
      const responseText = result.response.text();
      
      // Clean and parse JSON response
      const cleanText = responseText.replace(/```json\n?|\n?```/g, '').trim();
      const parsed = JSON.parse(cleanText);
      
      // Group by categories
      const categoryGroups: Record<string, Transaction[]> = {};
      
      Object.entries(parsed.categories).forEach(([contact, category]) => {
        const categoryName = category as string;
        if (contactGroups[contact]) {
          if (!categoryGroups[categoryName]) categoryGroups[categoryName] = [];
          categoryGroups[categoryName].push(...contactGroups[contact]);
        }
      });

      // Calculate totals and create spending categories
      const totalAmount = expenses.reduce((sum, t) => sum + t.amount, 0);
      
      const categories: SpendingCategory[] = Object.entries(categoryGroups).map(([category, txs]) => {
        const amount = txs.reduce((sum, t) => sum + t.amount, 0);
        
        // Calculate monthly average based on transaction dates
        const monthsSpan = this.getMonthsSpan(txs);
        const monthlyAverage = monthsSpan > 0 ? amount / monthsSpan : amount;
        
        return {
          category,
          amount,
          percentage: (amount / totalAmount) * 100,
          transactions: txs,
          monthlyAverage
        };
      }).sort((a, b) => b.amount - a.amount);

      return categories;
    } catch (error) {
      console.error('Error categorizing transactions:', error);
      // Fallback: simple categorization by keywords
      return this.fallbackCategorization(expenses);
    }
  }

  async generateInvestmentInsight(transactions: Transaction[]): Promise<InvestmentInsight> {
    if (transactions.length === 0) {
      return {
        recommendedSavings: 0,
        savingsPercentage: 20,
        investmentType: 'Reserva de Emergência',
        recommendation: 'Comece a rastrear suas transações para receber insights personalizados.',
        monthlyExpenses: 0,
        monthlyIncome: 0
      };
    }

    // Calculate monthly income and expenses
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const currentMonthTxs = transactions.filter(t => 
      t.date.getMonth() === currentMonth && 
      t.date.getFullYear() === currentYear
    );

    const monthlyIncome = currentMonthTxs
      .filter(t => t.type === 'received')
      .reduce((sum, t) => sum + t.amount, 0);

    const monthlyExpenses = currentMonthTxs
      .filter(t => t.type === 'sent')
      .reduce((sum, t) => sum + t.amount, 0);

    try {
      const prompt = `
Como consultor financeiro, analise o perfil financeiro e forneça recomendações:

Renda mensal: R$ ${monthlyIncome.toFixed(2)}
Gastos mensais: R$ ${monthlyExpenses.toFixed(2)}
Saldo mensal: R$ ${(monthlyIncome - monthlyExpenses).toFixed(2)}

Com base nestes dados, recomende:
1. Quanto poupar por mês (valor absoluto e percentual da renda)
2. Tipo de investimento mais adequado
3. Justificativa da recomendação

Considere:
- 50-30-20 rule (50% necessidades, 30% desejos, 20% poupança)
- Reserva de emergência como prioridade
- Perfil conservador para iniciantes

Responda APENAS no formato JSON:
{
  "recommendedSavings": valor_numerico,
  "savingsPercentage": percentual_numerico,
  "investmentType": "tipo_do_investimento",
  "recommendation": "explicacao_detalhada"
}
`;

      const result = await this.model.generateContent(prompt);
      const responseText = result.response.text();
      
      const cleanText = responseText.replace(/```json\n?|\n?```/g, '').trim();
      const parsed = JSON.parse(cleanText);
      
      return {
        recommendedSavings: parsed.recommendedSavings || 0,
        savingsPercentage: parsed.savingsPercentage || 20,
        investmentType: parsed.investmentType || 'Reserva de Emergência',
        recommendation: parsed.recommendation || 'Mantenha disciplina financeira e comece poupando regularmente.',
        monthlyExpenses,
        monthlyIncome
      };
    } catch (error) {
      console.error('Error generating investment insight:', error);
      
      // Fallback calculation
      const savingsPercentage = monthlyIncome > 0 ? Math.min(20, Math.max(5, ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100)) : 20;
      const recommendedSavings = (monthlyIncome * savingsPercentage) / 100;
      
      return {
        recommendedSavings,
        savingsPercentage,
        investmentType: recommendedSavings < 1000 ? 'Poupança' : 'CDB',
        recommendation: `Com base em sua renda de R$ ${monthlyIncome.toFixed(2)} e gastos de R$ ${monthlyExpenses.toFixed(2)}, recomendo poupar ${savingsPercentage.toFixed(1)}% da renda mensal. Foque primeiro em construir uma reserva de emergência de 6 meses de gastos.`,
        monthlyExpenses,
        monthlyIncome
      };
    }
  }

  private getMonthsSpan(transactions: Transaction[]): number {
    if (transactions.length === 0) return 1;
    
    const dates = transactions.map(t => t.date).sort((a, b) => a.getTime() - b.getTime());
    const firstDate = dates[0];
    const lastDate = dates[dates.length - 1];
    
    const monthsDiff = (lastDate.getFullYear() - firstDate.getFullYear()) * 12 + 
                      (lastDate.getMonth() - firstDate.getMonth()) + 1;
    
    return Math.max(1, monthsDiff);
  }

  private fallbackCategorization(expenses: Transaction[]): SpendingCategory[] {
    const categories: Record<string, Transaction[]> = {
      'Outros': []
    };

    // Simple keyword-based categorization
    expenses.forEach(t => {
      const contact = t.contact.toLowerCase();
      let category = 'Outros';

      if (contact.includes('restaurante') || contact.includes('food') || contact.includes('lanche') || 
          contact.includes('pizza') || contact.includes('burger')) {
        category = 'Alimentação';
      } else if (contact.includes('uber') || contact.includes('99') || contact.includes('taxi') || 
                 contact.includes('combustível')) {
        category = 'Transporte';
      } else if (contact.includes('cinema') || contact.includes('netflix') || contact.includes('spotify')) {
        category = 'Entretenimento';
      } else if (contact.includes('farmácia') || contact.includes('médico') || contact.includes('hospital')) {
        category = 'Saúde';
      }

      if (!categories[category]) categories[category] = [];
      categories[category].push(t);
    });

    const totalAmount = expenses.reduce((sum, t) => sum + t.amount, 0);

    return Object.entries(categories)
      .filter(([, txs]) => txs.length > 0)
      .map(([category, txs]) => {
        const amount = txs.reduce((sum, t) => sum + t.amount, 0);
        const monthsSpan = this.getMonthsSpan(txs);
        
        return {
          category,
          amount,
          percentage: (amount / totalAmount) * 100,
          transactions: txs,
          monthlyAverage: amount / monthsSpan
        };
      })
      .sort((a, b) => b.amount - a.amount);
  }
}

export const aiService = new AIService();