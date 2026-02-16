'use client';

import { Flame, Zap } from 'lucide-react';

interface StreakDisplayProps {
    count: number;
}

export default function StreakDisplay({ count }: StreakDisplayProps) {
    const getStreakIcon = () => {
        if (count >= 30) return <Flame size={20} className="text-orange-500" />;
        if (count >= 7) return <Flame size={18} className="text-orange-400" />;
        return <Zap size={16} className="text-yellow-500" />;
    };

    const getStreakColor = () => {
        if (count >= 30) return 'text-orange-600';
        if (count >= 7) return 'text-orange-500';
        return 'text-yellow-600';
    };

    if (count === 0) return null;

    return (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-neutral-200">
            {getStreakIcon()}
            <div>
                <span className={`text-sm font-bold ${getStreakColor()}`}>
                    {count} day{count !== 1 ? 's' : ''}
                </span>
                {count >= 7 && (
                    <span className="ml-1.5 text-xs text-orange-600/70">
                        Keep it up!
                    </span>
                )}
            </div>
        </div>
    );
}
