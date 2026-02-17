/**
 * Analytics Service
 * Handles data aggregation for heatmaps, trends, and user insights
 */

import { PrismaClient } from '@prisma/client';
import { format, startOfYear, endOfYear, eachDayOfInterval, isSameDay } from 'date-fns';

const prisma = new PrismaClient();

export interface HeatmapData {
    date: string;
    count: number;
    intensity: number; // 0-4 scale
}

export interface UserInsights {
    totalCompletions: number;
    bestStreak: number;
    averageCompletionsPerWeek: number;
    mostProductiveDay: string;
    mostProductiveTime: string;
}

/**
 * Get heatmap data for a specific year
 */
export async function getHeatmapData(userId: string, year: number): Promise<HeatmapData[]> {
    const startDate = startOfYear(new Date(year, 0, 1));
    const endDate = endOfYear(new Date(year, 0, 1));

    const completions = await prisma.completion.findMany({
        where: {
            user_id: userId,
            completed_date: {
                gte: startDate,
                lte: endDate,
            },
        },
        select: {
            completed_date: true,
        },
    });

    // Aggregate by date string
    const counts: Record<string, number> = {};
    completions.forEach((c) => {
        const dateStr = format(c.completed_date, 'yyyy-MM-dd');
        counts[dateStr] = (counts[dateStr] || 0) + 1;
    });

    // Generate full year interval
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    return days.map((day: Date) => {
        const dateStr = format(day, 'yyyy-MM-dd');
        const count = counts[dateStr] || 0;

        // Calculate intensity (0-4) based on count
        let intensity = 0;
        if (count > 0) intensity = 1;
        if (count > 2) intensity = 2;
        if (count > 4) intensity = 3;
        if (count > 6) intensity = 4;

        return {
            date: dateStr,
            count,
            intensity,
        };
    });
}

/**
 * Calculate/Update user insights
 */
export async function updateUserInsights(userId: string): Promise<UserInsights> {
    const completions = await prisma.completion.findMany({
        where: { user_id: userId },
        orderBy: { completed_date: 'asc' },
    });

    const totalCompletions = completions.length;

    // Calculate best streak across all habits
    const streaks = await prisma.streak.findMany({
        where: { user_id: userId },
        select: { longest_count: true },
    });
    const bestStreak = streaks.length > 0 ? Math.max(0, ...streaks.map((s) => s.longest_count)) : 0;

    // Calculate productive patterns
    const dayCounts: Record<string, number> = {
        'Monday': 0, 'Tuesday': 0, 'Wednesday': 0, 'Thursday': 0, 'Friday': 0, 'Saturday': 0, 'Sunday': 0
    };

    const timeCounts: Record<string, number> = {
        'Morning': 0, 'Afternoon': 0, 'Evening': 0, 'Night': 0
    };

    completions.forEach((c) => {
        const date = c.completed_date;
        const day = format(date, 'EEEE');
        dayCounts[day]++;

        const hour = date.getHours();
        if (hour >= 5 && hour < 12) timeCounts['Morning']++;
        else if (hour >= 12 && hour < 17) timeCounts['Afternoon']++;
        else if (hour >= 17 && hour < 21) timeCounts['Evening']++;
        else timeCounts['Night']++;
    });

    const mostProductiveDay = Object.keys(dayCounts).reduce((a, b) => dayCounts[a] > dayCounts[b] ? a : b);
    const mostProductiveTime = Object.keys(timeCounts).reduce((a, b) => timeCounts[a] > timeCounts[b] ? a : b);

    // Calc average completions per week
    let avgPerWeek = 0;
    if (completions.length > 0) {
        const firstDate = completions[0].completed_date;
        const now = new Date();
        const diffInMs = now.getTime() - firstDate.getTime();
        const diffInWeeks = Math.max(1, diffInMs / (1000 * 60 * 60 * 24 * 7));
        avgPerWeek = totalCompletions / diffInWeeks;
    }

    // Update the Analytics table
    await prisma.analytics.upsert({
        where: { user_id: userId },
        create: {
            user_id: userId,
            best_streak: bestStreak,
            total_completions: totalCompletions,
            average_completions_per_week: avgPerWeek,
            most_productive_day: mostProductiveDay,
            most_productive_time: mostProductiveTime,
        },
        update: {
            best_streak: bestStreak,
            total_completions: totalCompletions,
            average_completions_per_week: avgPerWeek,
            most_productive_day: mostProductiveDay,
            most_productive_time: mostProductiveTime,
            last_updated: new Date(),
        },
    });

    return {
        totalCompletions,
        bestStreak,
        averageCompletionsPerWeek: avgPerWeek,
        mostProductiveDay,
        mostProductiveTime,
    };
}

/**
 * Get trend data (completion rate over last 30 days)
 */
export async function getTrendData(userId: string) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const completions = await prisma.completion.findMany({
        where: {
            user_id: userId,
            completed_date: { gte: thirtyDaysAgo },
        },
        select: { completed_date: true },
    });

    const counts: Record<string, number> = {};
    completions.forEach((c) => {
        const dateStr = format(c.completed_date, 'MMM d');
        counts[dateStr] = (counts[dateStr] || 0) + 1;
    });

    // Return last 30 days in order
    const result = [];
    for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const label = format(d, 'MMM d');
        result.push({
            label,
            count: counts[label] || 0,
        });
    }

    return result;
}

/**
 * Get community-wide global statistics
 */
export async function getGlobalStats() {
    const [totalUsers, totalCompletions, activeChallenges] = await Promise.all([
        prisma.user.count(),
        prisma.completion.count(),
        prisma.challenge.count({
            where: {
                end_date: { gte: new Date() }
            }
        })
    ]);

    // Get popular habits (top 3 by title)
    const popularHabitsData = await prisma.habit.groupBy({
        by: ['title'],
        _count: {
            id: true
        },
        orderBy: {
            _count: {
                id: 'desc'
            }
        },
        take: 3,
        where: {
            is_active: true
        }
    });

    const popularHabits = popularHabitsData.map(h => ({
        title: h.title,
        count: h._count.id
    }));

    return {
        totalUsers,
        totalHabitCompletions: totalCompletions,
        activeChallenges,
        popularHabits
    };
}
