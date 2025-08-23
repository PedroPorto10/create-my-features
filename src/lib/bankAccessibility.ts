import { registerPlugin } from '@capacitor/core';

export type BankTransactionEvent = {
  id: string;
  type: 'received' | 'sent';
  amount: number;
  date: number; // epoch ms
  contact: string;
  description?: string;
};

export interface BankAccessibilityPlugin {
  addListener(eventName: 'bankTransaction', listenerFunc: (ev: BankTransactionEvent) => void): Promise<{ remove: () => void }>;
  isEnabled(): Promise<{ enabled: boolean }>;
  openSettings(): Promise<void>;
  drainBacklog(): Promise<{ events: BankTransactionEvent[] }>;
}

const plugin = registerPlugin<BankAccessibilityPlugin>('BankAccessibility');

export const BankAccessibility = {
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