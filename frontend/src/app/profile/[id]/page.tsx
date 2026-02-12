'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface ProfileData {
    userId: string;
    displayName: string;
    avatarUrl: string | null;
    level: number;
    xp: number;
    coins: number;
    xpProgress: {
        currentLevelXP: number;
        nextLevelXP: number;
        progress: number;
    };
    achievements: Array<{
        key: string;
        name: string;
        icon: string;
        unlockedAt: string;
    }>;
    streaks: Array<{
        habitTitle: string;
        currentCount: number;
    }>;
    achievementCount: number;
    longestStreak: number;
}

export default function ProfilePage({ params }: { params: { id: string } }) {
    const id = params?.id;
    const { token } = useAuth();
    const router = useRouter();
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token && id) {
            fetchProfile();
        }
    }, [token, id]);

    const fetchProfile = async () => {
        try {
            const data = await api.get<ProfileData>(`/api/gamification/profile/${id}`, token!);
            setProfile(data);
        } catch (error) {
            console.error('Failed to fetch profile:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <Navbar />
                <div className="flex items-center justify-center h-[calc(100vh-64px)]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <Navbar />
                <div className="p-6 text-center">
                    <h2 className="text-2xl font-bold">User not found</h2>
                    <button
                        onClick={() => router.back()}
                        className="mt-4 text-primary-600 font-semibold active:scale-95 transition-transform"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navbar />
            <div className="max-w-4xl mx-auto p-6">
                {/* Header Card */}
                <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-neutral-100 dark:border-gray-700 mb-8">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        <div className="w-32 h-32 rounded-full bg-primary-100 flex items-center justify-center text-4xl font-bold text-primary-600 border-4 border-white shadow-lg overflow-hidden">
                            {profile.avatarUrl ? (
                                <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                                profile.displayName[0]
                            )}
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <h1 className="text-3xl font-bold mb-2">{profile.displayName}</h1>
                            <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-4">
                                <span className="px-3 py-1 bg-primary-50 text-primary-600 rounded-full text-sm font-bold">
                                    Level {profile.level}
                                </span>
                                <span className="px-3 py-1 bg-yellow-50 text-yellow-600 rounded-full text-sm font-bold whitespace-nowrap">
                                    ✨ {profile.xp} XP
                                </span>
                                <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-sm font-bold">
                                    💰 {profile.coins} Coins
                                </span>
                            </div>

                            {/* XP Progress Bar */}
                            <div className="w-full max-w-md mx-auto md:mx-0">
                                <div className="flex justify-between text-xs text-neutral-500 mb-1 font-medium">
                                    <span>XP Progress</span>
                                    <span>{profile.xpProgress.currentLevelXP} / {profile.xpProgress.nextLevelXP}</span>
                                </div>
                                <div className="h-2 bg-neutral-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary-500 transition-all duration-1000 ease-out"
                                        style={{ width: `${profile.xpProgress.progress}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Left Column: Stats & Streaks */}
                    <div className="space-y-8">
                        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-neutral-100 dark:border-gray-700">
                            <h3 className="text-lg font-bold mb-4">Statistics</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center p-3 bg-neutral-50 dark:bg-gray-700 rounded-2xl">
                                    <span className="text-neutral-500 text-sm">Longest Streak</span>
                                    <span className="font-bold text-orange-500">{profile.longestStreak} days</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-neutral-50 dark:bg-gray-700 rounded-2xl">
                                    <span className="text-neutral-500 text-sm">Achievements</span>
                                    <span className="font-bold text-purple-500">{profile.achievementCount}</span>
                                </div>
                            </div>
                        </div>

                        {profile.streaks.length > 0 && (
                            <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-neutral-100 dark:border-gray-700">
                                <h3 className="text-lg font-bold mb-4">Current Streaks</h3>
                                <div className="space-y-3">
                                    {profile.streaks.map((streak, i) => (
                                        <div key={i} className="flex justify-between items-center">
                                            <span className="text-sm font-medium">{streak.habitTitle}</span>
                                            <span className="text-sm font-bold text-orange-500">🔥 {streak.currentCount}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Achievements */}
                    <div className="md:col-span-2">
                        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-neutral-100 dark:border-gray-700">
                            <h3 className="text-lg font-bold mb-6">Unlocked Achievements</h3>
                            {profile.achievements.length > 0 ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {profile.achievements.map((achievement) => (
                                        <div key={achievement.key} className="flex flex-col items-center text-center p-4 rounded-2xl bg-neutral-50 dark:bg-gray-700 hover:bg-white border-2 border-transparent hover:border-primary-100 transition-all duration-300 shadow-sm cursor-default">
                                            <div className="text-3xl mb-2">{achievement.icon}</div>
                                            <div className="text-xs font-bold leading-tight">{achievement.name}</div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-neutral-400">
                                    <div className="text-4xl mb-4">🔒</div>
                                    <p>No achievements unlocked yet</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
