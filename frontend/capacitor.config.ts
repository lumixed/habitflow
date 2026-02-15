import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.jep.habitflow.dev',
    appName: 'HabitFlow',
    webDir: 'out',
    server: {
        androidScheme: 'https',
        cleartext: true
    }
};

export default config;
