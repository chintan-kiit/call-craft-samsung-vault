
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.e71949e832f743dc9ec57478e7c78406',
  appName: 'Samsung Call Recorder',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    // Use local dev server instead of remote URL
    url: 'http://localhost:8080',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0
    },
    Permissions: {
      requestOnPermission: true
    }
  },
  android: {
    backgroundColor: "#1A221A",
    allowMixedContent: true,
    webContentsDebuggingEnabled: true,
    appendUserAgent: "SamsungCallRecorder"
  }
};

export default config;
