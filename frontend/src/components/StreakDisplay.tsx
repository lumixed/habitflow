'use client';

interface StreakDisplayProps {
    count: number;
    milestone?: number;
}

export default function StreakDisplay({ count, milestone }: StreakDisplayProps) {
    const getStreakColor = (count: number) => {
        if (count >= 100) return 'from-purple-500 to-pink-500';
        if (count >= 30) return 'from-orange-500 to-red-500';
        if (count >= 7) return 'from-yellow-500 to-orange-500';
        return 'from-gray-400 to-gray-500';
    };

    const getStreakEmoji = (count: number) => {
        if (count >= 100) return '👑';
        if (count >= 30) return '💪';
        if (count >= 7) return '🔥';
        return '⭐';
    };

    return (
        <div className="inline-flex items-center gap-2">
            <div className={`bg-gradient-to-r ${getStreakColor(count)} text-white px-3 py-1 rounded-full shadow-md flex items-center gap-2`}>
                <span className="text-lg">{getStreakEmoji(count)}</span>
                <span className="font-bold">{count}</span>
                <span className="text-sm opacity-90">day{count !== 1 ? 's' : ''}</span>
            </div>

            {milestone && (
                <div className="animate-bounce">
                    <span className="text-2xl">🎉</span>
                </div>
            )}
        </div>
    );
}
