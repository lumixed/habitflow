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

export default function ProfileClient({ id }: { id: string }) {
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
        } catch (err: any) {
            console.error('Profile fetch error:', err);
            if (err.message?.includes('private') || err.message?.includes('403')) {
                alert('This profile is private.');
                router.push('/dashboard');
            }
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <Navbar />
                <div className="flex items-center justify-center h-[calc(100vh-64px)]">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-neutral-900 mx-auto"></div>
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
                        className="mt-6 text-[10px] font-black text-neutral-400 hover:text-neutral-900 uppercase tracking-widest active:scale-95 transition-all"
                    >
                        GO BACK
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
                <div className="bg-white dark:bg-gray-800 rounded-md p-10 shadow-sm border border-neutral-100 dark:border-gray-700 mb-8">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        <div className="w-32 h-32 rounded-md bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-5xl font-black text-emerald-600 border border-emerald-100 dark:border-emerald-800/50 shadow-sm overflow-hidden">
                            {profile.avatarUrl ? (
                                <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                                profile.displayName[0]
                            )}
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <h1 className="text-3xl font-black mb-2 uppercase tracking-tight text-neutral-900 dark:text-white">{profile.displayName}</h1>
                            <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-6">
                                <span className="px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-md text-[10px] font-black uppercase tracking-widest">
                                    LVL {profile.level}
                                </span>
                                <span className="px-3 py-1 bg-neutral-50 text-neutral-900 border border-neutral-100 rounded-md text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
                                    ✨ {profile.xp} XP
                                </span>
                                <span className="px-3 py-1 bg-neutral-900 text-white rounded-md text-[10px] font-black uppercase tracking-widest">
                                    💰 {profile.coins} COINS
                                </span>
                            </div>

                            {/* XP Progress Bar */}
                            <div className="w-full max-w-md mx-auto md:mx-0">
                                <div className="flex justify-between text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2">
                                    <span>XP PROGRESS</span>
                                    <span>{profile.xpProgress.currentLevelXP} / {profile.xpProgress.nextLevelXP}</span>
                                </div>
                                <div className="h-1 bg-neutral-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-emerald-500 transition-all duration-1000 ease-out"
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
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-neutral-200 dark:border-gray-700">
                            <h3 className="text-[10px] font-black text-neutral-400 dark:text-neutral-500 mb-4 uppercase tracking-[0.2em]">Statistics</h3>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center p-3 bg-neutral-50 dark:bg-gray-700/50 rounded-lg border border-neutral-100 dark:border-gray-600">
                                    <span className="text-neutral-500 text-[10px] font-bold uppercase tracking-wider">Longest Streak</span>
                                    <span className="font-bold text-neutral-900 dark:text-white text-sm">{profile.longestStreak} DAYS</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-neutral-50 dark:bg-gray-700/50 rounded-lg border border-neutral-100 dark:border-gray-600">
                                    <span className="text-neutral-500 text-[10px] font-bold uppercase tracking-wider">Achievements</span>
                                    <span className="font-bold text-neutral-900 dark:text-white text-sm">{profile.achievementCount}</span>
                                </div>
                            </div>
                        </div>

                        {profile.streaks.length > 0 && (
                            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-neutral-200 dark:border-gray-700">
                                <h3 className="text-[10px] font-black text-neutral-400 dark:text-neutral-500 mb-4 uppercase tracking-[0.2em]">Current Streaks</h3>
                                <div className="space-y-1">
                                    {profile.streaks.map((streak, i) => (
                                        <div key={i} className="flex justify-between items-center p-2 hover:bg-neutral-50 dark:hover:bg-gray-700/30 rounded-md transition-colors">
                                            <span className="text-[10px] font-bold text-neutral-600 dark:text-gray-400 uppercase tracking-tight">{streak.habitTitle}</span>
                                            <span className="text-[10px] font-black text-orange-600">STREAK: {streak.currentCount}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Achievements */}
                    <div className="md:col-span-2">
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-neutral-200 dark:border-gray-700 h-full">
                            <h3 className="text-[10px] font-black text-neutral-400 dark:text-neutral-500 mb-6 uppercase tracking-[0.2em]">Unlocked Achievements</h3>
                            {profile.achievements.length > 0 ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {profile.achievements.map((achievement) => (
                                        <div key={achievement.key} className="flex flex-col items-center text-center p-4 rounded-lg bg-white dark:bg-gray-800 border border-neutral-200 dark:border-gray-700 hover:border-neutral-400 transition-all shadow-sm group">
                                            <div className="text-2xl mb-2 transition-transform duration-300">{achievement.icon}</div>
                                            <div className="text-[9px] font-black text-neutral-900 dark:text-neutral-100 uppercase tracking-tighter">{achievement.name}</div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-20 text-neutral-300">
                                    <div className="text-3xl mb-3 opacity-10">🏆</div>
                                    <p className="text-[10px] font-black uppercase tracking-widest">No achievements yet</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
