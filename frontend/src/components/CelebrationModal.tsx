'use client';

import { useEffect, useState } from 'react';
import Confetti from './Confetti';

interface CelebrationModalProps {
    isOpen: boolean;
    onClose: () => void;
    type: 'achievement' | 'levelUp' | 'milestone';
    data: {
        title: string;
        description?: string;
        icon?: string;
        xp?: number;
        coins?: number;
        level?: number;
    };
}

export default function CelebrationModal({ isOpen, onClose, type, data }: CelebrationModalProps) {
    const [showConfetti, setShowConfetti] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setShowConfetti(true);
            // Auto-close after 5 seconds
            const timer = setTimeout(() => {
                onClose();
            }, 5000);
            return () => clearTimeout(timer);
        } else {
            setShowConfetti(false);
        }
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const getGradient = () => {
        switch (type) {
            case 'levelUp':
                return 'from-purple-500 to-pink-500';
            case 'milestone':
                return 'from-orange-500 to-red-500';
            case 'achievement':
            default:
                return 'from-yellow-400 to-orange-500';
        }
    };

    return (
        <>
            <Confetti trigger={showConfetti} duration={5000} />

            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-8 text-center animate-scaleIn">
                    {/* Icon/Emoji */}
                    <div className="mb-4">
                        <div className={`inline-block bg-gradient-to-br ${getGradient()} p-6 rounded-full shadow-lg animate-bounce`}>
                            <span className="text-6xl filter drop-shadow-lg">
                                {data.icon || (type === 'levelUp' ? '⬆️' : type === 'milestone' ? '🎯' : '🏆')}
                            </span>
                        </div>
                    </div>

                    {/* Title */}
                    <h2 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
                        {data.title}
                    </h2>

                    {/* Description */}
                    {data.description && (
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            {data.description}
                        </p>
                    )}

                    {/* Rewards */}
                    <div className="flex items-center justify-center gap-4 mb-6">
                        {data.xp && (
                            <div className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-6 py-3 rounded-full font-bold text-lg shadow-md">
                                +{data.xp} XP
                            </div>
                        )}
                        {data.coins && (
                            <div className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 px-6 py-3 rounded-full font-bold text-lg shadow-md">
                                +{data.coins} 🪙
                            </div>
                        )}
                        {data.level && (
                            <div className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-6 py-3 rounded-full font-bold text-lg shadow-md">
                                Level {data.level}!
                            </div>
                        )}
                    </div>

                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                        Awesome! 🎉
                    </button>
                </div>
            </div>
        </>
    );
}
