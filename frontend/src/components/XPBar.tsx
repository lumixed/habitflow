'use client';

interface XPBarProps {
    level: number;
    currentXP: number;
    nextLevelXP: number;
    progress: number;
}

export default function XPBar({ level, currentXP, nextLevelXP, progress }: XPBarProps) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg shadow-lg">
                        {level}
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">Level {level}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {currentXP.toLocaleString()} / {nextLevelXP.toLocaleString()} XP
                        </p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                        {Math.floor(progress)}%
                    </p>
                </div>
            </div>

            <div className="relative w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                >
                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                </div>
            </div>
        </div>
    );
}
