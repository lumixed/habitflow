'use client';

import { useState } from 'react';
import { Habit } from '@/hooks/useHabits';
import { useCompletions } from '@/hooks/useCompletions';


const ICON_MAP: Record<string, string> = {
    target: '🎯',
    run: '🏃',
    book: '📚',
    water: '💧',
    sleep: '😴',
    meditate: '🧘',
    exercise: '💪',
    write: '✍️',
    cook: '🍳',
    learn: '🧠',
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

    const emoji = ICON_MAP[habit.icon] || '🎯';
    const today = new Date();
    const isTodayCompleted = isDateCompleted(today);

    const handleToggleToday = async () => {
        try {
            const rewards = await toggleCompletion(today);
            if (rewards && onReward) {
                onReward(rewards);
            }
        } catch (err) {
            console.error('Failed to toggle today:', err);
        }
    };

    return (
        <div
            className={`relative bg-white rounded-xl border transition-all ${habit.is_active ? 'border-neutral-200 shadow-sm' : 'border-neutral-200 opacity-60'
                }`}
        >
            {/* Color accent strip on the left */}
            <div
                className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
                style={{ backgroundColor: habit.color }}
            />

            <div className="p-4 pl-5">
                {/* Top row: icon + title + streak + actions */}
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                        {/* Icon */}
                        <span className="text-2xl leading-none mt-0.5">{emoji}</span>

                        {/* Title + frequency + streak */}
                        <div className="flex-1">
                            <h3 className="font-semibold text-neutral-900">{habit.title}</h3>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs text-neutral-400">{FREQUENCY_LABELS[habit.frequency]}</span>
                                {streak > 0 && (
                                    <>
                                        <span className="text-neutral-300">•</span>
                                        <span className="text-xs font-medium text-primary-600">
                                            🔥 {streak} {streak === 1 ? 'day' : 'days'}
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                        {/* Today's checkmark */}
                        {habit.is_active && (
                            <button
                                onClick={handleToggleToday}
                                className={`p-1.5 rounded-lg transition-all ${isTodayCompleted
                                        ? 'text-white bg-success-500 hover:bg-success-600'
                                        : 'text-neutral-400 hover:text-success-600 hover:bg-success-50'
                                    }`}
                                title={isTodayCompleted ? 'Completed today' : 'Mark as done today'}
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </button>
                        )}

                        {/* Edit */}
                        <button
                            onClick={() => onEdit(habit)}
                            className="p-1.5 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
                            title="Edit"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </button>

                        {/* Toggle active/inactive */}
                        <button
                            onClick={() => onToggleActive(habit.id, !habit.is_active)}
                            className={`p-1.5 rounded-lg transition-colors ${habit.is_active
                                    ? 'text-success-600 hover:bg-success-50'
                                    : 'text-neutral-400 hover:bg-neutral-100'
                                }`}
                            title={habit.is_active ? 'Pause habit' : 'Resume habit'}
                        >
                            {habit.is_active ? (
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            ) : (
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.196-2.131A1 1 0 0110 10.07v3.86a1 1 0 001.552.894l3.196-2.131a1 1 0 000-1.786zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            )}
                        </button>

                        {/* Delete (two-click confirm) */}
                        <button
                            onClick={() => {
                                if (confirmDelete) {
                                    onDelete(habit.id);
                                } else {
                                    setConfirmDelete(true);
                                    setTimeout(() => setConfirmDelete(false), 2000);
                                }
                            }}
                            className={`p-1.5 rounded-lg transition-colors ${confirmDelete
                                    ? 'text-white bg-red-500 hover:bg-red-600'
                                    : 'text-neutral-400 hover:text-red-500 hover:bg-red-50'
                                }`}
                            title={confirmDelete ? 'Click again to confirm delete' : 'Delete'}
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Description (if present) */}
                {habit.description && (
                    <p className="mt-2 text-sm text-neutral-500 ml-9">{habit.description}</p>
                )}
            </div>
        </div>
    );
}
