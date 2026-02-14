import prisma from '../config/prisma';
import { AppError } from '../middleware/errorHandler';

export interface NotificationPref {
    user_id: string;
    email_alerts: boolean;
    push_alerts: boolean;
    reminder_time: string; // "HH:MM"
    smart_reminders: boolean;
}

export async function getNotificationPrefs(userId: string) {
    let prefs = await prisma.notificationPref.findUnique({
        where: { user_id: userId },
    });

    if (!prefs) {
        // Create default prefs if they don't exist
        prefs = await prisma.notificationPref.create({
            data: {
                user_id: userId,
                email_alerts: true,
                push_alerts: true,
                reminder_time: '09:00',
            },
        });
    }

    return prefs;
}

export async function updateNotificationPrefs(userId: string, data: Partial<NotificationPref>) {
    return prisma.notificationPref.upsert({
        where: { user_id: userId },
        update: data,
        create: {
            user_id: userId,
            email_alerts: data.email_alerts ?? true,
            push_alerts: data.push_alerts ?? true,
            reminder_time: data.reminder_time ?? '09:00',
        },
    });
}

/**
 * AI/ML-based timing suggestion
 * Analyzes past completions to find when the user is most likely to finish habits.
 */
export async function calculateSmartReminderTime(userId: string) {
    const completions = await prisma.completion.findMany({
        where: { user_id: userId },
        orderBy: { completed_date: 'desc' },
        take: 50, // Analyze recent 50 completions
    });

    if (completions.length < 5) {
        return null; // Not enough data for AI suggestion
    }

    // Group completions by hour
    const hourCounts: Record<number, number> = {};
    completions.forEach((c) => {
        const hour = new Date(c.completed_date).getHours();
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    // Find the peak hour
    let peakHour = 9; // default
    let maxCount = 0;
    for (const [hour, count] of Object.entries(hourCounts)) {
        if (count > maxCount) {
            maxCount = count;
            peakHour = parseInt(hour);
        }
    }

    // Suggest 30 minutes before the peak hour for a reminder
    const suggestHour = peakHour > 0 ? peakHour : 0;
    const formattedHour = suggestHour.toString().padStart(2, '0');

    return `${formattedHour}:00`;
}
