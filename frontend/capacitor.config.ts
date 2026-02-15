import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.habitflow.app',
    appName: 'HabitFlow',
    webDir: 'out',
    server: {
        androidScheme: 'https',
        cleartext: true
    }
};

export default config;
