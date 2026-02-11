/**
 * Achievement Service
 * Manages achievement unlocking and progress tracking
 */

import { PrismaClient } from '@prisma/client';
import { ACHIEVEMENTS, AchievementCheckData, AchievementDefinition } from '../utils/achievementDefinitions';

const prisma = new PrismaClient();

export interface UnlockedAchievement {
    key: string;
    name: string;
    description: string;
    icon: string;
    xpReward: number;
    coinReward: number;
    unlockedAt: Date;
}

/**
 * Seed achievements into database
 */
export async function seedAchievements(): Promise<void> {
    for (const achievement of ACHIEVEMENTS) {
        await prisma.achievement.upsert({
            where: { key: achievement.key },
            update: {
                name: achievement.name,
                description: achievement.description,
                icon: achievement.icon,
                category: achievement.category,
                xp_reward: achievement.xpReward,
                coin_reward: achievement.coinReward
            },
            create: {
                key: achievement.key,
                name: achievement.name,
                description: achievement.description,
                icon: achievement.icon,
                category: achievement.category,
                xp_reward: achievement.xpReward,
                coin_reward: achievement.coinReward
            }
        });
    }
}

/**
 * Check and unlock achievements for a user
 */
export async function checkAchievements(
    userId: string,
    checkData: AchievementCheckData
): Promise<UnlockedAchievement[]> {
    const newlyUnlocked: UnlockedAchievement[] = [];

    // Get user's already unlocked achievements
    const unlockedAchievements = await prisma.userAchievement.findMany({
        where: { user_id: userId },
        include: { achievement: true }
    });

    const unlockedKeys = new Set(unlockedAchievements.map(ua => ua.achievement.key));

    // Check each achievement
    for (const achievementDef of ACHIEVEMENTS) {
        // Skip if already unlocked
        if (unlockedKeys.has(achievementDef.key)) {
            continue;
        }

        // Check unlock condition
        if (achievementDef.checkUnlock(checkData)) {
            // Get achievement from database
            const achievement = await prisma.achievement.findUnique({
                where: { key: achievementDef.key }
            });

            if (!achievement) continue;

            // Unlock achievement
            const userAchievement = await prisma.userAchievement.create({
                data: {
                    user_id: userId,
                    achievement_id: achievement.id
                }
            });

            newlyUnlocked.push({
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

    return newlyUnlocked;
}

/**
 * Get all achievements with user progress
 */
export async function getAllAchievementsWithProgress(userId: string) {
    const allAchievements = await prisma.achievement.findMany({
        include: {
            users: {
                where: { user_id: userId }
            }
        }
    });

    return allAchievements.map(achievement => ({
        key: achievement.key,
        name: achievement.name,
        description: achievement.description,
        icon: achievement.icon,
        category: achievement.category,
        xpReward: achievement.xp_reward,
        coinReward: achievement.coin_reward,
        unlocked: achievement.users.length > 0,
        unlockedAt: achievement.users[0]?.unlocked_at || null
    }));
}

/**
 * Get user's unlocked achievements
 */
export async function getUserAchievements(userId: string) {
    const userAchievements = await prisma.userAchievement.findMany({
        where: { user_id: userId },
        include: { achievement: true },
        orderBy: { unlocked_at: 'desc' }
    });

    return userAchievements.map(ua => ({
        key: ua.achievement.key,
        name: ua.achievement.name,
        description: ua.achievement.description,
        icon: ua.achievement.icon,
        category: ua.achievement.category,
        xpReward: ua.achievement.xp_reward,
        coinReward: ua.achievement.coin_reward,
        unlockedAt: ua.unlocked_at
    }));
}

/**
 * Check special time-based achievements
 */
export function checkSpecialAchievements(completionTime: Date): string[] {
    const achievements: string[] = [];
    const hour = completionTime.getHours();

    // Early Bird (before 6 AM)
    if (hour < 6) {
        achievements.push('early_bird');
    }

    // Night Owl (after 10 PM)
    if (hour >= 22) {
        achievements.push('night_owl');
    }

    return achievements;
}
