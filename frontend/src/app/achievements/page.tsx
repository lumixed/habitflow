'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import AchievementBadge from '@/components/AchievementBadge';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface Achievement {
    key: string;
    name: string;
    description: string;
    icon: string;
    category: string;
    xpReward: number;
    coinReward: number;
    unlocked: boolean;
    unlockedAt: string | null;
}

export default function AchievementsPage() {
    const { token } = useAuth();
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>('all');

    useEffect(() => {
        if (token) {
            fetchAchievements();
        }
    }, [token]);

    const fetchAchievements = async () => {
        try {
            const data = await api.get<Achievement[]>('/api/gamification/achievements', token!);
            setAchievements(data);
        } catch (error) {
            console.error('Failed to fetch achievements:', error);
        } finally {
            setLoading(false);
        }
    };

    const categories = ['all', 'STREAK', 'COMPLETION', 'MILESTONE', 'SOCIAL', 'SPECIAL'];

    const filteredAchievements = filter === 'all'
        ? achievements
        : achievements.filter(a => a.category === filter);

    const unlockedCount = achievements.filter(a => a.unlocked).length;

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading achievements...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navbar />
            <div className="p-6 text-gray-900 dark:text-gray-100">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-tight">
                            Achievements
                        </h1>
                        <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                            {unlockedCount} of {achievements.length} unlocked
                        </p>
                        <div className="mt-3 bg-gray-100 dark:bg-gray-800 rounded-md h-1.5 overflow-hidden">
                            <div
                                className="bg-amber-500 h-full transition-all duration-700"
                                style={{ width: `${(unlockedCount / achievements.length) * 100}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Category filters */}
                    <div className="mb-6 flex flex-wrap gap-2">
                        {categories.map(category => (
                            <button
                                key={category}
                                onClick={() => setFilter(category)}
                                className={`
                px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wider transition-all duration-200
                ${filter === category
                                        ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-sm'
                                        : 'bg-white dark:bg-gray-800 text-neutral-500 dark:text-gray-400 border border-neutral-200 dark:border-gray-700 hover:bg-neutral-50 dark:hover:bg-gray-700'
                                    }
              `}
                            >
                                {category === 'all' ? 'All' : category}
                            </button>
                        ))}
                    </div>

                    {/* Achievement grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredAchievements.map(achievement => (
                            <AchievementBadge
                                key={achievement.key}
                                icon={achievement.icon}
                                name={achievement.name}
                                description={achievement.description}
                                unlocked={achievement.unlocked}
                                xpReward={achievement.xpReward}
                                coinReward={achievement.coinReward}
                            />
                        ))}
                    </div>

                    {filteredAchievements.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-gray-600 dark:text-gray-400">No achievements in this category yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
