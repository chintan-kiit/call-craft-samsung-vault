
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.e71949e832f743dc9ec57478e7c78406',
  appName: 'Samsung Call Recorder',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    // Production mode - use built assets
    // Only enable localhost for development
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
    appendUserAgent: "SamsungCallRecorder",
    useLegacyBridge: true,  // Try this for older Android devices
    permissions: [
      "android.permission.READ_EXTERNAL_STORAGE",
      "android.permission.WRITE_EXTERNAL_STORAGE"
    ]
  }
};

export default config;
