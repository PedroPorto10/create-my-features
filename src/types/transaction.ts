export interface Transaction {
  id: string;
  type: 'received' | 'sent';
  amount: number;
  date: Date;
  contact: string;
  description?: string;
  category?: 'Alimentação' | 'Laser' | 'Contas' | 'Transporte' | 'Outros';
}

export interface MonthlyData {
  month: string;
  received: number;
  sent: number;
}