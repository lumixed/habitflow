import axios from 'axios';
import prisma from '../config/prisma';
import { AppError } from '../middleware/errorHandler';
import * as CompletionService from './completionService';

const CLIENT_ID = process.env.STRAVA_CLIENT_ID;
const CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET;
const REDIRECT_URI = process.env.STRAVA_REDIRECT_URI || 'http://localhost:3000/settings/integrations/strava/callback';

/**
 * Service to handle Strava integration
 */
export class StravaService {
    /**
     * Get the URL for the Strava OAuth2 authorization flow
     */
    static getAuthUrl(userId: string) {
        if (!CLIENT_ID) throw new AppError('Strava Client ID not configured', 500);

        return `https://www.strava.com/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=activity:read_all&state=${userId}`;
    }

    /**
     * Handle Strava OAuth2 callback and save tokens
     */
    static async handleCallback(userId: string, code: string) {
        if (!CLIENT_ID || !CLIENT_SECRET) {
            throw new AppError('Strava OAuth credentials not configured', 500);
        }

        const response = await axios.post('https://www.strava.com/oauth/token', {
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            code,
            grant_type: 'authorization_code'
        });

        const { access_token, refresh_token, expires_at } = response.data;

        await prisma.externalIntegration.upsert({
            where: { user_id_provider: { user_id: userId, provider: 'strava' } },
            update: {
                access_token,
                refresh_token,
                expires_at: new Date(expires_at * 1000),
            },
            create: {
                user_id: userId,
                provider: 'strava',
                access_token,
                refresh_token: refresh_token || '',
                expires_at: new Date(expires_at * 1000),
            }
        });

        return response.data;
    }

    /**
     * Refresh Strava access token if needed
     */
    private static async refreshAccessToken(userId: string, refreshToken: string) {
        if (!CLIENT_ID || !CLIENT_SECRET) return null;

        try {
            const response = await axios.post('https://www.strava.com/oauth/token', {
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                refresh_token: refreshToken,
                grant_type: 'refresh_token'
            });

            const { access_token, refresh_token: new_refresh_token, expires_at } = response.data;

            await prisma.externalIntegration.update({
                where: { user_id_provider: { user_id: userId, provider: 'strava' } },
                data: {
                    access_token,
                    refresh_token: new_refresh_token,
                    expires_at: new Date(expires_at * 1000),
                }
            });

            return access_token;
        } catch (error) {
            console.error('Failed to refresh Strava token:', error);
            return null;
        }
    }

    /**
     * Sync Strava activities and map them to habits
     */
    static async syncActivities(userId: string) {
        const integration = await prisma.externalIntegration.findUnique({
            where: { user_id_provider: { user_id: userId, provider: 'strava' } }
        });

        if (!integration) return;

        let token = integration.access_token;
        if (integration.expires_at && integration.expires_at < new Date()) {
            token = await this.refreshAccessToken(userId, integration.refresh_token!) || token;
        }

        try {
            // Fetch activities from the last 7 days
            const after = Math.floor(Date.now() / 1000) - (7 * 24 * 60 * 60);
            const response = await axios.get(`https://www.strava.com/api/v3/athlete/activities?after=${after}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const activities = response.data;
            const habits = await prisma.habit.findMany({
                where: { user_id: userId, is_active: true }
            });

            for (const activity of activities) {
                const activityType = activity.type.toLowerCase(); // 'run', 'ride', 'walk', etc.
                const activityDate = new Date(activity.start_date_local);

                // Find matching habits based on keywords
                const matchingHabits = habits.filter(h => {
                    const title = h.title.toLowerCase();
                    return title.includes(activityType) ||
                        (activityType === 'ride' && title.includes('cycle')) ||
                        (activityType === 'run' && title.includes('jog'));
                });

                for (const habit of matchingHabits) {
                    try {
                        await CompletionService.logCompletion({
                            habit_id: habit.id,
                            user_id: userId,
                            completed_date: activityDate
                        });
                        console.log(`Synced Strava ${activityType} to habit: ${habit.title}`);
                    } catch (err: any) {
                        // Ignore 409 (already completed) errors
                        if (err.statusCode !== 409) {
                            console.error(`Failed to log Strava completion for habit ${habit.id}:`, err);
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Failed to sync Strava activities:', error);
        }
    }
}
