'use client';

import { useState, useEffect } from 'react';
import { Habit } from '@/hooks/useHabits';
import { useCompletions } from '@/hooks/useCompletions';
import { useAI, HabitInsight } from '@/hooks/useAI';
import { Haptics, ImpactStyle } from '@capacitor/haptics';



const ICON_MAP: Record<string, string> = {
    target: '🎯', run: '🏃', book: '📚', water: '💧', sleep: '😴', meditate: '🧘', exercise: '💪', write: '✍️', cook: '🍳', learn: '🧠',
    guitar: '🎸', music: '🎵', brush: '🎨', camera: '📷', code: '💻', game: '🎮', gardening: '🌱', pet: '🐾', phone: '📵', money: '💰',
    heart: '❤️', star: '⭐', fire: '🔥', moon: '🌙', sun: '☀️', cloud: '☁️', rain: '🌧️', coffee: '☕', tea: '🍵', apple: '🍎',
    pizza: '🍕', bike: '🚲', car: '🚗', plane: '✈️', map: '🗺️', home: '🏠', work: '💼', school: '🏫', church: '⛪', beach: '🏖️',
    mountain: '⛰️', tree: '🌳', flower: '🌸', bird: '🐦', dog: '🐶', cat: '🐱', fish: '🐟', rocket: '🚀', clock: '⏰', diary: '📔',
    weights: '🏋️', yoga: '🧘‍♀️', swim: '🏊', walk: '🚶', hike: '🥾', tennis: '🎾', soccer: '⚽', basketball: '🏀', golf: '⛳', chess: '♟️',
    clean: '🧹', wash: '🧺', trash: '🗑️', shop: '🛒', gift: '🎁', party: '🎉', beer: '🍺', wine: '🍷', cocktail: '🍸', water_glass: '🥃',
    pill: '💊', doctor: '👨‍⚕️', dentist: '🦷', glasses: '👓', watch: '⌚', lightbulb: '💡', tool: '🛠️', key: '🔑', lock: '🔒', shield: '🛡️',
    flag: '🚩', trophy: '🏆', medal: '🏅', crown: '👑', diamond: '💎', money_bag: '💰', credit_card: '💳', chart: '📊', calendar: '📅', clip: '📎',
    search: '🔍', mail: '✉️', bell: '🔔', speaker: '🔊', mic: '🎤', video: '📹', tv: '📺', radio: '📻', battery: '🔋', bolt: '⚡',
};

const FREQUENCY_LABELS: Record<string, string> = {
    DAILY: 'Daily',
    WEEKLY: 'Weekly',
    WEEKDAYS: 'Weekdays',
};

interface HabitCardProps {
    habit: Habit;
    onToggleActive: (id: string, is_active: boolean) => void;
    onDelete: (id: string) => void;
    onEdit: (habit: Habit) => void;
    onReward?: (rewards: any) => void;
}

