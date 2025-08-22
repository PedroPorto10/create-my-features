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
  openSettings(): Promise<void>;
  drainBacklog(): Promise<{ events: BankNotificationEvent[] }>;
}

const plugin = registerPlugin<BankNotificationsPlugin>('BankNotifications');

export const BankNotifications = {
  addListener: plugin.addListener,
  isEnabled: async (): Promise<boolean> => {
    try {
      const res = await plugin.isEnabled();
      return !!res?.enabled;
    } catch {
      return false;
    }
  },
  openSettings: () => plugin.openSettings(),
  drainBacklog: () => plugin.drainBacklog(),
};
