import { InvestmentType } from '../types/investment';

export const investmentTypes: InvestmentType[] = [
  {
    id: 'poupanca',
    name: 'Poupança',
    description: 'Investimento tradicional e seguro, ideal para iniciantes. Rendimento atrelado à Selic com liquidez diária.',
    riskLevel: 'low',
    expectedReturn: '0.5% ao mês',
    minAmount: 1,
    liquidity: 'Diária',
    icon: '🏦',
    c6BankAvailable: true,
    c6BankInstructions: '1. Abra o app C6 Bank\n2. Vá em "Investir"\n3. Selecione "Poupança"\n4. Digite o valor desejado\n5. Confirme a transferência\n\n💡 A poupança do C6 Bank rende automaticamente e você pode sacar a qualquer momento sem perder rentabilidade.'
  },
  {
    id: 'cdb',
    name: 'CDB (Certificado de Depósito Bancário)',
    description: 'Título de renda fixa emitido por bancos. Oferece rendimento superior à poupança com garantia do FGC.',
    riskLevel: 'low',
    expectedReturn: '100-130% do CDI',
    minAmount: 100,
    liquidity: 'Varia (30 dias a 5 anos)',
    icon: '🏛️',
    c6BankAvailable: true,
    c6BankInstructions: '1. Abra o app C6 Bank\n2. Vá em "Investir" → "Renda Fixa"\n3. Escolha "CDB C6 Bank" ou outros CDBs disponíveis\n4. Compare os prazos e rentabilidades\n5. Selecione o CDB desejado\n6. Digite o valor a investir\n7. Leia os termos e confirme\n\n💡 O C6 Bank oferece CDBs próprios e de outras instituições. Fique atento ao prazo de vencimento!'
  },
  {
    id: 'lci_lca',
    name: 'LCI/LCA',
    description: 'Letras de Crédito do Agronegócio e Imobiliário. Renda fixa com isenção de IR para pessoa física.',
    riskLevel: 'low',
    expectedReturn: '80-100% do CDI',
    minAmount: 1000,
    liquidity: '90 dias mínimo',
    icon: '🌾',
    c6BankAvailable: true,
    c6BankInstructions: '1. Abra o app C6 Bank\n2. Vá em "Investir" → "Renda Fixa"\n3. Procure por "LCI" ou "LCA"\n4. Compare as opções disponíveis\n5. Selecione a LCI/LCA desejada\n6. Digite o valor (mín. R$ 1.000)\n7. Confirme o investimento\n\n💡 LCI/LCA são isentas de IR! Ideais para quem está na faixa de 15% ou mais de imposto de renda.'
  },
  {
    id: 'tesouro_selic',
    name: 'Tesouro Selic',
    description: 'Título público do governo brasileiro atrelado à taxa Selic. Baixo risco com liquidez diária.',
    riskLevel: 'low',
    expectedReturn: '100% da Selic',
    minAmount: 30,
    liquidity: 'Diária',
    icon: '🏛️',
    c6BankAvailable: true,
    c6BankInstructions: '1. Abra o app C6 Bank\n2. Vá em "Investir" → "Tesouro Direto"\n3. Selecione "Tesouro Selic"\n4. Escolha o título disponível\n5. Digite o valor (mín. R$ 30)\n6. Revise e confirme\n\n💡 O Tesouro Selic acompanha a taxa básica de juros e é ideal para reserva de emergência. O C6 Bank não cobra taxa de custódia até R$ 10.000!'
  },
  {
    id: 'tesouro_ipca',
    name: 'Tesouro IPCA+',
    description: 'Título público que protege contra a inflação. Ideal para investimentos de longo prazo.',
    riskLevel: 'medium',
    expectedReturn: 'IPCA + 4-6% ao ano',
    minAmount: 30,
    liquidity: 'Diária (com risco de perda)',
    icon: '📈',
    c6BankAvailable: true,
    c6BankInstructions: '1. Abra o app C6 Bank\n2. Vá em "Investir" → "Tesouro Direto"\n3. Selecione "Tesouro IPCA+"\n4. Escolha o vencimento desejado (2029, 2035, etc.)\n5. Digite o valor a investir\n6. Confirme a operação\n\n💡 Ideal para objetivos de longo prazo! Se vender antes do vencimento, pode ter ganho ou perda dependendo da oscilação dos juros.'
  },
  {
    id: 'fundos_rf',
    name: 'Fundos de Renda Fixa',
    description: 'Fundos que investem em títulos de renda fixa. Diversificação gerenciada por especialistas.',
    riskLevel: 'low',
    expectedReturn: '90-110% do CDI',
    minAmount: 100,
    liquidity: 'D+1 a D+30',
    icon: '📊',
    c6BankAvailable: true,
    c6BankInstructions: '1. Abra o app C6 Bank\n2. Vá em "Investir" → "Fundos"\n3. Filtre por "Renda Fixa"\n4. Compare rentabilidade, taxa de administração e prazo\n5. Selecione o fundo desejado\n6. Digite o valor inicial\n7. Confirme o investimento\n\n💡 O C6 Bank oferece vários fundos de renda fixa. Fique atento às taxas de administração e ao prazo de cotização!'
  },
  {
    id: 'fundos_multimercado',
    name: 'Fundos Multimercado',
    description: 'Fundos com estratégias diversificadas em várias classes de ativos. Maior flexibilidade de investimento.',
    riskLevel: 'medium',
    expectedReturn: '8-15% ao ano',
    minAmount: 500,
    liquidity: 'D+1 a D+30',
    icon: '🔄',
    c6BankAvailable: true,
    c6BankInstructions: '1. Abra o app C6 Bank\n2. Vá em "Investir" → "Fundos"\n3. Selecione "Multimercado"\n4. Analise o histórico e estratégia do fundo\n5. Verifique taxa de administração e performance\n6. Defina o valor a investir\n7. Confirme a aplicação\n\n💡 Fundos multimercado podem investir em ações, renda fixa, moedas, etc. São mais voláteis mas podem render mais.'
  },
  {
    id: 'acoes',
    name: 'Ações',
    description: 'Participação no capital de empresas. Alto potencial de retorno com maior risco e volatilidade.',
    riskLevel: 'high',
    expectedReturn: '10-20% ao ano (variável)',
    minAmount: 50,
    liquidity: 'Diária (horário de mercado)',
    icon: '📈',
    c6BankAvailable: true,
    c6BankInstructions: '1. Abra o app C6 Bank\n2. Vá em "Investir" → "Ações"\n3. Pesquise pelo código da ação (ex: PETR4, VALE3)\n4. Analise gráficos e informações da empresa\n5. Defina quantidade ou valor\n6. Escolha "Mercado" ou "Limitada"\n7. Confirme a compra\n\n💡 Ações oscilam muito! Comece pequeno e estude antes. C6 Bank oferece corretagem zero para pessoas físicas.'
  },
  {
    id: 'etfs',
    name: 'ETFs (Exchange Traded Funds)',
    description: 'Fundos que replicam índices do mercado. Diversificação instantânea com baixo custo.',
    riskLevel: 'medium',
    expectedReturn: '8-12% ao ano',
    minAmount: 50,
    liquidity: 'Diária (horário de mercado)',
    icon: '📊',
    c6BankAvailable: true,
    c6BankInstructions: '1. Abra o app C6 Bank\n2. Vá em "Investir" → "Ações"\n3. Procure por ETFs (ex: BOVA11, IVVB11, SMAL11)\n4. Analise qual índice o ETF replica\n5. Defina a quantidade de cotas\n6. Execute a compra\n\n💡 ETFs são ótimos para diversificar! BOVA11 replica o Ibovespa, IVVB11 replica o S&P 500. Taxa de administração baixa.'
  },
  {
    id: 'fiis',
    name: 'FIIs (Fundos Imobiliários)',
    description: 'Investimento no mercado imobiliário sem precisar comprar imóveis. Recebimento de dividendos mensais.',
    riskLevel: 'medium',
    expectedReturn: '6-12% ao ano + dividendos',
    minAmount: 100,
    liquidity: 'Diária (horário de mercado)',
    icon: '🏢',
    c6BankAvailable: true,
    c6BankInstructions: '1. Abra o app C6 Bank\n2. Vá em "Investir" → "Ações"\n3. Procure por FIIs (cotas terminam com 11, ex: HGLG11, XPML11)\n4. Analise o segmento (logística, escritórios, shopping, etc.)\n5. Verifique dividend yield e vacancia\n6. Compre as cotas desejadas\n\n💡 FIIs pagam dividendos mensais isentos de IR! Analise a qualidade dos imóveis e gestão do fundo.'
  },
  {
    id: 'criptomoedas',
    name: 'Criptomoedas',
    description: 'Moedas digitais descentralizadas. Alto potencial de ganho com risco elevado e alta volatilidade.',
    riskLevel: 'high',
    expectedReturn: 'Muito variável',
    minAmount: 10,
    liquidity: '24/7',
    icon: '₿',
    c6BankAvailable: false,
    c6BankInstructions: 'O C6 Bank não oferece negociação direta de criptomoedas. Para investir em crypto:\n\n1. Use exchanges como Binance, Coinbase, Mercado Bitcoin\n2. Ou considere ETFs de criptomoedas (quando disponíveis)\n3. Fundos multimercado que investem em crypto\n\n⚠️ Atenção: Criptomoedas são extremamente voláteis e arriscadas. Invista apenas o que pode perder!'
  },
  {
    id: 'ouro',
    name: 'Ouro',
    description: 'Metal precioso tradicionalmente usado como reserva de valor. Proteção contra inflação e crises.',
    riskLevel: 'medium',
    expectedReturn: '5-8% ao ano',
    minAmount: 100,
    liquidity: 'D+1',
    icon: '🥇',
    c6BankAvailable: true,
    c6BankInstructions: '1. Abra o app C6 Bank\n2. Vá em "Investir" → "Ações"\n3. Procure por "IAU39" (ETF de Ouro em dólar)\n4. Ou ETFs de ouro nacionais se disponíveis\n5. Analise a cotação do ouro\n6. Execute a compra\n\n💡 Não há ouro físico no C6, mas sim ETFs que replicam a cotação. É uma forma prática de investir no metal.'
  }
];

export const getRiskColor = (risk: 'low' | 'medium' | 'high'): string => {
  switch (risk) {
    case 'low':
      return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20';
    case 'medium':
      return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20';
    case 'high':
      return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20';
  }
};

export const getRiskLabel = (risk: 'low' | 'medium' | 'high'): string => {
  switch (risk) {
    case 'low':
      return 'Baixo Risco';
    case 'medium':
      return 'Risco Médio';
    case 'high':
      return 'Alto Risco';
  }
};