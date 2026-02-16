import type { Metadata } from 'next';
import { Inter, Roboto, Outfit, Poppins, Montserrat } from 'next/font/google';
import '@/styles/globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import MobileNav from '@/components/MobileNav';
import { KeyboardShortcutsProvider } from '@/components/KeyboardShortcutsProvider';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const roboto = Roboto({ weight: ['400', '700', '900'], subsets: ['latin'], variable: '--font-roboto' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });
const poppins = Poppins({ weight: ['400', '600', '800'], subsets: ['latin'], variable: '--font-poppins' });
const montserrat = Montserrat({ subsets: ['latin'], variable: '--font-montserrat' });


export const metadata: Metadata = {
    title: 'HabitFlow',
    description: 'Build habits, stay accountable, achieve your goals.',
    manifest: '/manifest.json',
    themeColor: '#000000',
    viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover',
};


export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className={`${inter.variable} ${roboto.variable} ${outfit.variable} ${poppins.variable} ${montserrat.variable}`}>
            <body className={`min-h-screen bg-neutral-50 text-neutral-800 pb-20 md:pb-0 safe-area-pt safe-area-pb`}>
                <AuthProvider>
                    <ThemeProvider>
                        <KeyboardShortcutsProvider>
                            {children}
                            <MobileNav />
                        </KeyboardShortcutsProvider>
                    </ThemeProvider>
                </AuthProvider>
            </body>

        </html>
    );
}
