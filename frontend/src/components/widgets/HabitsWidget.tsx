'use client';

import React from 'react';
import { useHabits, Habit } from '@/hooks/useHabits';
import HabitCard from '../HabitCard';

interface HabitsWidgetProps {
    onOpenEdit: (habit: Habit) => void;
    onToggleActive: (id: string, is_active: boolean) => void;
    onDelete: (id: string) => void;
    onReward: (rewards: any) => void;
    onViewDetail: (habit: Habit) => void;
}

export default function HabitsWidget({
    onOpenEdit,
    onToggleActive,
    onDelete,
    onReward,
    onViewDetail
}: HabitsWidgetProps) {
    const { habits, isLoading } = useHabits();
    const activeHabits = habits.filter(h => h.is_active);

    if (isLoading) return <div className="animate-pulse space-y-2"><div className="h-20 bg-neutral-50 rounded-2xl" /><div className="h-20 bg-neutral-50 rounded-2xl" /></div>;

    if (activeHabits.length === 0) {
        return (
            <div className="text-center py-8 opacity-40">
                <p className="text-xs font-black uppercase tracking-widest">No active habits</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {activeHabits.slice(0, 3).map((habit) => (
                <div key={habit.id} onClick={() => onViewDetail(habit)} className="cursor-pointer">
                    <HabitCard
                        habit={habit}
                        onToggleActive={onToggleActive}
                        onDelete={onDelete}
                        onEdit={onOpenEdit}
                        onReward={onReward}
                    />
                </div>
            ))}
            {activeHabits.length > 3 && (
                <p className="text-[10px] font-black text-neutral-400 text-center uppercase tracking-widest pt-2">
                    + {activeHabits.length - 3} more habits
                </p>
            )}
        </div>
    );
}
