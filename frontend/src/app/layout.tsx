import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import MobileNav from '@/components/MobileNav';
import { KeyboardShortcutsProvider } from '@/components/KeyboardShortcutsProvider';
import { useEffect, useState } from 'react';
import InstallPrompt from '@/components/PWA/InstallPrompt';

const inter = Inter({ subsets: ['latin'] });


export const metadata: Metadata = {
    title: 'HabitFlow',
    description: 'Build habits, stay accountable, achieve your goals.',
    manifest: '/manifest.json',
};

export const viewport: Viewport = {
    themeColor: '#000000',
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover',
};


export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className={inter.className}>
            <body className={`min-h-screen bg-neutral-50 text-neutral-800 pb-20 md:pb-0 safe-area-pt safe-area-pb`}>
                <AuthProvider>
                    <ThemeProvider>
                        <KeyboardShortcutsProvider>
                            {children}
                            <MobileNav />
                            <InstallPrompt />
                        </KeyboardShortcutsProvider>
                    </ThemeProvider>
                </AuthProvider>
            </body>

        </html>
    );
}
