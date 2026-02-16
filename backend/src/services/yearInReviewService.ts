/**
 * Year in Review Service
 * Generates annual wrap-up statistics and insights
 */

import prisma from '../config/prisma';

export interface YearInReviewData {
    year: number;
    totalCompletions: number;
    totalDaysActive: number;
    longestStreak: number;
    totalXPGained: number;
    levelsGained: number;
    achievementsUnlocked: number;
    coinsEarned: number;

    topHabits: Array<{
        title: string;
        completions: number;
        consistency: number; // percentage
    }>;

    monthlyBreakdown: Array<{
        month: string;
        completions: number;
    }>;

    insights: string[];
}

export async function getYearInReview(userId: string, year: number = new Date().getFullYear()): Promise<YearInReviewData> {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59);

    // Get completions for the year
    const completions = await prisma.completion.findMany({
        where: {
            user_id: userId,
            created_at: {
                gte: startDate,
                lte: endDate
            }
        },
        include: {
            habit: true
        }
    });

    // Get user data from start and end of year
    const userStart = await prisma.user.findUnique({
        where: { id: userId },
        select: { xp: true, level: true, coins: true }
    });

    // Calculate unique days active
    const uniqueDays = new Set(
        completions.map(c => c.completed_date.toISOString().split('T')[0])
    ).size;

    // Get streaks
    const streaks = await prisma.streak.findMany({
        where: {
            user_id: userId
        }
    });
    const longestStreak = Math.max(...streaks.map(s => s.longest_count), 0);

    // Get achievements unlocked this year
    const achievements = await prisma.userAchievement.findMany({
        where: {
            user_id: userId,
            unlocked_at: {
                gte: startDate,
                lte: endDate
            }
        }
    });

    // Calculate habit statistics
    const habitStats = completions.reduce((acc, c) => {
        const habitId = c.habit.id;
        if (!acc[habitId]) {
            acc[habitId] = {
                title: c.habit.title,
                completions: 0,
                uniqueDays: new Set()
            };
        }
        acc[habitId].completions++;
        acc[habitId].uniqueDays.add(c.completed_date.toISOString().split('T')[0]);
        return acc;
    }, {} as Record<string, any>);

    const topHabits = Object.values(habitStats)
        .map((h: any) => ({
            title: h.title,
            completions: h.completions,
            consistency: Math.round((h.uniqueDays.size / 365) * 100)
        }))
        .sort((a, b) => b.completions - a.completions)
        .slice(0, 5);

    // Monthly breakdown
    const monthlyBreakdown = Array.from({ length: 12 }, (_, i) => {
        const month = new Date(year, i, 1).toLocaleString('en-US', { month: 'short' });
        const monthCompletions = completions.filter(c => c.created_at.getMonth() === i).length;
        return { month, completions: monthCompletions };
    });

    // Generate insights
    const insights = generateInsights({
        totalCompletions: completions.length,
        totalDaysActive: uniqueDays,
        topHabits,
        monthlyBreakdown,
        achievementsUnlocked: achievements.length
    });

    // Estimate XP and levels (rough calculation)
    const totalXPGained = completions.length * 10;
    const levelsGained = Math.floor(totalXPGained / 100);
    const coinsEarned = completions.length * 5;

    return {
        year,
        totalCompletions: completions.length,
        totalDaysActive: uniqueDays,
        longestStreak,
        totalXPGained,
        levelsGained,
        achievementsUnlocked: achievements.length,
        coinsEarned,
        topHabits,
        monthlyBreakdown,
        insights
    };
}

function generateInsights(data: {
    totalCompletions: number;
    totalDaysActive: number;
    topHabits: any[];
    monthlyBreakdown: any[];
    achievementsUnlocked: number;
}): string[] {
    const insights: string[] = [];

    if (data.totalDaysActive > 300) {
        insights.push(`🔥 You showed up ${data.totalDaysActive} days this year - that's incredible consistency!`);
    } else if (data.totalDaysActive > 200) {
        insights.push(`💪 You were active ${data.totalDaysActive} days - more than half the year!`);
    }

    if (data.topHabits.length > 0) {
        insights.push(`⭐ Your top habit was "${data.topHabits[0].title}" with ${data.topHabits[0].completions} completions`);
    }

    const bestMonth = data.monthlyBreakdown.reduce((max, month) =>
        month.completions > max.completions ? month : max
    );
    insights.push(`📈 ${bestMonth.month} was your most productive month with ${bestMonth.completions} completions`);

    if (data.achievementsUnlocked > 10) {
        insights.push(`🏆 You unlocked ${data.achievementsUnlocked} achievements - you're unstoppable!`);
    }

    const avgPerDay = (data.totalCompletions / Math.max(data.totalDaysActive, 1)).toFixed(1);
    insights.push(`📊 On average, you completed ${avgPerDay} habits per active day`);

    return insights;
}
