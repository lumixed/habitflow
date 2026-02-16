'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Trophy } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import Navbar from '@/components/Navbar';

interface LeaderboardEntry {
    rank: number;
    userId: string;
    displayName: string;
    avatarUrl: string | null;
    level: number;
    xp: number;
}

export default function LeaderboardPage() {
    const { token } = useAuth();
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [timeframe, setTimeframe] = useState<'all' | 'weekly' | 'monthly'>('all');

    useEffect(() => {
        if (token) {
            fetchLeaderboard();
        }
    }, [token, timeframe]);

    const fetchLeaderboard = async () => {
        try {
            const data = await api.get<LeaderboardEntry[]>(
                `/api/gamification/leaderboard?limit=50`,
                token!
            );
            setLeaderboard(data);
        } catch (error) {
            console.error('Failed to fetch leaderboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const getRankColor = (rank: number) => {
        if (rank === 1) return 'from-emerald-400 to-emerald-600';
        if (rank === 2) return 'from-neutral-300 to-neutral-500';
        if (rank === 3) return 'from-emerald-800 to-neutral-900';
        return 'from-neutral-800 to-neutral-900';
    };

    const getRankEmoji = (rank: number) => {
        if (rank === 1) return '🥇';
        if (rank === 2) return '🥈';
        if (rank === 3) return '🥉';
        return '🏅';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center py-20">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-neutral-900 mx-auto"></div>
                        <p className="mt-4 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Loading leaderboard...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navbar />
            <div className="p-6 text-gray-900 dark:text-gray-100">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="mb-12 text-center">
                        <h1 className="text-3xl font-black text-neutral-900 dark:text-white mb-2 uppercase tracking-tight">
                            Leaderboard
                        </h1>
                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                            THE TOP HABIT BUILDERS
                        </p>
                    </div>

                    {/* Timeframe filters */}
                    <div className="mb-6 flex justify-center gap-2">
                        {(['all', 'weekly', 'monthly'] as const).map(tf => (
                            <button
                                key={tf}
                                onClick={() => setTimeframe(tf)}
                                className={`
                px-6 py-2 rounded-md font-black text-[10px] uppercase tracking-widest transition-all duration-200
                ${timeframe === tf
                                        ? 'bg-neutral-900 text-white shadow-sm'
                                        : 'bg-white dark:bg-gray-800 text-neutral-400 dark:text-gray-500 hover:bg-neutral-50 border border-neutral-100 dark:border-gray-800'
                                    }
              `}
                            >
                                {tf}
                            </button>
                        ))}
                    </div>

                    {/* Leaderboard list */}
                    <div className="space-y-3">
                        {leaderboard.map((entry) => (
                            <Link
                                href={`/profile/${entry.userId}`}
                                key={entry.userId}
                                className={`
                                    bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 flex items-center gap-4
                                    transition-all duration-200 hover:shadow-lg hover:scale-[1.02]
                                    ${entry.rank <= 3 ? 'border-2 border-emerald-500/50 dark:border-emerald-500/30' : 'border border-neutral-100 dark:border-gray-700'}
                                `}
                            >
                                {/* Rank */}
                                <div className={`flex-shrink-0 w-12 h-12 rounded-md bg-gradient-to-br ${getRankColor(entry.rank)} flex items-center justify-center shadow-sm`}>
                                    <span className="text-2xl">{getRankEmoji(entry.rank)}</span>
                                </div>

                                {/* User info */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="font-black text-lg text-neutral-900 dark:text-white uppercase tracking-tight">
                                            {entry.displayName}
                                        </h3>
                                        <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">
                                            #{entry.rank}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-neutral-400">
                                        <span className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-md border border-emerald-100 dark:border-emerald-800/50">
                                            Lvl {entry.level}
                                        </span>
                                        <span>
                                            {entry.xp.toLocaleString()} XP
                                        </span>
                                    </div>
                                </div>

                                {/* Trophy for top 3 */}
                                {entry.rank <= 3 && (
                                    <div className="flex-shrink-0 text-4xl animate-bounce">
                                        <Trophy size={20} className="text-yellow-500" />
                                    </div>
                                )}
                            </Link>
                        ))}
                    </div>

                    {leaderboard.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-gray-600 dark:text-gray-400">No leaderboard data available yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
