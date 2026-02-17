'use client';

import React, { useEffect, useState } from 'react';
import { Flame, Trophy, Ghost } from 'lucide-react';
import { useParams } from 'next/navigation';

interface WidgetData {
    user: {
        display_name: string;
        avatar_url: string | null;
        level: number;
        accent_color: string;
    };
    stats: {
        best_streak: number;
        total_completions: number;
        weeklyActivity: number[];
    };
}

export default function WidgetPage() {
    const params = useParams();
    const userId = params.userId as string;
    const [data, setData] = useState<WidgetData | null>(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`http://localhost:3001/api/public/widget/${userId}`);
                if (!res.ok) throw new Error('Failed to fetch');
                const json = await res.json();
                setData(json);
            } catch (err) {
                console.error(err);
                setError(true);
            }
        };

        if (userId) fetchData();
    }, [userId]);

    if (error) {
        return (
            <div className="w-full h-full p-4 bg-neutral-900 flex items-center justify-center text-red-400 text-[10px] font-black uppercase tracking-widest border border-red-900/50 rounded-lg">
                Widget unavailable
            </div>
        );
    }

    if (!data) {
        return (
            <div className="w-full h-full p-4 bg-neutral-900 animate-pulse rounded-lg"></div>
        );
    }

    const { user, stats } = data;
    const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

    return (
        <div className="w-fit min-w-[300px] p-5 bg-neutral-900 rounded-[24px] border border-neutral-800 text-white font-sans overflow-hidden relative">
            {/* Background Glow */}
            <div
                className="absolute -top-12 -right-12 w-32 h-32 blur-[60px] opacity-20"
                style={{ backgroundColor: user.accent_color }}
            />

            <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="relative">
                        <div className="w-10 h-10 bg-neutral-800 rounded-xl flex items-center justify-center font-black text-neutral-400 text-sm overflow-hidden border border-neutral-700">
                            {user.avatar_url ? (
                                <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                                user.display_name.charAt(0).toUpperCase()
                            )}
                        </div>
                        <div
                            className="absolute -bottom-1 -right-1 w-5 h-5 bg-white text-neutral-900 text-[8px] font-black flex items-center justify-center rounded-md border-2 border-neutral-900"
                        >
                            {user.level}
                        </div>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-0.5">HabitFlow Athlete</p>
                        <h1 className="text-sm font-black uppercase tracking-tight">{user.display_name}</h1>
                    </div>
                    <div className="ml-auto opacity-20">
                        <Ghost size={24} />
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-neutral-800/50 p-3 rounded-2xl border border-neutral-700/50">
                        <div className="flex items-center gap-2 mb-1">
                            <Flame size={12} className="text-orange-500" />
                            <span className="text-[8px] font-black text-neutral-500 uppercase tracking-widest">Best Streak</span>
                        </div>
                        <p className="text-lg font-black">{stats.best_streak} Days</p>
                    </div>
                    <div className="bg-neutral-800/50 p-3 rounded-2xl border border-neutral-700/50">
                        <div className="flex items-center gap-2 mb-1">
                            <Trophy size={12} className="text-yellow-500" />
                            <span className="text-[8px] font-black text-neutral-500 uppercase tracking-widest">Total Done</span>
                        </div>
                        <p className="text-lg font-black">{stats.total_completions}</p>
                    </div>
                </div>

                {/* Weekly Chart */}
                <div>
                    <h3 className="text-[8px] font-black text-neutral-500 uppercase tracking-[0.2em] mb-3">Weekly Momentum</h3>
                    <div className="flex items-end justify-between gap-1.5 h-12">
                        {stats.weeklyActivity.map((count, idx) => {
                            const max = Math.max(...stats.weeklyActivity);
                            const height = max === 0 ? 4 : (count / max) * 44 + 4;
                            return (
                                <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                                    <div
                                        className="w-full rounded-t-[4px] transition-all duration-1000"
                                        style={{
                                            height: `${height}px`,
                                            backgroundColor: count > 0 ? user.accent_color : '#262626',
                                            opacity: count > 0 ? 1 : 0.3
                                        }}
                                    />
                                    <span className="text-[7px] font-black text-neutral-600 uppercase">{days[idx]}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Branding */}
            <div className="mt-6 pt-4 border-t border-neutral-800/50 flex justify-center">
                <span className="text-[7px] font-black text-neutral-600 uppercase tracking-[0.3em] flex items-center gap-1.5">
                    Powered by <span className="text-white">HabitFlow</span>
                </span>
            </div>
        </div>
    );
}
