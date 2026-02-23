import prisma from '../config/prisma';
import { AppError } from '../middleware/errorHandler';

interface CreateHabitInput {
    user_id: string;
    title: string;
    description?: string;
    frequency?: 'DAILY' | 'WEEKLY' | 'WEEKDAYS';
    color?: string;
    icon?: string;
    background_image?: string;
}

interface UpdateHabitInput {
    title?: string;
    description?: string;
    frequency?: 'DAILY' | 'WEEKLY' | 'WEEKDAYS';
    color?: string;
    icon?: string;
    background_image?: string;
    is_active?: boolean;
}


export async function createHabit(input: CreateHabitInput) {
    if (!input.title || input.title.trim().length === 0) {
        throw new AppError('Habit title is required', 400);
    }

    const user = await prisma.user.findUnique({ where: { id: input.user_id } });
    if (!user) throw new AppError('User not found', 404);

    if (user.plan === 'FREE') {
        const habitCount = await prisma.habit.count({
            where: { user_id: input.user_id, is_active: true }
        });
        if (habitCount >= 5) {
            throw new AppError('Free plan is limited to 5 active habits. Upgrade to Pro for unlimited!', 403);
        }
    }

    const habit = await prisma.habit.create({
        data: {
            user_id: input.user_id,
            title: input.title.trim(),
            description: input.description?.trim() || null,
            frequency: input.frequency || 'DAILY',
            color: input.color || '#2563EB',
            icon: input.icon || 'target',
            background_image: input.background_image || null,
        },
    });

    return habit;
}

export async function getHabitsByUser(user_id: string) {
    const habits = await prisma.habit.findMany({
        where: { user_id },
        orderBy: { created_at: 'desc' },
    });

    return habits;
}


export async function getHabitById(habit_id: string, user_id: string) {
    const habit = await prisma.habit.findUnique({
        where: { id: habit_id },
    });

    if (!habit) {
        throw new AppError('Habit not found', 404);
    }

    if (habit.user_id !== user_id) {
        throw new AppError('Habit not found', 404);
    }

    return habit;
}


export async function updateHabit(habit_id: string, user_id: string, updates: UpdateHabitInput) {
    const habit = await getHabitById(habit_id, user_id);

    if (updates.title !== undefined && updates.title.trim().length === 0) {
        throw new AppError('Habit title cannot be empty', 400);
    }

    const updated = await prisma.habit.update({
        where: { id: habit.id },
        data: {
            ...(updates.title !== undefined && { title: updates.title.trim() }),
            ...(updates.description !== undefined && { description: updates.description?.trim() || null }),
            ...(updates.frequency !== undefined && { frequency: updates.frequency }),
            ...(updates.color !== undefined && { color: updates.color }),
            ...(updates.icon !== undefined && { icon: updates.icon }),
            ...(updates.background_image !== undefined && { background_image: updates.background_image || null }),
            ...(updates.is_active !== undefined && { is_active: updates.is_active }),
        },
    });

    return updated;
}


export async function deleteHabit(habit_id: string, user_id: string) {
    await getHabitById(habit_id, user_id);

    await prisma.habit.delete({
        where: { id: habit_id },
    });

    return { message: 'Habit deleted' };
}