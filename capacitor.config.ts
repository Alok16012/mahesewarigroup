import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.maheshwarigroup.app",
  appName: "Maheshwari Group",
  server: {
    url: "https://mahesewarigroup.vercel.app",
    cleartext: false,
  },
  android: {
    backgroundColor: "#1e1b4b",
    allowMixedContent: false,
    webContentsDebuggingEnabled: false,
    buildOptions: {
      releaseType: "APK",
    },
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#1e1b4b",
      showSpinner: false,
      androidScaleType: "CENTER_CROP",
    },
  },
};

export default config;
