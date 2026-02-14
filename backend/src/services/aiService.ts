import prisma from '../config/prisma';
import { startOfDay, endOfDay, subDays } from 'date-fns';

export interface HabitInsight {
    habit_id: string;
    success_probability: number; // 0-100
    peak_completion_hour: number | null;
    consistency_score: number; // 0-100
    insight_text: string;
}

/**
 * Calculate success probability for a habit based on last 14 days
 */
export async function getHabitProbability(habitId: string, userId: string): Promise<HabitInsight> {
    const today = new Date();
    const fourteenDaysAgo = subDays(today, 14);

    const completions = await prisma.completion.findMany({
        where: {
            habit_id: habitId,
            user_id: userId,
            completed_date: {
                gte: fourteenDaysAgo,
                lte: today
            }
        },
        orderBy: { completed_date: 'asc' }
    });

    const completionCount = completions.length;
    const successProbability = Math.min(100, Math.round((completionCount / 14) * 100));

    // Calculate peak hour
    const hourCounts: Record<number, number> = {};
    completions.forEach((c) => {
        const hour = new Date(c.completed_date).getHours();
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    let peakHour: number | null = null;
    let maxCount = 0;
    for (const [hour, count] of Object.entries(hourCounts)) {
        if (count > maxCount) {
            maxCount = count;
            peakHour = parseInt(hour);
        }
    }

    // Consistency score (measured by variance in completion time)
    let consistencyScore = 50; // default
    if (completions.length >= 3) {
        const hours = completions.map(c => new Date(c.completed_date).getHours());
        const mean = hours.reduce((a, b) => a + b, 0) / hours.length;
        const variance = hours.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / hours.length;
        consistencyScore = Math.max(0, Math.min(100, 100 - (variance * 4))); // Arbitrary scaling
    }

    // Generate insight text
    let insight_text = "Keep going! Consistency is key.";
    if (successProbability > 80) {
        insight_text = "Legendary consistency! You're crushing this habit.";
    } else if (peakHour !== null) {
        const ampm = peakHour >= 12 ? 'PM' : 'AM';
        const displayHour = peakHour % 12 || 12;
        insight_text = `You're most successful around ${displayHour} ${ampm}. Setting a reminder then might help!`;
    } else if (completionCount === 0) {
        insight_text = "Fresh start! A small win today will build momentum.";
    }

    return {
        habit_id: habitId,
        success_probability: successProbability,
        peak_completion_hour: peakHour,
        consistency_score: Math.round(consistencyScore),
        insight_text
    };
}

/**
 * Get insights for all user habits
 */
export async function getAllHabitInsights(userId: string): Promise<HabitInsight[]> {
    const habits = await prisma.habit.findMany({
        where: { user_id: userId, is_active: true }
    });

    return Promise.all(
        habits.map(habit => getHabitProbability(habit.id, userId))
    );
}

/**
 * Suggest new habits based on user's current habits
 */
export async function suggestNewHabits(userId: string): Promise<string[]> {
    const currentHabits = await prisma.habit.findMany({
        where: { user_id: userId },
        select: { title: true }
    });

    const currentTitles = currentHabits.map(h => h.title.toLowerCase());

    // Simple rule-based recommendations
    const pools: Record<string, string[]> = {
        fitness: ['Running', 'Weightlifting', 'Cycling', 'Swimming', 'Yoga', 'HIIT', 'Stretching'],
        learning: ['Reading', 'Coding', 'Language Practice', 'Writing', 'Podcast'],
        health: ['Drinking Water', 'Meditation', 'Early Sleep', 'Healthy Breakfast', 'Journaling'],
        productivity: ['Planning Day', 'Inbox Zero', 'Deep Work', 'Reviewing Goals'],
    };

    const recommendations: string[] = [];

    // Analyze current habits to find missing categories
    if (!currentTitles.some(t => pools.fitness.some(f => t.includes(f.toLowerCase())))) {
        recommendations.push(pools.fitness[Math.floor(Math.random() * pools.fitness.length)]);
    }
    if (!currentTitles.some(t => pools.learning.some(l => t.includes(l.toLowerCase())))) {
        recommendations.push(pools.learning[Math.floor(Math.random() * pools.learning.length)]);
    }
    if (!currentTitles.some(t => pools.health.some(h => t.includes(h.toLowerCase())))) {
        recommendations.push(pools.health[Math.floor(Math.random() * pools.health.length)]);
    }

    // Default recommendations if user has none or too few
    if (recommendations.length < 3) {
        const allSuggestions = Object.values(pools).flat();
        while (recommendations.length < 3) {
            const randomSuggestion = allSuggestions[Math.floor(Math.random() * allSuggestions.length)];
            if (!currentTitles.includes(randomSuggestion.toLowerCase()) && !recommendations.includes(randomSuggestion)) {
                recommendations.push(randomSuggestion);
            }
        }
    }

    return recommendations.slice(0, 3);
}

/**
 * Suggest habit stacks based on existing habits
 */
export async function suggestHabitStacks(userId: string): Promise<{ trigger: string; suggestion: string }[]> {
    const habits = await prisma.habit.findMany({
        where: { user_id: userId, is_active: true },
        select: { title: true }
    });

    const stacks: { trigger: string; suggestion: string }[] = [];
    const titles = habits.map(h => h.title.toLowerCase());

    const stackRules = [
        { trigger: 'Coffee', suggestion: 'Meditation' },
        { trigger: 'Lunch', suggestion: 'Quick Walk' },
        { trigger: 'Wake up', suggestion: 'Stretching' },
        { trigger: 'Brush teeth', suggestion: 'Flossing' },
        { trigger: 'Gym', suggestion: 'Shower' },
        { trigger: 'Dinner', suggestion: 'Reading' },
        { trigger: 'Bed', suggestion: 'Journaling' },
    ];

    stackRules.forEach(rule => {
        if (titles.some(t => t.includes(rule.trigger.toLowerCase()))) {
            // Check if they already have the suggestion
            if (!titles.some(t => t.includes(rule.suggestion.toLowerCase()))) {
                stacks.push(rule);
            }
        }
    });

    // If no specific rules match, suggest generic ones
    if (stacks.length === 0) {
        const trigger = habits.length > 0 ? habits[0].title : 'Wake up';
        stacks.push({ trigger, suggestion: '5 minutes of Mindfulness' });
    }

    return stacks.slice(0, 2);
}
