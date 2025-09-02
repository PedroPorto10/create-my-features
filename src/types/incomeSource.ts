export interface IncomeSource {
  id: string;
  name: string; // e.g., "Empresa XYZ", "Freelance", "Aposentadoria"
  type: 'work' | 'freelance' | 'investment' | 'pension' | 'benefits' | 'other';
  contactPattern: string; // Pattern to match transaction contacts
  expectedAmount?: number; // Expected monthly amount
  isActive: boolean;
}

export interface IncomeAnalysis {
  workIncome: number;
  otherIncome: number;
  totalIncome: number;
  incomeBreakdown: {
    sourceId: string;
    sourceName: string;
    type: IncomeSource['type'];
    amount: number;
  }[];
}