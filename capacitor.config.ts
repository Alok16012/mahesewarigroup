import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.maheshwarigroup.app",
  appName: "Maheshwari Group",
  // Load the live Vercel deployment — no static export needed
  server: {
    url: "https://mahesewarigroup.vercel.app",
    cleartext: false,
  },
  android: {
    buildOptions: {
      releaseType: "APK",
    },
  },
};

export default config;
