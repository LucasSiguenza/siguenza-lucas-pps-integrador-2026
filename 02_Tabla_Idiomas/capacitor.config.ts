import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'marlujo.tabla.idiomas',
  appName: '02_Tabla_Idiomas',
  webDir: 'www',
  plugins: {
    SplashScreen: {
      backgroundColor: '#913BC4',
      showSpinner: false,
      androidScaleType: 'CENTER_CROP',
      launchShowDuration: 3000
    }
  }
};

export default config;
