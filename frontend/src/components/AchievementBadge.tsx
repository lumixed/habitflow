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
        relative p-4 rounded-lg border-2 transition-all duration-300 cursor-pointer
        ${unlocked
                    ? 'bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-400 dark:border-yellow-600 shadow-lg hover:shadow-xl hover:scale-105'
                    : 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 opacity-60 hover:opacity-80'
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
                <div className="text-5xl mb-2 filter drop-shadow-lg">
                    {unlocked ? icon : '❓'}
                </div>
                <h3 className={`font-bold mb-1 ${unlocked ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                    {name}
                </h3>
                <p className={`text-sm mb-2 ${unlocked ? 'text-gray-700 dark:text-gray-300' : 'text-gray-500 dark:text-gray-500'}`}>
                    {description}
                </p>

                {/* Rewards */}
                {(xpReward || coinReward) && (
                    <div className="flex items-center justify-center gap-3 text-xs mt-2">
                        {xpReward && (
                            <span className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-2 py-1 rounded-full font-semibold">
                                +{xpReward} XP
                            </span>
                        )}
                        {coinReward && (
                            <span className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 px-2 py-1 rounded-full font-semibold">
                                +{coinReward} 🪙
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Shine effect for unlocked achievements */}
            {unlocked && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shine pointer-events-none rounded-lg"></div>
            )}
        </div>
    );
}
