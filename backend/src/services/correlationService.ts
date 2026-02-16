/**
 * Habit Correlation Service
 * Analyzes relationships between habits to find patterns
 */

import prisma from '../config/prisma';

export interface HabitCorrelation {
    habit1: {
        id: string;
        title: string;
    };
    habit2: {
        id: string;
        title: string;
    };
    correlationScore: number; // -1 to 1
    strength: 'strong' | 'moderate' | 'weak';
    type: 'positive' | 'negative' | 'neutral';
    insight: string;
}

export interface CorrelationAnalysis {
    correlations: HabitCorrelation[];
    insights: string[];
    recommendations: string[];
}

/**
 * Calculate Pearson correlation coefficient between two habits
 */
function calculateCorrelation(completions1: boolean[], completions2: boolean[]): number {
    const n = completions1.length;
    if (n < 7) return 0; // Need at least a week of data

    // Convert booleans to 1/0
    const x = completions1.map(v => v ? 1 : 0);
    const y = completions2.map(v => v ? 1 : 0);

    const sumX = x.reduce((a: number, b) => a + b, 0);
    const sumY = y.reduce((a: number, b) => a + b, 0);
    const sumXY = x.reduce((acc: number, val, i) => acc + val * y[i], 0);
    const sumX2 = x.reduce((acc: number, val) => acc + val * val, 0);
    const sumY2 = y.reduce((acc: number, val) => acc + val * val, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    if (denominator === 0) return 0;

    return numerator / denominator;
}

/**
 * Get correlation strength label
 */
function getCorrelationStrength(score: number): 'strong' | 'moderate' | 'weak' {
    const abs = Math.abs(score);
    if (abs >= 0.7) return 'strong';
    if (abs >= 0.4) return 'moderate';
    return 'weak';
}

/**
 * Get correlation type
 */
function getCorrelationType(score: number): 'positive' | 'negative' | 'neutral' {
    if (score > 0.3) return 'positive';
    if (score < -0.3) return 'negative';
    return 'neutral';
}

/**
 * Generate insight for correlation
 */
function generateInsight(habit1: string, habit2: string, score: number, type: string): string {
    if (type === 'positive') {
        return `When you complete "${habit1}", you're ${Math.round(Math.abs(score) * 100)}% more likely to complete "${habit2}"`;
    } else if (type === 'negative') {
        return `Completing "${habit1}" seems to reduce the likelihood of "${habit2}" by ${Math.round(Math.abs(score) * 100)}%`;
    }
    return `"${habit1}" and "${habit2}" appear to be independent`;
}

/**
 * Analyze habit correlations for a user
 */
export async function analyzeHabitCorrelations(userId: string, days: number = 30): Promise<CorrelationAnalysis> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get all user habits
    const habits = await prisma.habit.findMany({
        where: { user_id: userId },
        select: { id: true, title: true }
    });

    if (habits.length < 2) {
        return {
            correlations: [],
            insights: ['You need at least 2 habits to see correlations'],
            recommendations: []
        };
    }

    // Create date array for the period
    const dates: Date[] = [];
    for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        dates.push(date);
    }

    // Get completions for each habit
    const habitCompletions = new Map<string, boolean[]>();

    for (const habit of habits) {
        const completions = await prisma.completion.findMany({
            where: {
                habit_id: habit.id,
                created_at: { gte: startDate }
            },
            select: { completed_date: true }
        });

        const completionDates = new Set(
            completions.map(c => c.completed_date.toISOString().split('T')[0])
        );

        const dailyCompletions = dates.map(date => {
            const dateStr = date.toISOString().split('T')[0];
            return completionDates.has(dateStr);
        });

        habitCompletions.set(habit.id, dailyCompletions);
    }

    // Calculate correlations between all habit pairs
    const correlations: HabitCorrelation[] = [];

    for (let i = 0; i < habits.length; i++) {
        for (let j = i + 1; j < habits.length; j++) {
            const habit1 = habits[i];
            const habit2 = habits[j];

            const completions1 = habitCompletions.get(habit1.id)!;
            const completions2 = habitCompletions.get(habit2.id)!;

            const score = calculateCorrelation(completions1, completions2);
            const strength = getCorrelationStrength(score);
            const type = getCorrelationType(score);

            // Only include meaningful correlations
            if (Math.abs(score) > 0.3) {
                correlations.push({
                    habit1: { id: habit1.id, title: habit1.title },
                    habit2: { id: habit2.id, title: habit2.title },
                    correlationScore: score,
                    strength,
                    type,
                    insight: generateInsight(habit1.title, habit2.title, score, type)
                });
            }
        }
    }

    // Sort by absolute correlation strength
    correlations.sort((a, b) => Math.abs(b.correlationScore) - Math.abs(a.correlationScore));

    // Generate overall insights
    const insights = generateOverallInsights(correlations);
    const recommendations = generateRecommendations(correlations);

    return {
        correlations: correlations.slice(0, 10), // Top 10 correlations
        insights,
        recommendations
    };
}

function generateOverallInsights(correlations: HabitCorrelation[]): string[] {
    const insights: string[] = [];

    if (correlations.length === 0) {
        insights.push('No significant correlations found. Keep tracking to discover patterns!');
        return insights;
    }

    const strongPositive = correlations.filter(c => c.type === 'positive' && c.strength === 'strong');
    const strongNegative = correlations.filter(c => c.type === 'negative' && c.strength === 'strong');

    if (strongPositive.length > 0) {
        insights.push(`Found ${strongPositive.length} strong positive correlation${strongPositive.length > 1 ? 's' : ''} - these habits reinforce each other!`);
    }

    if (strongNegative.length > 0) {
        insights.push(`Warning: ${strongNegative.length} habit${strongNegative.length > 1 ? 's are' : ' is'} negatively correlated - they might be competing for your time or energy`);
    }

    return insights;
}

function generateRecommendations(correlations: HabitCorrelation[]): string[] {
    const recommendations: string[] = [];

    const strongPositive = correlations.filter(c => c.type === 'positive' && c.strength === 'strong');
    const strongNegative = correlations.filter(c => c.type === 'negative' && c.strength === 'strong');

    if (strongPositive.length > 0) {
        const pair = strongPositive[0];
        recommendations.push(`💡 Try habit stacking: Do "${pair.habit1.title}" right before "${pair.habit2.title}" to maximize success`);
    }

    if (strongNegative.length > 0) {
        const pair = strongNegative[0];
        recommendations.push(`⚠️ Consider scheduling "${pair.habit1.title}" and "${pair.habit2.title}" at different times of day`);
    }

    return recommendations;
}
