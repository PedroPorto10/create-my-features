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
  isEnabled(): Promise<{ enabled: boolean; batteryOptimized?: boolean }>;
  openSettings(): Promise<void>;
  drainBacklog(): Promise<{ events: BankNotificationEvent[] }>;
  requestBatteryOptimization(): Promise<void>;
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
  isEnabledExtended: async (): Promise<{ enabled: boolean; batteryOptimized: boolean }> => {
    try {
      const res = await plugin.isEnabled();
      return {
        enabled: !!res?.enabled,
        batteryOptimized: !!res?.batteryOptimized
      };
    } catch {
      return { enabled: false, batteryOptimized: true };
    }
  },
  openSettings: () => plugin.openSettings(),
  drainBacklog: () => plugin.drainBacklog(),
  requestBatteryOptimization: () => plugin.requestBatteryOptimization(),
};
