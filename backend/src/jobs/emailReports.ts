/**
 * Scheduled Jobs for Email Reports
 * Sends weekly and monthly reports to users
 */

import cron from 'node-cron';
import prisma from '../config/prisma';
import { sendWeeklyReport, sendMonthlyReport } from '../services/emailService';

/**
 * Calculate stats for a user's weekly report
 */
async function getWeeklyStats(userId: string) {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const completions = await prisma.completion.findMany({
        where: {
            user_id: userId,
            created_at: { gte: oneWeekAgo }
        },
        include: {
            habit: true
        }
    });

    const streaks = await prisma.streak.findMany({
        where: { user_id: userId },
        orderBy: { current_count: 'desc' }
    });

    const habitCompletionCounts = completions.reduce((acc, c) => {
        acc[c.habit.title] = (acc[c.habit.title] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const topHabits = Object.entries(habitCompletionCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([title, completions]) => ({ title, completions }));

    // Calculate XP gained this week (rough estimate: 10 XP per completion)
    const xpGained = completions.length * 10;

    return {
        weeklyCompletions: completions.length,
        longestStreak: streaks[0]?.current_count || 0,
        xpGained,
        topHabits
    };
}

/**
 * Calculate stats for a user's monthly report
 */
async function getMonthlyStats(userId: string) {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const completions = await prisma.completion.findMany({
        where: {
            user_id: userId,
            created_at: { gte: oneMonthAgo }
        }
    });

    const streaks = await prisma.streak.findMany({
        where: { user_id: userId }
    });

    const achievements = await prisma.userAchievement.findMany({
        where: {
            user_id: userId,
            unlocked_at: { gte: oneMonthAgo }
        }
    });

    // Calculate unique days active
    const uniqueDays = new Set(
        completions.map(c => c.completed_date.toISOString().split('T')[0])
    ).size;

    // Estimate levels gained (1 level per ~100 XP, 10 XP per completion)
    const levelsGained = Math.floor((completions.length * 10) / 100);

    return {
        totalCompletions: completions.length,
        daysActive: uniqueDays,
        topStreak: Math.max(...streaks.map(s => s.longest_count), 0),
        levelsGained,
        achievementsUnlocked: achievements.length
    };
}

/**
 * Send weekly reports to all users who have opted in
 */
async function sendWeeklyReports() {
    console.log('📧 Starting weekly report job...');

    const users = await prisma.user.findMany({
        where: {
            notification_pref: {
                email_alerts: true
            }
        },
        select: {
            id: true,
            email: true,
            display_name: true
        }
    });

    for (const user of users) {
        try {
            const stats = await getWeeklyStats(user.id);
            await sendWeeklyReport(user.email, user.display_name, stats);
            console.log(`✅ Sent weekly report to ${user.email}`);
        } catch (error) {
            console.error(`❌ Failed to send weekly report to ${user.email}:`, error);
        }
    }

    console.log(`📧 Weekly report job complete. Sent to ${users.length} users.`);
}

/**
 * Send monthly reports to all users who have opted in
 */
async function sendMonthlyReports() {
    console.log('📧 Starting monthly report job...');

    const users = await prisma.user.findMany({
        where: {
            notification_pref: {
                email_alerts: true
            }
        },
        select: {
            id: true,
            email: true,
            display_name: true
        }
    });

    for (const user of users) {
        try {
            const stats = await getMonthlyStats(user.id);
            await sendMonthlyReport(user.email, user.display_name, stats);
            console.log(`✅ Sent monthly report to ${user.email}`);
        } catch (error) {
            console.error(`❌ Failed to send monthly report to ${user.email}:`, error);
        }
    }

    console.log(`📧 Monthly report job complete. Sent to ${users.length} users.`);
}

/**
 * Initialize all scheduled jobs
 */
export function initializeScheduledJobs() {
    // Weekly reports: Every Monday at 9:00 AM
    cron.schedule('0 9 * * 1', sendWeeklyReports, {
        timezone: 'America/Los_Angeles'
    });
    console.log('✅ Scheduled weekly reports (Mondays at 9:00 AM PST)');

    // Monthly reports: First day of the month at 9:00 AM
    cron.schedule('0 9 1 * *', sendMonthlyReports, {
        timezone: 'America/Los_Angeles'
    });
    console.log('✅ Scheduled monthly reports (1st of month at 9:00 AM PST)');
}
