/**
 * XP Calculation Utilities
 * Formulas for calculating XP, levels, and rewards
 */

export interface XPReward {
    baseXP: number;
    bonusXP: number;
    totalXP: number;
    coins: number;
}

/**
 * Base XP awarded per habit completion
 */
const BASE_XP = 50;

/**
 * Base coins awarded per completion
 */
const BASE_COINS = 10;

/**
 * Calculate XP required for a given level
 * Formula: 100 * level^1.5
 */
export function getXPForLevel(level: number): number {
    return Math.floor(100 * Math.pow(level, 1.5));
}

/**
 * Calculate level from total XP
 */
export function getLevelFromXP(totalXP: number): number {
    let level = 1;
    let xpRequired = getXPForLevel(level);

    while (totalXP >= xpRequired) {
        level++;
        xpRequired += getXPForLevel(level);
    }

    return level - 1;
}

/**
 * Calculate XP progress for current level
 */
export function getXPProgress(totalXP: number): {
    currentLevel: number;
    currentLevelXP: number;
    nextLevelXP: number;
    progress: number;
} {
    const currentLevel = getLevelFromXP(totalXP);

    // Calculate XP at start of current level
    let xpAtLevelStart = 0;
    for (let i = 1; i < currentLevel; i++) {
        xpAtLevelStart += getXPForLevel(i);
    }

    const currentLevelXP = totalXP - xpAtLevelStart;
    const nextLevelXP = getXPForLevel(currentLevel + 1);
    const progress = (currentLevelXP / nextLevelXP) * 100;

    return {
        currentLevel,
        currentLevelXP,
        nextLevelXP,
        progress: Math.min(progress, 100)
    };
}

/**
 * Calculate streak multiplier
 * 1-6 days: 1x
 * 7-29 days: 1.5x
 * 30-99 days: 2x
 * 100+ days: 3x
 */
export function getStreakMultiplier(streakCount: number): number {
    if (streakCount >= 100) return 3;
    if (streakCount >= 30) return 2;
    if (streakCount >= 7) return 1.5;
    return 1;
}

/**
 * Calculate XP and coin rewards for a habit completion
 */
export function calculateRewards(streakCount: number): XPReward {
    const multiplier = getStreakMultiplier(streakCount);
    const bonusXP = Math.floor(BASE_XP * (multiplier - 1));
    const totalXP = BASE_XP + bonusXP;
    const coins = Math.floor(BASE_COINS * multiplier);

    return {
        baseXP: BASE_XP,
        bonusXP,
        totalXP,
        coins
    };
}

/**
 * Check if user leveled up
 */
export function checkLevelUp(oldXP: number, newXP: number): {
    leveledUp: boolean;
    oldLevel: number;
    newLevel: number;
} {
    const oldLevel = getLevelFromXP(oldXP);
    const newLevel = getLevelFromXP(newXP);

    return {
        leveledUp: newLevel > oldLevel,
        oldLevel,
        newLevel
    };
}
