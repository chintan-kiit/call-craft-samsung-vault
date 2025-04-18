
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.e71949e832f743dc9ec57478e7c78406',
  appName: 'Samsung Call Recorder',
  webDir: 'dist',
  server: {
    url: 'https://e71949e8-32f7-43dc-9ec5-7478e7c78406.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0
    }
  },
  android: {
    backgroundColor: "#1A221A"
  }
};

export default config;
