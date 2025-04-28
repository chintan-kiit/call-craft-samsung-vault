
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.e71949e832f743dc9ec57478e7c78406',
  appName: 'Samsung Call Recorder',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0
    },
    Filesystem: {
      androidPermissions: [
        "android.permission.READ_EXTERNAL_STORAGE",
        "android.permission.WRITE_EXTERNAL_STORAGE",
        "android.permission.READ_MEDIA_AUDIO",
        "android.permission.READ_MEDIA_IMAGES",
        "android.permission.MANAGE_EXTERNAL_STORAGE"
      ]
    },
    App: {
      webViewAllowOverscroll: false
    }
  },
  android: {
    backgroundColor: "#1A221A",
    allowMixedContent: true,
    webContentsDebuggingEnabled: true,
    appendUserAgent: "SamsungCallRecorder",
    useLegacyBridge: true,
    permissions: [
      "android.permission.READ_EXTERNAL_STORAGE",
      "android.permission.WRITE_EXTERNAL_STORAGE",
      "android.permission.READ_MEDIA_AUDIO",
      "android.permission.READ_MEDIA_IMAGES",
      "android.permission.MANAGE_EXTERNAL_STORAGE",
      "android.permission.READ_PHONE_STATE",
      "android.permission.RECORD_AUDIO",
      "android.permission.READ_CONTACTS"
    ],
    includePlugins: [
      "@capacitor/filesystem",
      "@capacitor/app",
      "@capacitor/device",
      "@capacitor/toast"
    ],
  }
};

export default config;
