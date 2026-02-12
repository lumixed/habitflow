/**
 * Gamification Service
 * Core gamification logic: XP, levels, coins, powerups
 */

import { PrismaClient } from '@prisma/client';
import { calculateRewards, checkLevelUp, getXPProgress, getLevelFromXP } from '../utils/xpCalculator';
import { updateStreak } from './streakService';
import { checkAchievements, checkSpecialAchievements } from './achievementService';

const prisma = new PrismaClient();

export interface GamificationRewards {
    xp: number;
    coins: number;
    levelUp?: {
        oldLevel: number;
        newLevel: number;
    };
    newAchievements: Array<{
        key: string;
        name: string;
        description: string;
        icon: string;
        xpReward: number;
        coinReward: number;
    }>;
    streakMilestone?: number;
    streakCount: number;
}

/**
 * Process gamification rewards for a habit completion
 */
export async function processCompletion(
    userId: string,
    habitId: string,
    completionDate: Date
): Promise<GamificationRewards> {
    // Update streak
    const { streak, milestone } = await updateStreak(userId, habitId, completionDate);

    // Calculate XP and coin rewards based on streak
    const rewards = calculateRewards(streak.currentCount);

    // Get user's current stats
    const user = await prisma.user.findUnique({
        where: { id: userId }
    });

    if (!user) {
        throw new Error('User not found');
    }

    const oldXP = user.xp;
    const newXP = oldXP + rewards.totalXP;

    // Check for level up
    const levelUpInfo = checkLevelUp(oldXP, newXP);

    // Get total completions for achievement checking
    const totalCompletions = await prisma.completion.count({
        where: { user_id: userId }
    });

    // Check for special time-based achievements
    const specialAchievementKeys = checkSpecialAchievements(completionDate);

    // Check for achievements
    const newAchievements = await checkAchievements(userId, {
        userId,
        streakCount: streak.currentCount,
        totalCompletions,
        level: levelUpInfo.newLevel
    });

    // Add special achievements to check data
    for (const key of specialAchievementKeys) {
        const achievement = await prisma.achievement.findUnique({
            where: { key }
        });

        if (achievement) {
            // Check if user already has this achievement
            const existing = await prisma.userAchievement.findUnique({
                where: {
                    user_id_achievement_id: {
                        user_id: userId,
                        achievement_id: achievement.id
                    }
                }
            });

            if (!existing) {
                const userAchievement = await prisma.userAchievement.create({
                    data: {
                        user_id: userId,
                        achievement_id: achievement.id
                    }
                });

                newAchievements.push({
                    key: achievement.key,
                    name: achievement.name,
                    description: achievement.description,
                    icon: achievement.icon,
                    xpReward: achievement.xp_reward,
                    coinReward: achievement.coin_reward,
                    unlockedAt: userAchievement.unlocked_at
                });
            }
        }
    }

    // Calculate total achievement rewards
    const achievementXP = newAchievements.reduce((sum, a) => sum + a.xpReward, 0);
    const achievementCoins = newAchievements.reduce((sum, a) => sum + a.coinReward, 0);

    const totalXP = newXP + achievementXP;
    const totalCoins = user.coins + rewards.coins + achievementCoins;

    // Update user stats
    await prisma.user.update({
        where: { id: userId },
        data: {
            xp: totalXP,
            level: levelUpInfo.newLevel,
            coins: totalCoins
        }
    });

    // Log level up
    if (levelUpInfo.leveledUp) {
        const { logActivity } = require('./socialService');
        logActivity(userId, 'LEVEL_UP', undefined, `Reached level ${levelUpInfo.newLevel}`, { level: levelUpInfo.newLevel }).catch((err: any) => console.error('Failed to log level up activity:', err));
    }

    // Log achievements
    if (newAchievements.length > 0) {
        const { logActivity } = require('./socialService');
        for (const achievement of newAchievements) {
            logActivity(userId, 'ACHIEVEMENT_UNLOCKED', achievement.key, achievement.name).catch((err: any) => console.error('Failed to log achievement activity:', err));
        }
    }

    return {
        xp: rewards.totalXP + achievementXP,
        coins: rewards.coins + achievementCoins,
        levelUp: levelUpInfo.leveledUp ? {
            oldLevel: levelUpInfo.oldLevel,
            newLevel: levelUpInfo.newLevel
        } : undefined,
        newAchievements,
        streakMilestone: milestone,
        streakCount: streak.currentCount
    };
}

/**
 * Rollback gamification rewards for a removed completion
 */
