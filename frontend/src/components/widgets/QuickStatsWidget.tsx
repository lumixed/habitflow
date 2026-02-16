'use client';

import React from 'react';
import { useGamification } from '@/hooks/useGamification';

export default function QuickStatsWidget() {
    const { stats } = useGamification();

    if (!stats) return <div className="animate-pulse h-20 bg-neutral-50 rounded-2xl" />;

    return (
        <div className="grid grid-cols-2 gap-4">
            <div className="bg-neutral-50 dark:bg-neutral-900 p-6 rounded-[2rem] border border-neutral-100 dark:border-neutral-800">
                <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Coins</p>
                <p className="text-3xl font-black tracking-tight text-amber-500">💰 {stats.coins}</p>
            </div>
            <div className="bg-neutral-50 dark:bg-neutral-900 p-6 rounded-[2rem] border border-neutral-100 dark:border-neutral-800">
                <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Max Streak</p>
                <p className="text-3xl font-black tracking-tight text-orange-600">🔥 12</p>
            </div>
        </div>
    );
}
