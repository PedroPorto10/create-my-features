import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.f395cb8c947c49bbb0566cc2a825f358',
  appName: 'create-my-features',
  webDir: 'dist',
  server: {
    url: "https://f395cb8c-947c-49bb-b056-6cc2a825f358.lovableproject.com?forceHideBadge=true",
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0
    }
  },
  android: {
    buildOptions: {
      keystorePath: undefined,
      keystoreAlias: undefined,
      keystoreAliasPassword: undefined,
      keystorePassword: undefined,
      releaseType: "APK",
      signingType: "apksigner"
    }
  }
};

export default config;