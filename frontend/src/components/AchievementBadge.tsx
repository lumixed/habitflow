'use client';

interface AchievementBadgeProps {
    icon: string;
    name: string;
    description: string;
    unlocked: boolean;
    xpReward?: number;
    coinReward?: number;
    onClick?: () => void;
}

export default function AchievementBadge({
    icon,
    name,
    description,
    unlocked,
    xpReward,
    coinReward,
    onClick
}: AchievementBadgeProps) {
    return (
        <div
            onClick={onClick}
            className={`
        relative p-4 rounded-md border-2 transition-all duration-200 cursor-pointer
        ${unlocked
                    ? 'bg-white dark:bg-gray-800 border-amber-300 dark:border-amber-600 shadow-sm hover:border-amber-400'
                    : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 opacity-50'
                }
      `}
        >
            {/* Locked overlay */}
            {!unlocked && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/10 rounded-lg">
                    <span className="text-4xl">🔒</span>
                </div>
            )}

            {/* Badge content */}
            <div className="text-center">
                <div className="text-4xl mb-3">
                    {unlocked ? icon : '❓'}
                </div>
                <h3 className={`font-bold mb-1 ${unlocked ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                    {name}
                </h3>
                <p className={`text-sm mb-2 ${unlocked ? 'text-gray-700 dark:text-gray-300' : 'text-gray-500 dark:text-gray-500'}`}>
                    {description}
                </p>

                {/* Rewards */}
                <div className="flex items-center justify-center gap-2 text-[10px] mt-3">
                    {xpReward && (
                        <span className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-md font-bold border border-emerald-100 dark:border-emerald-800/50 uppercase tracking-tighter">
                            +{xpReward} XP
                        </span>
                    )}
                    {coinReward && (
                        <span className="bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-md font-bold border border-amber-100 dark:border-amber-800/50 uppercase tracking-tighter">
                            +{coinReward} COINS
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
