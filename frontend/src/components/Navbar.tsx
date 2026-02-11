'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function Navbar() {
    const { user, logout } = useAuth();
    const router = useRouter();

    const handleLogout = () => {
        logout();
        router.push('/');
    };

    if (!user) return null;

    return (
        <nav className="bg-white border-b border-neutral-200 sticky top-0 z-30">
            <div className="max-w-2xl mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    <Link href="/dashboard" className="text-xl font-bold text-neutral-900">
                        Habit<span className="text-primary-500">Flow</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <Link
                            href="/dashboard"
                            className="text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
                        >
                            Dashboard
                        </Link>
                        <Link
                            href="/groups"
                            className="text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
                        >
                            Groups
                        </Link>
                        <Link
                            href="/achievements"
                            className="text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
                        >
                            Achievements
                        </Link>
                        <Link
                            href="/leaderboard"
                            className="text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
                        >
                            Leaderboard
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
                        >
                            Log out
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
