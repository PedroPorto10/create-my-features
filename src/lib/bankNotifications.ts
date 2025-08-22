import { registerPlugin } from '@capacitor/core';

export type BankNotificationEvent = {
  id: string;
  type: 'received' | 'sent';
  amount: number;
  date: number; // epoch ms
  contact: string;
  description?: string;
};

export interface BankNotificationsPlugin {
  addListener(eventName: 'bankNotification', listenerFunc: (ev: BankNotificationEvent) => void): Promise<{ remove: () => void }>;
  isEnabled(): Promise<{ enabled: boolean }>;
}

export const BankNotifications = registerPlugin<BankNotificationsPlugin>('BankNotifications');