import { registerPlugin } from '@capacitor/core';

export type BankTransactionEvent = {
  id: string;
  type: 'received' | 'sent';
  amount: number;
  date: number; // epoch ms
  contact: string;
  description?: string;
};

export interface HybridBankNotificationsPlugin {
  addListener(eventName: 'bankTransaction', listenerFunc: (ev: BankTransactionEvent) => void): Promise<{ remove: () => void }>;
  isEnabled(): Promise<{ 
    enabled: boolean; 
    notificationEnabled: boolean; 
    accessibilityEnabled: boolean; 
  }>;
  openNotificationSettings(): Promise<void>;
  openAccessibilitySettings(): Promise<void>;
  drainBacklog(): Promise<{ events: BankTransactionEvent[] }>;
}

const plugin = registerPlugin<HybridBankNotificationsPlugin>('HybridBankNotifications');

export const HybridBankNotifications = {
  addListener: plugin.addListener,
  isEnabled: async () => {
    try {
      const res = await plugin.isEnabled();
      return {
        enabled: !!res?.enabled,
        notificationEnabled: !!res?.notificationEnabled,
        accessibilityEnabled: !!res?.accessibilityEnabled
      };
    } catch {
      return { enabled: false, notificationEnabled: false, accessibilityEnabled: false };
    }
  },
  openNotificationSettings: () => plugin.openNotificationSettings(),
  openAccessibilitySettings: () => plugin.openAccessibilitySettings(),
  drainBacklog: () => plugin.drainBacklog(),
};