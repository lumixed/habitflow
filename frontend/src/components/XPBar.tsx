'use client';

interface XPBarProps {
    level: number;
    currentXP: number;
    nextLevelXP: number;
    progress: number;
}

export default function XPBar({ level, currentXP, nextLevelXP, progress }: XPBarProps) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-md shadow-sm border border-neutral-100 dark:border-neutral-700 p-5 mb-8">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                    <div className="bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-md w-11 h-11 flex items-center justify-center font-black text-lg">
                        {level}
                    </div>
                    <div>
                        <h3 className="text-xs font-black text-neutral-900 dark:text-white uppercase tracking-widest">LEVEL {level}</h3>
                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                            {currentXP.toLocaleString()} / {nextLevelXP.toLocaleString()} XP
                        </p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-sm font-black text-neutral-900 dark:text-white">
                        {Math.floor(progress)}%
                    </p>
                </div>
            </div>

            <div className="relative w-full h-1.5 bg-neutral-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                    className="absolute top-0 left-0 h-full bg-neutral-900 dark:bg-white transition-all duration-700 ease-out"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                >
                </div>
            </div>
        </div>
    );
}
