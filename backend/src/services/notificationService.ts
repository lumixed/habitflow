import prisma from '../config/prisma';
import { AppError } from '../middleware/errorHandler';
import webpush from 'web-push';

export interface NotificationPref {
    user_id: string;
    email_alerts: boolean;
    push_alerts: boolean;
    reminder_time: string; // "HH:MM"
    smart_reminders: boolean;
}

// Configure web-push
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY && process.env.VAPID_MAILTO) {
    webpush.setVapidDetails(
        process.env.VAPID_MAILTO,
        process.env.VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
    );
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

export async function subscribeToPush(userId: string, subscription: any) {
    return prisma.pushSubscription.upsert({
        where: { endpoint: subscription.endpoint },
        update: {
            user_id: userId,
            p256dh: subscription.keys.p256dh,
            auth: subscription.keys.auth,
        },
        create: {
            user_id: userId,
            endpoint: subscription.endpoint,
            p256dh: subscription.keys.p256dh,
            auth: subscription.keys.auth,
        },
    });
}

export async function sendPushNotification(userId: string, title: string, body: string, data?: any) {
    const subscriptions = await prisma.pushSubscription.findMany({
        where: { user_id: userId },
    });

    const payload = JSON.stringify({
        title,
        body,
        data,
    });

    const promises = subscriptions.map((sub) => {
        const pushSubscription = {
            endpoint: sub.endpoint,
            keys: {
                p256dh: sub.p256dh,
                auth: sub.auth,
            },
        };

        return webpush.sendNotification(pushSubscription, payload).catch((error) => {
            console.error('Push error:', error);
            if (error.statusCode === 410 || error.statusCode === 404) {
                // Subscription has expired or is no longer valid
                return prisma.pushSubscription.delete({ where: { id: sub.id } });
            }
        });
    });

    return Promise.all(promises);
}
