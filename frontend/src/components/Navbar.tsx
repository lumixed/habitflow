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
        <nav className="bg-white border-b border-neutral-200 sticky top-0 z-30" role="navigation" aria-label="Main navigation">
            <div className="max-w-5xl mx-auto px-6">
                <div className="flex justify-between items-center h-16">
                    <Link href="/dashboard" className="text-lg font-black text-neutral-900 uppercase tracking-tight" aria-label="HabitFlow home">
                        Habit<span className="text-primary-500 ml-1">Flow</span>
                    </Link>
                    <div className="hidden md:flex items-center gap-8 ml-12">
                        <Link
                            href="/dashboard"
                            className="text-[10px] font-black text-neutral-400 hover:text-neutral-900 uppercase tracking-[0.15em] transition-colors"
                        >
                            Dashboard
                        </Link>
                        <Link
                            href="/achievements"
                            className="text-[10px] font-black text-neutral-400 hover:text-neutral-900 uppercase tracking-[0.15em] transition-colors"
                        >
                            Achievements
                        </Link>
                        <Link
                            href="/analytics"
                            className="text-[10px] font-black text-neutral-400 hover:text-neutral-900 uppercase tracking-[0.15em] transition-colors"
                        >
                            Analytics
                        </Link>
                        <Link
                            href="/groups"
                            className="text-[10px] font-black text-neutral-400 hover:text-neutral-900 uppercase tracking-[0.15em] transition-colors"
                        >
                            Groups
                        </Link>
                        <Link
                            href="/social"
                            className="text-[10px] font-black text-neutral-400 hover:text-neutral-900 uppercase tracking-[0.15em] transition-colors"
                        >
                            Social
                        </Link>
                        <Link
                            href="/leaderboard"
                            className="text-[10px] font-black text-neutral-400 hover:text-neutral-900 uppercase tracking-[0.15em] transition-colors"
                        >
                            Leaderboard
                        </Link>
                        <Link
                            href="/challenges"
                            className="text-[10px] font-black text-neutral-400 hover:text-neutral-900 uppercase tracking-[0.15em] transition-colors"
                        >
                            Challenges
                        </Link>
                        <Link
                            href="/shop"
                            className="text-[10px] font-black text-neutral-400 hover:text-neutral-900 uppercase tracking-[0.15em] transition-colors"
                        >
                            Shop
                        </Link>
                        <Link
                            href="/settings"
                            className="text-[10px] font-black text-neutral-400 hover:text-neutral-900 uppercase tracking-[0.15em] transition-colors"
                        >
                            Settings
                        </Link>
                        <div className="h-4 w-[1px] bg-neutral-200"></div>
                        <button
                            onClick={handleLogout}
                            className="text-[10px] font-black text-neutral-400 hover:text-red-600 uppercase tracking-[0.15em] transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                    {/* Logout only on mobile if icons are too much */}
                    <div className="md:hidden">
                        <button
                            onClick={handleLogout}
                            className="text-[10px] font-black text-neutral-400 hover:text-red-600 uppercase tracking-[0.15em] transition-colors"
                        >
                            Exit
                        </button>
                    </div>

                </div>
            </div>
        </nav>
    );
}
