export interface Transaction {
  id: string;
  type: 'received' | 'sent';
  amount: number;
  date: Date;
  contact: string;
  description?: string;
}

export interface MonthlyData {
  month: string;
  received: number;
  sent: number;
}