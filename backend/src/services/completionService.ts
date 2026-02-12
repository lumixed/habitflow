import prisma from '../config/prisma';
import { AppError } from '../middleware/errorHandler';
import { processCompletion } from './gamificationService';
import { updateUserInsights } from './analyticsService';

interface LogCompletionInput {
    habit_id: string;
    user_id: string;
    completed_date: Date;
}

export async function logCompletion(input: LogCompletionInput) {
    const habit = await prisma.habit.findUnique({
        where: { id: input.habit_id },
    });

    if (!habit) {
        throw new AppError('Habit not found', 404);
    }

    if (habit.user_id !== input.user_id) {
        throw new AppError('Habit not found', 404);
    }

    try {
        const completion = await prisma.completion.create({
            data: {
                habit_id: input.habit_id,
                user_id: input.user_id,
                completed_date: input.completed_date,
            },
        });

        // Process gamification rewards
        const rewards = await processCompletion(
            input.user_id,
            input.habit_id,
            input.completed_date
        );

        // Update analytics
        updateUserInsights(input.user_id).catch(err => console.error('Failed to update analytics:', err));

        // Log social activity
        const { logActivity } = require('./socialService');
        logActivity(input.user_id, 'HABIT_COMPLETED', input.habit_id, habit.title).catch((err: any) => console.error('Failed to log social activity:', err));

        return {
            completion,
            rewards
        };
    } catch (error: any) {
        if (error.code === 'P2002') {
            throw new AppError('Already logged for this date', 409);
        }
        throw error;
    }
}

export async function unlogCompletion(habit_id: string, user_id: string, completed_date: Date) {
    const habit = await prisma.habit.findUnique({
        where: { id: habit_id },
    });

    if (!habit || habit.user_id !== user_id) {
        throw new AppError('Habit not found', 404);
    }

    // Rollback gamification rewards and streaks
    const { rollbackCompletion } = require('./gamificationService');
    await rollbackCompletion(user_id, habit_id, completed_date);

    const result = await prisma.completion.deleteMany({
        where: {
            habit_id,
            completed_date,
        },
    });

    if (result.count === 0) {
        throw new AppError('No completion found for this date', 404);
    }

    // Update analytics
    updateUserInsights(user_id).catch(err => console.error('Failed to update analytics:', err));

    return { message: 'Completion removed' };
}

export async function getCompletionsByHabit(habit_id: string, user_id: string) {
    const habit = await prisma.habit.findUnique({
        where: { id: habit_id },
    });

    if (!habit || habit.user_id !== user_id) {
        throw new AppError('Habit not found', 404);
    }

    const completions = await prisma.completion.findMany({
        where: { habit_id },
        orderBy: { completed_date: 'desc' },
    });

    return completions;
}

export async function calculateStreak(habit_id: string, user_id: string): Promise<number> {
    const habit = await prisma.habit.findUnique({
        where: { id: habit_id },
    });

    if (!habit || habit.user_id !== user_id) {
        throw new AppError('Habit not found', 404);
    }

    const completions = await prisma.completion.findMany({
        where: { habit_id },
        orderBy: { completed_date: 'desc' },
    });

    if (completions.length === 0) {
        return 0;
    }

    const completedDates = new Set(
        completions.map((c) => c.completed_date.toISOString().split('T')[0])
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let streak = 0;

    if (habit.frequency === 'DAILY') {
        let checkDate = new Date(today);

        while (true) {
            const dateStr = checkDate.toISOString().split('T')[0];
            if (completedDates.has(dateStr)) {
                streak++;
                checkDate.setDate(checkDate.getDate() - 1);
            } else {
                if (checkDate.getTime() === today.getTime()) {
                    checkDate.setDate(checkDate.getDate() - 1);
                    continue;
                }
                break;
            }
        }
    } else if (habit.frequency === 'WEEKDAYS') {
        let checkDate = new Date(today);

        while (true) {
            const dayOfWeek = checkDate.getDay();

            if (dayOfWeek === 0 || dayOfWeek === 6) {
                checkDate.setDate(checkDate.getDate() - 1);
                continue;
            }

            const dateStr = checkDate.toISOString().split('T')[0];
            if (completedDates.has(dateStr)) {
                streak++;
                checkDate.setDate(checkDate.getDate() - 1);
            } else {
                if (checkDate.getTime() === today.getTime()) {
                    checkDate.setDate(checkDate.getDate() - 1);
                    continue;
                }
                break;
            }
        }
    } else if (habit.frequency === 'WEEKLY') {
        let checkDate = new Date(today);
        let weekStart = getWeekStart(checkDate);

        while (true) {
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekEnd.getDate() + 6);

            const hasCompletionThisWeek = completions.some((c) => {
                const compDate = new Date(c.completed_date);
                return compDate >= weekStart && compDate <= weekEnd;
            });

            if (hasCompletionThisWeek) {
                streak++;
                weekStart.setDate(weekStart.getDate() - 7);
            } else {
                const thisWeekStart = getWeekStart(today);
                if (weekStart.getTime() === thisWeekStart.getTime()) {
                    weekStart.setDate(weekStart.getDate() - 7);
                    continue;
                }
                break;
            }
        }
    }

    return streak;
}

function getWeekStart(date: Date): Date {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    return d;
}
