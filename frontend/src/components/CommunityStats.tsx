'use client';

import React, { useEffect, useState } from 'react';
import { Users, CheckCircle2, Trophy, Flame } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface GlobalStats {
    totalUsers: number;
    totalHabitCompletions: number;
    activeChallenges: number;
    popularHabits: { title: string; count: number }[];
}

const CommunityStats = () => {
    const { token } = useAuth();
    const [stats, setStats] = useState<GlobalStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                if (!token) return;
                const data = await api.get<GlobalStats>('/api/analytics/global', token);
                setStats(data);
            } catch (err) {
                console.error('Failed to fetch community stats:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();
    }, [token]);

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-pulse">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-24 bg-neutral-100 rounded-2xl"></div>
                ))}
            </div>
        );
    }

    if (!stats) return null;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-neutral-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                        <Users size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Global Users</p>
                        <p className="text-xl font-black text-neutral-900">{stats.totalUsers.toLocaleString()}</p>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-neutral-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                        <CheckCircle2 size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Total Completions</p>
                        <p className="text-xl font-black text-neutral-900">{stats.totalHabitCompletions.toLocaleString()}</p>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-neutral-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                        <Trophy size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Active Challenges</p>
                        <p className="text-xl font-black text-neutral-900">{stats.activeChallenges}</p>
                    </div>
                </div>
            </div>

            <div className="bg-neutral-900 rounded-2xl p-6 text-white overflow-hidden relative group">
                <div className="absolute top-0 right-0 p-8 opacity-10 transition-transform group-hover:scale-110 duration-700">
                    <Flame size={120} />
                </div>

                <h3 className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] mb-4">Trending Today</h3>
                <div className="space-y-4">
                    {stats.popularHabits.map((habit, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="text-neutral-500 font-black text-xs">0{idx + 1}</span>
                                <span className="font-bold text-sm uppercase tracking-wide">{habit.title}</span>
                            </div>
                            <span className="text-[10px] font-black bg-white/10 px-2 py-1 rounded text-neutral-400 uppercase">
                                {habit.count} Users
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CommunityStats;
