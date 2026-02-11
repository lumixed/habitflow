'use client';

import { useState, useEffect } from 'react';
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
        if (rank === 1) return 'from-yellow-400 to-yellow-600';
        if (rank === 2) return 'from-gray-300 to-gray-500';
        if (rank === 3) return 'from-orange-400 to-orange-600';
        return 'from-indigo-400 to-indigo-600';
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
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading leaderboard...</p>
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
                    <div className="mb-8 text-center">
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                            🏆 Leaderboard
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            See how you stack up against other habit builders
                        </p>
                    </div>

                    {/* Timeframe filters */}
                    <div className="mb-6 flex justify-center gap-2">
                        {(['all', 'weekly', 'monthly'] as const).map(tf => (
                            <button
                                key={tf}
                                onClick={() => setTimeframe(tf)}
                                className={`
                px-6 py-2 rounded-lg font-medium transition-all duration-200
                ${timeframe === tf
                                        ? 'bg-indigo-600 text-white shadow-lg'
                                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                    }
              `}
                            >
                                {tf.charAt(0).toUpperCase() + tf.slice(1)}
                            </button>
                        ))}
                    </div>

                    {/* Leaderboard list */}
                    <div className="space-y-3">
                        {leaderboard.map((entry) => (
                            <div
                                key={entry.userId}
                                className={`
                bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 flex items-center gap-4
                transition-all duration-200 hover:shadow-lg hover:scale-[1.02]
                ${entry.rank <= 3 ? 'border-2 border-yellow-400 dark:border-yellow-600' : ''}
              `}
                            >
                                {/* Rank */}
                                <div className={`flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br ${getRankColor(entry.rank)} flex items-center justify-center shadow-lg`}>
                                    <span className="text-3xl">{getRankEmoji(entry.rank)}</span>
                                </div>

                                {/* User info */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                                            {entry.displayName}
                                        </h3>
                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                            #{entry.rank}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm">
                                        <span className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-full font-semibold">
                                            Level {entry.level}
                                        </span>
                                        <span className="text-gray-600 dark:text-gray-400">
                                            {entry.xp.toLocaleString()} XP
                                        </span>
                                    </div>
                                </div>

                                {/* Trophy for top 3 */}
                                {entry.rank <= 3 && (
                                    <div className="flex-shrink-0 text-4xl animate-bounce">
                                        🏆
                                    </div>
                                )}
                            </div>
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
