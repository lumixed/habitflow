'use client';

import React from 'react';
import { Coins, Flame } from 'lucide-react';
import { useGamification } from '@/hooks/useGamification';

export default function QuickStatsWidget() {
    const { stats } = useGamification();

    if (!stats) return <div className="animate-pulse h-20 bg-neutral-50 rounded-xl" />;

    return (
        <div className="grid grid-cols-2 gap-4">
            <div className="bg-neutral-50 dark:bg-neutral-900 p-5 rounded-lg border border-neutral-100 dark:border-neutral-800">
                <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1">Coins</p>
                <div className="flex items-center gap-2">
                    <Coins size={20} className="text-amber-500" />
                    <p className="text-2xl font-bold text-amber-600">{stats.coins}</p>
                </div>
            </div>
            <div className="bg-neutral-50 dark:bg-neutral-900 p-5 rounded-lg border border-neutral-100 dark:border-neutral-800">
                <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1">Max Streak</p>
                <div className="flex items-center gap-2">
                    <Flame size={20} className="text-orange-500" />
                    <p className="text-2xl font-bold text-orange-600">12</p>
                </div>
            </div>
        </div>
    );
}