export async function rollbackCompletion(
    userId: string,
    habitId: string,
    completionDate: Date
): Promise<void> {
    // Get streak info
    const streak = await prisma.streak.findUnique({
        where: {
            user_id_habit_id: {
                user_id: userId,
                habit_id: habitId
            }
        }
    });

    if (!streak) return;

    // Calculate rewards that would have been given
    const rewards = calculateRewards(streak.current_count);

    // Update user stats (decrement XP and coins)
    const user = await prisma.user.findUnique({
        where: { id: userId }
    });

    if (user) {
        const newXP = Math.max(0, user.xp - rewards.totalXP);
        const newCoins = Math.max(0, user.coins - rewards.coins);
        const newLevel = getLevelFromXP(newXP);

        await prisma.user.update({
            where: { id: userId },
            data: {
                xp: newXP,
                coins: newCoins,
                level: newLevel
            }
        });
    }

    // Rollback streak
    // Find previous completion to restore last_completed date
    const lastCompletion = await prisma.completion.findFirst({
        where: {
            habit_id: habitId,
            completed_date: {
                lt: completionDate
            }
        },
        orderBy: {
            completed_date: 'desc'
        }
    });

    await prisma.streak.update({
        where: { id: streak.id },
        data: {
            current_count: Math.max(0, streak.current_count - 1),
            last_completed: lastCompletion ? lastCompletion.completed_date : null
        }
    });
}

/**
 * Get user's gamification stats
 */
export async function getUserStats(userId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            achievements: {
                include: { achievement: true }
            },
            streaks: {
                include: { habit: true }
            }
        }
    });

    if (!user) {
        throw new Error('User not found');
    }

    const xpProgress = getXPProgress(user.xp);

    // Get longest current streak
    const longestStreak = user.streaks.reduce((max, s) =>
        Math.max(max, s.current_count), 0
    );

    return {
        userId: user.id,
        displayName: user.display_name,
        avatarUrl: user.avatar_url,
        level: user.level,
        xp: user.xp,
        coins: user.coins,
        xpProgress: {
            currentLevelXP: xpProgress.currentLevelXP,
            nextLevelXP: xpProgress.nextLevelXP,
            progress: xpProgress.progress
        },
        achievements: user.achievements.map(ua => ({
            key: ua.achievement.key,
            name: ua.achievement.name,
            icon: ua.achievement.icon,
            unlockedAt: ua.unlocked_at
        })),
        streaks: user.streaks.map(s => ({
            habitTitle: s.habit.title,
            currentCount: s.current_count
        })),
        achievementCount: user.achievements.length,
        longestStreak
    };
}

/**
 * Get leaderboard
 */
export async function getLeaderboard(limit: number = 10) {
    const topUsers = await prisma.user.findMany({
        orderBy: { xp: 'desc' },
        take: limit,
        select: {
            id: true,
            display_name: true,
            avatar_url: true,
            level: true,
            xp: true
        }
    });

    return topUsers.map((user, index) => ({
        rank: index + 1,
        userId: user.id,
        displayName: user.display_name,
        avatarUrl: user.avatar_url,
        level: user.level,
        xp: user.xp
    }));
}

/**
 * Get available powerups
 */
export async function getAvailablePowerups() {
    return await prisma.powerup.findMany();
}

/**
 * Get user's powerups
 */
export async function getUserPowerups(userId: string) {
    const userPowerups = await prisma.userPowerup.findMany({
        where: { user_id: userId },
        include: { powerup: true }
    });

    return userPowerups.map(up => ({
        id: up.powerup.id,
        key: up.powerup.key,
        name: up.powerup.name,
        description: up.powerup.description,
        icon: up.powerup.icon,
        costCoins: up.powerup.cost_coins,
        quantity: up.quantity
    }));
}

/**
 * Purchase a powerup
 */
export async function purchasePowerup(userId: string, powerupKey: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
        where: { id: userId }
    });

    const powerup = await prisma.powerup.findUnique({
        where: { key: powerupKey }
    });

    if (!user || !powerup) {
        return false;
    }

    // Check if user has enough coins
    if (user.coins < powerup.cost_coins) {
        return false;
    }

    // Deduct coins
    await prisma.user.update({
        where: { id: userId },
        data: {
            coins: user.coins - powerup.cost_coins
        }
    });

    // Add powerup to user's inventory
    const existingPowerup = await prisma.userPowerup.findUnique({
        where: {
            user_id_powerup_id: {
                user_id: userId,
                powerup_id: powerup.id
            }
        }
    });

    if (existingPowerup) {
        await prisma.userPowerup.update({
            where: { id: existingPowerup.id },
            data: {
                quantity: existingPowerup.quantity + 1
            }
        });
    } else {
        await prisma.userPowerup.create({
            data: {
                user_id: userId,
                powerup_id: powerup.id,
                quantity: 1
            }
        });
    }

    return true;
}

/**
 * Seed initial powerups
 */
export async function seedPowerups(): Promise<void> {
    const powerups = [
        {
            key: 'streak_freeze',
            name: 'Streak Freeze',
            description: 'Protect your streak for one day',
            icon: '❄️',
            cost_coins: 100
        },
        {
            key: 'double_xp',
            name: 'Double XP',
            description: 'Earn 2x XP for 24 hours',
            icon: '⚡',
            cost_coins: 200
        }
    ];

    for (const powerup of powerups) {
        await prisma.powerup.upsert({
            where: { key: powerup.key },
            update: powerup,
            create: powerup
        });
    }
}
