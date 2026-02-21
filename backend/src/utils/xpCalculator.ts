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
 * Smoother multiplier: +1% per day of streak, capped at 2x (100 days)
 * Large milestones still give extra jumps: 
 * 7 days: +10%, 30 days: +25%
 */
export function getStreakMultiplier(streakCount: number): number {
    let multiplier = 1.0;

    // Smooth daily bonus (capped at 100 days / 2x base)
    multiplier += Math.min(streakCount, 100) * 0.01;

    // Milestone jumps
    if (streakCount >= 30) multiplier += 0.25;
    else if (streakCount >= 7) multiplier += 0.1;

    return Number(multiplier.toFixed(2));
}

/**
 * Difficulty multipliers
 */
export const DIFFICULTY_MULTIPLIERS: Record<string, number> = {
    EASY: 0.8,
    MEDIUM: 1.0,
    HARD: 1.5
};

/**
 * Calculate XP and coin rewards for a habit completion
 */
export function calculateRewards(streakCount: number, difficulty: string = 'MEDIUM'): XPReward {
    const streakMultiplier = getStreakMultiplier(streakCount);
    const difficultyMultiplier = DIFFICULTY_MULTIPLIERS[difficulty] || 1.0;

    const combinedMultiplier = streakMultiplier * difficultyMultiplier;

    const totalXP = Math.floor(BASE_XP * combinedMultiplier);
    const bonusXP = totalXP - BASE_XP;
    const coins = Math.floor(BASE_COINS * combinedMultiplier);

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
