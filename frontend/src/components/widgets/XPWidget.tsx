'use client';

import React from 'react';
import { useGamification } from '@/hooks/useGamification';

export default function XPWidget() {
    const { stats } = useGamification();

    if (!stats) return <div className="animate-pulse h-20 bg-neutral-50 rounded-2xl" />;

    return (
        <div className="space-y-4">
            <div className="flex items-end justify-between">
                <div>
                    <p className="text-4xl font-black tracking-tighter">LVL {stats.level}</p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest leading-none">Next Level</p>
                    <p className="text-xs font-bold">{stats.xp} / {stats.xpProgress.nextLevelXP} XP</p>
                </div>
            </div>

            <div className="h-3 bg-neutral-100 dark:bg-neutral-900 rounded-full overflow-hidden">
                <div
                    className="h-full bg-primary-500 transition-all duration-1000 ease-out"
                    style={{ width: `${stats.xpProgress.progress}%` }}
                />
            </div>

            <div className="flex justify-between items-center text-[10px] font-black text-neutral-400 uppercase tracking-widest pt-2">
                <span>{stats.xpProgress.progress}% COMPLETED</span>
                <span className="text-primary-500">{stats.xpProgress.nextLevelXP - stats.xp} XP TO GO</span>
            </div>
        </div>
    );
}
