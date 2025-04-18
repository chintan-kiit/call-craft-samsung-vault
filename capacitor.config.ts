
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.e71949e832f743dc9ec57478e7c78406',
  appName: 'Samsung Call Recorder',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0
    }
  },
  android: {
    backgroundColor: "#1A221A",
    buildOptions: {
      keystorePath: 'release-key.keystore',
      keystoreAlias: 'key0',
      minSdkVersion: 24,
      targetSdkVersion: 33
    }
  }
};

export default config;

