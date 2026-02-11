'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useHabits, Habit } from '@/hooks/useHabits';
import HabitCard from '@/components/HabitCard';
import HabitModal from '@/components/HabitModal';
import HabitDetail from '@/components/HabitDetail';
import Navbar from '@/components/Navbar';
import XPBar from '@/components/XPBar';
import CelebrationModal from '@/components/CelebrationModal';
import { useGamification } from '@/hooks/useGamification';
import { useCelebration } from '@/hooks/useCelebration';

export default function DashboardPage() {
    const router = useRouter();
    const { user, isLoading: authLoading, logout } = useAuth();
    const { habits, isLoading: habitsLoading, createHabit, updateHabit, deleteHabit } = useHabits();
    const { stats, refetch: refetchStats } = useGamification();
    const { celebration, isOpen, celebrate, close } = useCelebration();

    const [modalOpen, setModalOpen] = useState(false);
    const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

    const [viewingHabit, setViewingHabit] = useState<Habit | null>(null);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/auth/login');
        }
    }, [user, authLoading, router]);

    const handleLogout = () => {
        logout();
        router.push('/');
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
        if (editingHabit) {
            await updateHabit(editingHabit.id, data);
        } else {
            await createHabit(data);
        }
    };

    const handleToggleActive = async (id: string, is_active: boolean) => {
        await updateHabit(id, { is_active });
    };

    const handleReward = (rewards: any) => {
        // Refetch stats to update XP bar
        refetchStats();

        if (!rewards) return;

        // Check for achievements
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
        // Check for level up
        else if (rewards.levelUp && rewards.levelUp.leveledUp) {
            celebrate({
                type: 'levelUp',
                data: {
                    title: 'Level Up!',
                    description: `You've reached level ${rewards.levelUp.newLevel}!`,
                    level: rewards.levelUp.newLevel,
                    icon: '🚀'
                }
            });
        }
        // Check for streak milestone
        else if (rewards.streakMilestone) {
            celebrate({
                type: 'milestone',
                data: {
                    title: `${rewards.streakCount} Day Streak!`,
                    description: `Amazing! You've reached a ${rewards.streakCount} day milestone.`,
                    icon: rewards.streakCount >= 100 ? '👑' : '🔥',
                    xp: 50 * (rewards.streakCount / 7) // Example bonus
                }
            });
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-pulse text-neutral-400">Loading...</div>
            </div>
        );
    }

    if (!user) return null;

    if (viewingHabit) {
        return <HabitDetail habit={viewingHabit} onClose={() => setViewingHabit(null)} />;
    }

    const activeHabits = habits.filter((h) => h.is_active);
    const pausedHabits = habits.filter((h) => !h.is_active);

    return (
        <div className="min-h-screen bg-neutral-50">
            <Navbar />

            {/* ── Page Body ─────────────────────────────────────────────── */}
            <main className="max-w-2xl mx-auto px-4 py-8">
                {/* XP Bar */}
                {stats && (
                    <XPBar
                        level={stats.level}
                        currentXP={stats.xp}
                        nextLevelXP={stats.xpProgress.nextLevelXP}
                        progress={stats.xpProgress.progress}
                    />
                )}

                {/* Header row */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-neutral-900">My Habits</h2>
                        <p className="text-sm text-neutral-500 mt-0.5">
                            {activeHabits.length} active {activeHabits.length === 1 ? 'habit' : 'habits'}
                        </p>
                    </div>
                    <button
                        onClick={handleOpenCreate}
                        className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add habit
                    </button>
                </div>

                {/* ── Empty state ─────────────────────────────────────────── */}
                {!habitsLoading && habits.length === 0 && (
                    <div className="text-center py-20 px-6">
                        <div className="text-5xl mb-4">🌱</div>
                        <h3 className="text-lg font-semibold text-neutral-800 mb-2">No habits yet</h3>
                        <p className="text-neutral-500 mb-6 max-w-sm mx-auto">
                            Create your first habit and start building a routine that sticks.
                        </p>
                        <button
                            onClick={handleOpenCreate}
                            className="px-5 py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 transition-colors"
                        >
                            Create your first habit
                        </button>
                    </div>
                )}

                {/* ── Loading ─────────────────────────────────────────────── */}
                {habitsLoading && (
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-24 bg-white rounded-xl border border-neutral-200 animate-pulse" />
                        ))}
                    </div>
                )}

                {/* ── Active Habits ─────────────────────────────────────── */}
                {!habitsLoading && activeHabits.length > 0 && (
                    <div className="space-y-3">
                        {activeHabits.map((habit) => (
                            <div key={habit.id} onClick={() => setViewingHabit(habit)} className="cursor-pointer">
                                <HabitCard
                                    habit={habit}
                                    onToggleActive={handleToggleActive}
                                    onDelete={deleteHabit}
                                    onEdit={(h) => {
                                        setViewingHabit(null);
                                        handleOpenEdit(h);
                                    }}
                                    onReward={handleReward}
                                />
                            </div>
                        ))}
                    </div>
                )}

                {/* ── Paused Habits ─────────────────────────────────────── */}
                {!habitsLoading && pausedHabits.length > 0 && (
                    <div className="mt-8">
                        <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-3">
                            Paused
                        </h3>
                        <div className="space-y-3">
                            {pausedHabits.map((habit) => (
                                <div key={habit.id} onClick={() => setViewingHabit(habit)} className="cursor-pointer">
                                    <HabitCard
                                        habit={habit}
                                        onToggleActive={handleToggleActive}
                                        onDelete={deleteHabit}
                                        onEdit={(h) => {
                                            setViewingHabit(null);
                                            handleOpenEdit(h);
                                        }}
                                        onReward={handleReward}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>

            {/* ── Modal ───────────────────────────────────────────────── */}
            <HabitModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onSave={handleSave}
                editHabit={editingHabit}
            />

            {/* Celebration Modal */}
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
