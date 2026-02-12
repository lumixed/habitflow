'use client';

import { useRouter } from 'next/navigation';
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

interface HabitDetailProps {
    habit: Habit;
    onClose: () => void;
}

export default function HabitDetail({ habit, onClose }: HabitDetailProps) {
    const { streak, isDateCompleted, toggleCompletion, isLoading } = useCompletions(habit.id);

    const emoji = ICON_MAP[habit.icon] || '🎯';

    const generateCalendar = () => {
        const today = new Date();
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - 35);
        startDate.setHours(0, 0, 0, 0);

        const calendar: Date[] = [];
        for (let i = 0; i < 42; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            calendar.push(date);
        }

        return calendar;
    };

    const calendar = generateCalendar();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const handleDayClick = async (date: Date) => {
        try {
            await toggleCompletion(date);
        } catch (err) {
            console.error('Failed to toggle:', err);
        }
    };

    const isSameDay = (d1: Date, d2: Date) => {
        return d1.toISOString().split('T')[0] === d2.toISOString().split('T')[0];
    };

    return (
        <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-neutral-200 z-10">
                <div className="max-w-2xl mx-auto px-4 py-4">
                    <button
                        onClick={onClose}
                        className="flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 mb-3 transition-colors group"
                    >
                        <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to dashboard
                    </button>

                    <div className="flex items-center gap-4">
                        <span className="text-3xl grayscale opacity-40">{emoji}</span>
                        <div>
                            <h1 className="text-xl font-black text-neutral-900 uppercase tracking-tight">{habit.title}</h1>
                            {streak > 0 && (
                                <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest mt-1">
                                    STREAK: {streak} {streak === 1 ? 'DAY' : 'DAYS'}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Calendar */}
            <div className="max-w-2xl mx-auto px-4 py-8">
                {isLoading ? (
                    <div className="text-center py-12 text-neutral-400">Loading calendar...</div>
                ) : (
                    <>
                        {/* Weekday headers */}
                        <div className="grid grid-cols-7 gap-2 mb-2">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                                <div key={day} className="text-center text-xs font-medium text-neutral-400 py-2">
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Calendar grid */}
                        <div className="grid grid-cols-7 gap-2">
                            {calendar.map((date, i) => {
                                const isCompleted = isDateCompleted(date);
                                const isToday = isSameDay(date, today);
                                const isFuture = date > today;

                                return (
                                    <button
                                        key={i}
                                        onClick={() => !isFuture && handleDayClick(date)}
                                        disabled={isFuture}
                                        className={`aspect-square rounded-md border transition-all ${isFuture
                                                ? 'border-neutral-50 bg-neutral-50/50 cursor-not-allowed'
                                                : isCompleted
                                                    ? 'border-neutral-900 bg-neutral-900 text-white'
                                                    : 'border-neutral-200 hover:bg-neutral-50'
                                            } ${isToday ? 'ring-1 ring-neutral-900 ring-offset-2' : ''}`}
                                    >
                                        <div className="flex flex-col items-center justify-center h-full">
                                            <span
                                                className={`text-[10px] font-black ${isFuture
                                                        ? 'text-neutral-200'
                                                        : isCompleted
                                                            ? 'text-white'
                                                            : 'text-neutral-400'
                                                    }`}
                                            >
                                                {date.getDate()}
                                            </span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Legend */}
                        <div className="mt-8 flex items-center justify-center gap-8 text-[9px] font-black text-neutral-400 uppercase tracking-widest">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded bg-neutral-900" />
                                <span>Completed</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded border border-neutral-200" />
                                <span>Missed</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded ring-1 ring-neutral-900 ring-offset-1 border border-neutral-200" />
                                <span>Today</span>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
