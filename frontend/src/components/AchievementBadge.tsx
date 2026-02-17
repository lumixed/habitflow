import LucideIcon from './LucideIcon';

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
                <div className="absolute inset-0 flex items-center justify-center bg-black/10 rounded-lg z-10">
                    <LucideIcon name="Lock" size={40} className="text-neutral-900 dark:text-white" />
                </div>
            )}

            {/* Badge content */}
            <div className="text-center">
                <div className="flex justify-center mb-3">
                    {unlocked ? (
                        <LucideIcon name={icon} size={40} className="text-amber-500" />
                    ) : (
                        <LucideIcon name="HelpCircle" size={40} className="text-neutral-300" />
                    )}
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
                        <span className="bg-white text-emerald-600 px-2 py-0.5 rounded-md font-bold border border-emerald-200 uppercase tracking-tighter shadow-sm">
                            +{xpReward} XP
                        </span>
                    )}
                    {coinReward && (
                        <span className="bg-white text-amber-600 px-2 py-0.5 rounded-md font-bold border border-amber-200 uppercase tracking-tighter shadow-sm">
                            +{coinReward} COINS
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
