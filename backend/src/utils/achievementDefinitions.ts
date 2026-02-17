/**
 * Achievement Definitions
 * All achievements available in the app
 */

export interface AchievementDefinition {
    key: string;
    name: string;
    description: string;
    icon: string;
    category: 'STREAK' | 'COMPLETION' | 'SOCIAL' | 'MILESTONE' | 'SPECIAL';
    xpReward: number;
    coinReward: number;
    checkUnlock: (data: AchievementCheckData) => boolean;
}

export interface AchievementCheckData {
    userId: string;
    streakCount?: number;
    totalCompletions?: number;
    consecutiveDays?: number;
    habitCount?: number;
    friendCount?: number;
    level?: number;
}

/**
 * All achievement definitions
 */
export const ACHIEVEMENTS: AchievementDefinition[] = [
    // Streak Achievements
    {
        key: '7_day_warrior',
        name: '7-Day Warrior',
        description: 'Complete a habit for 7 days in a row',
        icon: 'Flame',
        category: 'STREAK',
        xpReward: 100,
        coinReward: 50,
        checkUnlock: (data) => (data.streakCount ?? 0) >= 7
    },
    {
        key: '30_day_champion',
        name: '30-Day Champion',
        description: 'Complete a habit for 30 days in a row',
        icon: 'Dumbbell',
        category: 'STREAK',
        xpReward: 500,
        coinReward: 250,
        checkUnlock: (data) => (data.streakCount ?? 0) >= 30
    },
    {
        key: '100_day_legend',
        name: '100-Day Legend',
        description: 'Complete a habit for 100 days in a row',
        icon: 'Crown',
        category: 'STREAK',
        xpReward: 2000,
        coinReward: 1000,
        checkUnlock: (data) => (data.streakCount ?? 0) >= 100
    },
    {
        key: '365_day_master',
        name: '365-Day Master',
        description: 'Complete a habit for an entire year',
        icon: 'Trophy',
        category: 'STREAK',
        xpReward: 10000,
        coinReward: 5000,
        checkUnlock: (data) => (data.streakCount ?? 0) >= 365
    },

    // Completion Achievements
    {
        key: 'first_completion',
        name: 'Getting Started',
        description: 'Complete your first habit',
        icon: 'Lightbulb',
        category: 'COMPLETION',
        xpReward: 50,
        coinReward: 25,
        checkUnlock: (data) => (data.totalCompletions ?? 0) >= 1
    },
    {
        key: '10_completions',
        name: 'Building Momentum',
        description: 'Complete 10 habits',
        icon: 'Zap',
        category: 'COMPLETION',
        xpReward: 100,
        coinReward: 50,
        checkUnlock: (data) => (data.totalCompletions ?? 0) >= 10
    },
    {
        key: '50_completions',
        name: 'Habit Builder',
        description: 'Complete 50 habits',
        icon: 'Target',
        category: 'COMPLETION',
        xpReward: 300,
        coinReward: 150,
        checkUnlock: (data) => (data.totalCompletions ?? 0) >= 50
    },
    {
        key: '100_completions',
        name: 'Century Club',
        description: 'Complete 100 habits',
        icon: 'Award',
        category: 'COMPLETION',
        xpReward: 750,
        coinReward: 375,
        checkUnlock: (data) => (data.totalCompletions ?? 0) >= 100
    },
    {
        key: '500_completions',
        name: 'Unstoppable',
        description: 'Complete 500 habits',
        icon: 'Rocket',
        category: 'COMPLETION',
        xpReward: 2500,
        coinReward: 1250,
        checkUnlock: (data) => (data.totalCompletions ?? 0) >= 500
    },
    {
        key: '1000_completions',
        name: 'Legendary',
        description: 'Complete 1000 habits',
        icon: 'Star',
        category: 'COMPLETION',
        xpReward: 5000,
        coinReward: 2500,
        checkUnlock: (data) => (data.totalCompletions ?? 0) >= 1000
    },

    // Milestone Achievements
    {
        key: 'perfect_week',
        name: 'Perfect Week',
        description: 'Complete all habits for 7 consecutive days',
        icon: 'Calendar',
        category: 'MILESTONE',
        xpReward: 200,
        coinReward: 100,
        checkUnlock: (data) => (data.consecutiveDays ?? 0) >= 7
    },
    {
        key: 'level_5',
        name: 'Rising Star',
        description: 'Reach level 5',
        icon: 'TrendingUp',
        category: 'MILESTONE',
        xpReward: 250,
        coinReward: 125,
        checkUnlock: (data) => (data.level ?? 1) >= 5
    },
    {
        key: 'level_10',
        name: 'Experienced',
        description: 'Reach level 10',
        icon: 'Medal',
        category: 'MILESTONE',
        xpReward: 500,
        coinReward: 250,
        checkUnlock: (data) => (data.level ?? 1) >= 10
    },
    {
        key: 'level_25',
        name: 'Elite',
        description: 'Reach level 25',
        icon: 'Gem',
        category: 'MILESTONE',
        xpReward: 1500,
        coinReward: 750,
        checkUnlock: (data) => (data.level ?? 1) >= 25
    },
    {
        key: 'level_50',
        name: 'Master',
        description: 'Reach level 50',
        icon: 'Crown',
        category: 'MILESTONE',
        xpReward: 5000,
        coinReward: 2500,
        checkUnlock: (data) => (data.level ?? 1) >= 50
    },

    // Social Achievements (for future implementation)
    {
        key: 'first_friend',
        name: 'Social Butterfly',
        description: 'Add your first friend',
        icon: 'Users',
        category: 'SOCIAL',
        xpReward: 100,
        coinReward: 50,
        checkUnlock: (data) => (data.friendCount ?? 0) >= 1
    },
    {
        key: '5_friends',
        name: 'Squad Goals',
        description: 'Add 5 friends',
        icon: 'Users',
        category: 'SOCIAL',
        xpReward: 250,
        coinReward: 125,
        checkUnlock: (data) => (data.friendCount ?? 0) >= 5
    },

    // Special Achievements
    {
        key: 'early_bird',
        name: 'Early Bird',
        description: 'Complete a habit before 6 AM',
        icon: 'Sunrise',
        category: 'SPECIAL',
        xpReward: 150,
        coinReward: 75,
        checkUnlock: () => false // Checked separately in completion logic
    },
    {
        key: 'night_owl',
        name: 'Night Owl',
        description: 'Complete a habit after 10 PM',
        icon: 'Moon',
        category: 'SPECIAL',
        xpReward: 150,
        coinReward: 75,
        checkUnlock: () => false // Checked separately in completion logic
    }
];

/**
 * Get achievement by key
 */
export function getAchievementByKey(key: string): AchievementDefinition | undefined {
    return ACHIEVEMENTS.find(a => a.key === key);
}

/**
 * Get achievements by category
 */
export function getAchievementsByCategory(category: string): AchievementDefinition[] {
    return ACHIEVEMENTS.filter(a => a.category === category);
}