export default function HabitCard({ habit, onToggleActive, onDelete, onEdit, onReward }: HabitCardProps) {
    const [confirmDelete, setConfirmDelete] = useState(false);
    const { streak, isDateCompleted, toggleCompletion } = useCompletions(habit.id);
    const [insight, setInsight] = useState<HabitInsight | null>(null);
    const { getHabitInsight } = useAI();

    const emoji = ICON_MAP[habit.icon] || '🎯';
    const today = new Date();
    const isTodayCompleted = isDateCompleted(today);

    useEffect(() => {
        if (habit.is_active) {
            getHabitInsight(habit.id)
                .then(setInsight)
                .catch(err => console.error('Failed to fetch insight for habit:', habit.id, err));
        }
    }, [habit.id, habit.is_active]);

    const handleToggleToday = async (e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            const rewards = await toggleCompletion(today);

            // Trigger haptic feedback for a premium native feel
            try {
                await Haptics.impact({ style: ImpactStyle.Heavy });
            } catch (hapticErr) {
                // Ignore haptic errors (e.g. running on web)
            }

            // Play synthesized success sound
            try {
                const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
                const oscillator = audioCtx.createOscillator();
                const gainNode = audioCtx.createGain();

                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
                oscillator.frequency.exponentialRampToValueAtTime(1046.50, audioCtx.currentTime + 0.1); // C6

                gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);

                oscillator.connect(gainNode);
                gainNode.connect(audioCtx.destination);

                oscillator.start();
                oscillator.stop(audioCtx.currentTime + 0.3);
            } catch (soundErr) {
                // Ignore sound errors
            }

            if (onReward) {

                onReward(rewards);
            }
        } catch (err) {
            console.error('Failed to toggle today:', err);
        }
    };

    return (
        <div
            className={`relative bg-white dark:bg-gray-800 rounded-md border transition-all ${habit.is_active ? 'border-neutral-200 dark:border-neutral-700 shadow-sm' : 'border-neutral-200 dark:border-neutral-700 opacity-60'
                }`}
        >
            {/* Background Image */}
            {habit.background_image && (
                <div
                    className="absolute inset-0 z-0 bg-cover bg-center rounded-md opacity-20 pointer-events-none"
                    style={{ backgroundImage: `url(${habit.background_image})` }}
                />
            )}
            {habit.background_image && <div className="absolute inset-0 z-0 bg-black/5 rounded-md pointer-events-none" />}

            {/* Color accent strip on the left */}
            <div
                className="absolute left-0 top-0 bottom-0 w-0.5 rounded-l-md z-10"
                style={{ backgroundColor: habit.color }}
            />

            <div className="relative z-10 p-4 pl-5">
                {/* Top row: icon + title + streak + actions */}
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                        {/* Icon */}
                        <span className="text-2xl leading-none mt-0.5">{emoji}</span>

                        {/* Title + frequency + streak */}
                        <div className="flex-1">
                            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-tight leading-4">{habit.title}</h3>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] font-black text-neutral-500 uppercase tracking-wider">{FREQUENCY_LABELS[habit.frequency]}</span>
                                {streak > 0 && (
                                    <>
                                        <span className="text-neutral-300">•</span>
                                        <span className="text-[10px] font-black text-orange-600 uppercase tracking-wider">
                                            STREAK: {streak} {streak === 1 ? 'DAY' : 'DAYS'}
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 md:gap-1">
                        {/* Today's checkmark */}
                        {habit.is_active && (
                            <button
                                onClick={handleToggleToday}
                                className={`p-3 md:p-1.5 rounded-md transition-all ${isTodayCompleted
                                    ? 'text-white bg-neutral-900 dark:bg-white dark:text-neutral-900'
                                    : 'text-neutral-400 hover:text-neutral-900 dark:hover:text-white border border-neutral-100 dark:border-neutral-700'
                                    }`}
                                title={isTodayCompleted ? 'Completed today' : 'Mark as done today'}
                            >
                                <svg className="w-5 h-5 md:w-3.5 md:h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            </button>
                        )}

                        {/* Edit */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit(habit);
                            }}
                            className="p-3 md:p-1.5 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
                            title="Edit"
                        >
                            <svg className="w-5 h-5 md:w-4 md:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </button>

                        {/* Toggle active/inactive */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onToggleActive(habit.id, !habit.is_active);
                            }}
                            className={`p-3 md:p-1.5 rounded-lg transition-colors ${habit.is_active
                                ? 'text-success-600 hover:bg-success-50'
                                : 'text-neutral-400 hover:bg-neutral-100'
                                }`}
                            title={habit.is_active ? 'Pause habit' : 'Resume habit'}
                        >
                            {habit.is_active ? (
                                <svg className="w-5 h-5 md:w-4 md:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5 md:w-4 md:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.196-2.131A1 1 0 0110 10.07v3.86a1 1 0 001.552.894l3.196-2.131a1 1 0 000-1.786zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            )}
                        </button>

                        {/* Delete (two-click confirm) */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (confirmDelete) {
                                    onDelete(habit.id);
                                } else {
                                    setConfirmDelete(true);
                                    setTimeout(() => setConfirmDelete(false), 2000);
                                }
                            }}
                            className={`p-3 md:p-1.5 rounded-lg transition-colors ${confirmDelete
                                ? 'text-white bg-red-500 hover:bg-red-600'
                                : 'text-neutral-400 hover:text-red-500 hover:bg-red-50'
                                }`}
                            title={confirmDelete ? 'Click again to confirm delete' : 'Delete'}
                        >
                            <svg className="w-5 h-5 md:w-4 md:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </div>

                </div>

                {/* Description (if present) */}
                {habit.description && (
                    <p className="mt-2 text-sm text-neutral-500 ml-9">{habit.description}</p>
                )}

                {/* AI Insights Section */}
                {habit.is_active && insight && (
                    <div className="mt-4 pt-4 border-t border-neutral-50 dark:border-neutral-700/50 ml-9">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[9px] font-black text-neutral-500 uppercase tracking-widest">Success Probability</span>
                            <span className={`text-[10px] font-bold ${insight.success_probability > 70 ? 'text-green-600' : 'text-neutral-500'}`}>
                                {insight.success_probability}%
                            </span>
                        </div>
                        <div className="h-1 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-neutral-900 dark:bg-white transition-all duration-1000"
                                style={{ width: `${insight.success_probability}%` }}
                            />
                        </div>
                        <p className="mt-2 text-[10px] italic text-neutral-500 leading-tight">
                            “{insight.insight_text}”
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
