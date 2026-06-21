import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.retep.diettracker',
  appName: '飲食記錄',
  webDir: 'dist',
  server: {
    // In production, remove this block entirely so the app runs from the bundled dist
    // androidScheme: 'https',
  },
  ios: {
    contentInset: 'automatic',    // respects safe area / Dynamic Island
    allowsLinkPreview: false,
    scrollEnabled: false,         // we handle scrolling in the web layer
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 800,
      backgroundColor: '#F9F4EE',
      showSpinner: false,
    },
  },
}

export default config
