import axios from 'axios';
import crypto from 'crypto';
import prisma from '../config/prisma';

/**
 * Service for managing and dispatching webhooks
 */
export class WebhookService {
    /**
     * Register a new webhook for a user
     */
    static async register(userId: string, url: string, events: string[]) {
        const secret = crypto.randomBytes(32).toString('hex');

        return await prisma.webhook.create({
            data: {
                user_id: userId,
                url,
                secret,
                events: events.join(','),
            }
        });
    }

    /**
     * Dispatch an event to all relevant webhooks
     */
    static async dispatch(userId: string, event: string, payload: any) {
        const webhooks = await prisma.webhook.findMany({
            where: {
                user_id: userId,
                is_active: true
            }
        });

        for (const webhook of webhooks) {
            const subscribedEvents = webhook.events.split(',');

            if (subscribedEvents.includes(event) || subscribedEvents.includes('*')) {
                this.sendWebhook(webhook, event, payload).catch(err => {
                    console.error(`Failed to send webhook ${webhook.id}:`, err.message);
                });
            }
        }
    }

    /**
     * Send individual webhook request
     */
    private static async sendWebhook(webhook: any, event: string, payload: any) {
        const timestamp = Date.now();
        const body = JSON.stringify({
            event,
            timestamp,
            payload
        });

        // Sign payload: hmac(timestamp + body, secret)
        const signature = crypto
            .createHmac('sha256', webhook.secret)
            .update(`${timestamp}.${body}`)
            .digest('hex');

        try {
            await axios.post(webhook.url, body, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-HabitFlow-Signature': signature,
                    'X-HabitFlow-Timestamp': timestamp.toString()
                },
                timeout: 5000 // 5s timeout
            });
        } catch (error) {
            // In a production app, we'd log failures and potentially retry or deactivate failing webhooks
            throw error;
        }
    }

    /**
     * List user's webhooks
     */
    static async list(userId: string) {
        return await prisma.webhook.findMany({
            where: { user_id: userId }
        });
    }

    /**
     * Delete a webhook
     */
    static async delete(webhookId: string, userId: string) {
        return await prisma.webhook.delete({
            where: {
                id: webhookId,
                user_id: userId
            }
        });
    }
}
