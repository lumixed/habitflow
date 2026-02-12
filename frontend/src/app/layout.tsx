import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import { AuthProvider } from '@/contexts/AuthContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'HabitFlow',
    description: 'Build habits, stay accountable, achieve your goals.',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className={`${inter.className} min-h-screen bg-neutral-50 text-neutral-800`}>
                <AuthProvider>{children}</AuthProvider>
            </body>
        </html>
    );
}
