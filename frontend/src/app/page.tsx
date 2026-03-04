'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function RootPage() {
    const router = useRouter();
    const { user, isLoading } = useAuth();

    useEffect(() => {
        if (!isLoading) {
            if (user) {
                router.replace('/dashboard');
            } else {
                router.replace('/auth/login');
            }
        }
    }, [user, isLoading, router]);

    // Show a minimal loading state while auth resolves
    return (
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-neutral-950">
            <div className="flex flex-col items-center gap-4">
                <div className="w-8 h-8 border-2 border-neutral-900 dark:border-white border-t-transparent rounded-full animate-spin" />
                <p className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">
                    Loading...
                </p>
            </div>
        </div>
    );
}
