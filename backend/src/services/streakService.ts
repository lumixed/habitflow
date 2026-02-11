/**
 * Streak Service
 * Manages habit streaks, milestone detection, and streak freeze powerups
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface StreakInfo {
    id: string;
    habitId: string;
    currentCount: number;
    longestCount: number;
    lastCompleted: Date | null;
    milestone?: number; // 7, 30, 100, 365
}

/**
 * Get or create streak for a habit
 */
export async function getOrCreateStreak(userId: string, habitId: string): Promise<StreakInfo> {
    let streak = await prisma.streak.findUnique({
        where: {
            user_id_habit_id: {
                user_id: userId,
                habit_id: habitId
            }
        }
    });

    if (!streak) {
        streak = await prisma.streak.create({
            data: {
                user_id: userId,
                habit_id: habitId,
                current_count: 0,
                longest_count: 0
            }
        });
    }

    return {
        id: streak.id,
        habitId: streak.habit_id,
        currentCount: streak.current_count,
        longestCount: streak.longest_count,
        lastCompleted: streak.last_completed
    };
}

/**
 * Update streak on habit completion
 */
export async function updateStreak(
    userId: string,
    habitId: string,
    completionDate: Date
): Promise<{ streak: StreakInfo; milestone?: number }> {
    const streak = await getOrCreateStreak(userId, habitId);

    // Check if this is a consecutive day
    const isConsecutive = isConsecutiveDay(streak.lastCompleted, completionDate);

    const newCount = isConsecutive ? streak.currentCount + 1 : 1;
    const newLongest = Math.max(newCount, streak.longestCount);

    // Check for milestone
    const milestone = checkMilestone(streak.currentCount, newCount);

    const updatedStreak = await prisma.streak.update({
        where: { id: streak.id },
        data: {
            current_count: newCount,
            longest_count: newLongest,
            last_completed: completionDate
        }
    });

    return {
        streak: {
            id: updatedStreak.id,
            habitId: updatedStreak.habit_id,
            currentCount: updatedStreak.current_count,
            longestCount: updatedStreak.longest_count,
            lastCompleted: updatedStreak.last_completed,
            milestone
        },
        milestone
    };
}

/**
 * Check if completion is consecutive day
 */
function isConsecutiveDay(lastCompleted: Date | null, newDate: Date): boolean {
    if (!lastCompleted) return false;

    const lastDate = new Date(lastCompleted);
    const yesterday = new Date(newDate);
    yesterday.setDate(yesterday.getDate() - 1);

    // Compare just the date parts (ignore time)
    return (
        lastDate.getFullYear() === yesterday.getFullYear() &&
        lastDate.getMonth() === yesterday.getMonth() &&
        lastDate.getDate() === yesterday.getDate()
    );
}

/**
 * Check if a milestone was reached
 */
function checkMilestone(oldCount: number, newCount: number): number | undefined {
    const milestones = [7, 30, 100, 365];

    for (const milestone of milestones) {
        if (oldCount < milestone && newCount >= milestone) {
            return milestone;
        }
    }

    return undefined;
}

/**
 * Get all streaks for a user
 */
export async function getUserStreaks(userId: string): Promise<StreakInfo[]> {
    const streaks = await prisma.streak.findMany({
        where: { user_id: userId },
        include: { habit: true }
    });

    return streaks.map(s => ({
        id: s.id,
        habitId: s.habit_id,
        currentCount: s.current_count,
        longestCount: s.longest_count,
        lastCompleted: s.last_completed
    }));
}

/**
 * Use streak freeze powerup
 */
export async function useStreakFreeze(userId: string, habitId: string): Promise<boolean> {
    // Check if user has streak freeze powerup
    const powerup = await prisma.userPowerup.findFirst({
        where: {
            user_id: userId,
            powerup: {
                key: 'streak_freeze'
            },
            quantity: {
                gt: 0
            }
        },
        include: { powerup: true }
    });

    if (!powerup) {
        return false;
    }

    // Decrease powerup quantity
    await prisma.userPowerup.update({
        where: { id: powerup.id },
        data: {
            quantity: powerup.quantity - 1
        }
    });

    // Update streak's last_completed to today to prevent break
    await prisma.streak.updateMany({
        where: {
            user_id: userId,
            habit_id: habitId
        },
        data: {
            last_completed: new Date()
        }
    });

    return true;
}

/**
 * Check for broken streaks (run daily via cron)
 */
export async function checkBrokenStreaks(): Promise<void> {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    // Find streaks that weren't completed yesterday
    const brokenStreaks = await prisma.streak.findMany({
        where: {
            current_count: {
                gt: 0
            },
            last_completed: {
                lt: yesterday
            }
        }
    });

    // Reset broken streaks
    for (const streak of brokenStreaks) {
        await prisma.streak.update({
            where: { id: streak.id },
            data: {
                current_count: 0
            }
        });
    }
}
