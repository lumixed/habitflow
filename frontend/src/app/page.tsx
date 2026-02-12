'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function HomePage() {
    const router = useRouter();
    const { user, isLoading } = useAuth();

    useEffect(() => {
        if (!isLoading && user) {
            router.push('/dashboard');
        }
    }, [user, isLoading, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-pulse text-neutral-400">Loading...</div>
            </div>
        );
    }

    if (user) {
        return null;
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-white">
            {/* Logo / Brand */}
            <div className="mb-12 text-center">
                <h1 className="text-4xl font-black text-neutral-900 uppercase tracking-tighter">
                    Habit<span className="text-primary-500">Flow</span>
                </h1>
                <p className="mt-4 text-xs font-bold text-neutral-400 uppercase tracking-widest max-w-xs mx-auto leading-relaxed">
                    Build habits that stick. Stay accountable with friends. Track your streaks.
                </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 w-full max-w-[280px]">
                <Link
                    href="/auth/signup"
                    className="flex-1 px-6 py-2.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-[10px] font-black uppercase tracking-widest rounded-md hover:bg-neutral-800 transition-all text-center"
                >
                    Get Started
                </Link>
                <Link
                    href="/auth/login"
                    className="flex-1 px-6 py-2.5 border border-neutral-200 text-neutral-900 text-[10px] font-black uppercase tracking-widest rounded-md hover:bg-neutral-50 transition-all text-center"
                >
                    Log In
                </Link>
            </div>
        </div>
    );
}
