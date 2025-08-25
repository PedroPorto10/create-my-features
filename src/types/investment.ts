export interface InvestmentType {
  id: string;
  name: string;
  description: string;
  riskLevel: 'low' | 'medium' | 'high';
  expectedReturn: string;
  minAmount: number;
  liquidity: string;
  icon: string;
  c6BankInstructions: string;
  c6BankAvailable: boolean;
}

export interface UserInvestmentPreference {
  selectedType: string;
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  investmentGoal: 'emergency' | 'short_term' | 'long_term' | 'retirement';
  timeHorizon: number; // in months
}