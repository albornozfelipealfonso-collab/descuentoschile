import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tuempresa.carddiscount',
  appName: 'CardDiscount',
  webDir: 'dist', // o 'build' si usas Create React App
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#060708",
      showSpinner: false
    },
    StatusBar: {
      style: "dark",
      backgroundColor: "#060708"
    }
  }
};

export default config;