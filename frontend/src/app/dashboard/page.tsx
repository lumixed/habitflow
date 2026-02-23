'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useHabits, Habit } from '@/hooks/useHabits';
import { useGamification } from '@/hooks/useGamification';
import { useCelebration } from '@/hooks/useCelebration';
import Navbar from '@/components/Navbar';
import HabitModal from '@/components/HabitModal';
import HabitDetail from '@/components/HabitDetail';
import CelebrationModal from '@/components/CelebrationModal';
import VoiceControl from '@/components/VoiceControl';

import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis, restrictToWindowEdges } from '@dnd-kit/modifiers';

import DashboardWidget from '@/components/DashboardWidget';
import XPWidget from '@/components/widgets/XPWidget';
import HabitsWidget from '@/components/widgets/HabitsWidget';
import QuickStatsWidget from '@/components/widgets/QuickStatsWidget';
import SuggestionsWidget from '@/components/widgets/SuggestionsWidget';
import api from '@/lib/api';

export default function DashboardPage() {
    const router = useRouter();
    const { user, token, isLoading: authLoading, logout } = useAuth();
    const { habits, isLoading: habitsLoading, createHabit, updateHabit, deleteHabit } = useHabits();
    const { stats, refetch: refetchStats } = useGamification();
    const { celebration, isOpen, celebrate, close } = useCelebration();

    const [modalOpen, setModalOpen] = useState(false);
    const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

    const [viewingHabit, setViewingHabit] = useState<Habit | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Widget Management
    const initialWidgetOrder = user?.widget_order?.split(',') || ['xp', 'habits', 'stats', 'suggestions'];
    const [widgetOrder, setWidgetOrder] = useState<string[]>(initialWidgetOrder);

    useEffect(() => {
        if (user?.widget_order) {
            setWidgetOrder(user.widget_order.split(','));
        }
    }, [user?.widget_order]);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/auth/login');
        }
    }, [user, authLoading, router]);

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = widgetOrder.indexOf(active.id as string);
            const newIndex = widgetOrder.indexOf(over.id as string);
            const newOrder = arrayMove(widgetOrder, oldIndex, newIndex);

            setWidgetOrder(newOrder);

            // Persist to backend
            if (token) {
                try {
                    await api.post('/api/auth/profile/update', {
                        widget_order: newOrder.join(',')
                    }, token);
                } catch (err) {
                    console.error('Failed to save widget order:', err);
                }
            }
        }
    };

    const handleOpenCreate = () => {
        setEditingHabit(null);
        setModalOpen(true);
    };

    const handleOpenEdit = (habit: Habit) => {
        setEditingHabit(habit);
        setModalOpen(true);
    };

    const handleSave = async (data: any) => {
        try {
            if (editingHabit && editingHabit.id) {
                await updateHabit(editingHabit.id, data);
            } else {
                await createHabit(data);
            }
            setModalOpen(false);
            setEditingHabit(null);
        } catch (error) {
            console.error('Failed to save habit:', error);
            throw error; // Re-throw so modal can handle it
        }
    };

    const handleSuggestionAdd = (title: string, description: string) => {
        setEditingHabit({
            title,
            description,
            frequency: 'DAILY',
            color: '#2563EB',
            icon: 'target',
            is_active: true
        } as Habit);
        setModalOpen(true);
    };

    const handleToggleActive = async (id: string, is_active: boolean) => {
        await updateHabit(id, { is_active });
    };

    const handleReward = (rewards: any) => {
        refetchStats();
        if (!rewards) return;

        // Show achievement celebration
        if (rewards.newAchievements && rewards.newAchievements.length > 0) {
            const achievement = rewards.newAchievements[0];
            celebrate({
                type: 'achievement',
                data: {
                    title: `Achievement Unlocked: ${achievement.name}`,
                    description: achievement.description,
                    icon: achievement.icon,
                    xp: achievement.xpReward,
                    coins: achievement.coinReward
                }
            });
        }
        // Show level up celebration
        else if (rewards.levelUp && rewards.levelUp.leveledUp) {
            celebrate({
                type: 'levelUp',
                data: {
                    title: 'Level Up!',
                    description: `You've reached level ${rewards.levelUp.newLevel}!`,
                    level: rewards.levelUp.newLevel,
                    icon: ''
                }
            });
        }
        // show regular XP reward feedback
        else if (rewards.xp > 0) {
            celebrate({
                type: 'milestone', // Use milestone style for regular XP for now
                data: {
                    title: 'Habit Completed!',
                    description: rewards.breakdown
                        ? `Earned ${rewards.xp} XP (Base: ${rewards.breakdown.baseXP} x ${rewards.breakdown.multiplier}x Bonus)`
                        : `Earned ${rewards.xp} XP!`,
                    xp: rewards.xp,
                    coins: rewards.coins
                }
            });
        }
    };

    if (authLoading) return <div className="min-h-screen flex items-center justify-center animate-pulse text-neutral-400">Loading...</div>;
    if (!user) return null;
    if (viewingHabit) return <HabitDetail habit={viewingHabit} onClose={() => setViewingHabit(null)} />;

    const renderWidget = (id: string) => {
        switch (id) {
            case 'xp':
                return (
                    <DashboardWidget id="xp" title="Progress" icon="">
                        <XPWidget stats={stats} />
                    </DashboardWidget>
                );
            case 'habits':
                return (
                    <DashboardWidget id="habits" title="Active Habits" icon="">
                        <HabitsWidget
                            habits={habits}
                            isLoading={habitsLoading}
                            onOpenEdit={handleOpenEdit}
                            onToggleActive={handleToggleActive}
                            onDelete={deleteHabit}
                            onReward={handleReward}
                            onViewDetail={(h) => setViewingHabit(h)}
                        />
                        <button
                            onClick={handleOpenCreate}
                            onPointerDown={(e) => e.stopPropagation()} // Prevent drag system from capturing this
                            className="w-full mt-4 py-3 border-2 border-dashed border-neutral-100 dark:border-neutral-700 rounded-2xl text-[10px] font-black text-neutral-400 hover:text-neutral-900 hover:border-neutral-200 transition-all uppercase tracking-widest"
                        >
                            + New Habit
                        </button>
                    </DashboardWidget>
                );
            case 'stats':
                return (
                    <DashboardWidget id="stats" title="Quick Stats" icon="">
                        <QuickStatsWidget stats={stats} />
                    </DashboardWidget>
                );
            case 'suggestions':
                return (
                    <DashboardWidget id="suggestions" title="AI Suggestions" icon="">
                        <SuggestionsWidget onAddHabit={handleSuggestionAdd} />
                    </DashboardWidget>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-[#050505] transition-colors duration-500">
            <Navbar />
            <h1 className="sr-only">Dashboard - HabitFlow</h1>

            <main className="max-w-2xl mx-auto px-4 py-12">
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                    modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
                >
                    <SortableContext items={widgetOrder} strategy={verticalListSortingStrategy}>
                        <div className="space-y-6">
                            {widgetOrder.map((id) => (
                                <div key={id}>
                                    {renderWidget(id)}
                                </div>
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>

                {/* Voice Control Floating */}
                <div className="fixed bottom-8 right-8 z-40">
                    <VoiceControl />
                </div>
            </main>

            <HabitModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onSave={handleSave}
                editHabit={editingHabit}
            />

            {celebration && (
                <CelebrationModal
                    isOpen={isOpen}
                    onClose={close}
                    type={celebration.type}
                    data={celebration.data}
                />
            )}
        </div>
    );
}
