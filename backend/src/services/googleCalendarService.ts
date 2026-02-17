import { google } from 'googleapis';
import prisma from '../config/prisma';
import { AppError } from '../middleware/errorHandler';

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/settings/integrations/google/callback';

/**
 * Service to handle Google Calendar integration
 */
export class GoogleCalendarService {
    private static createOAuth2Client() {
        if (!CLIENT_ID || !CLIENT_SECRET) {
            throw new AppError('Google OAuth credentials not configured', 500);
        }
        return new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
    }

    /**
     * Get the URL for the OAuth2 authorization flow
     */
    static getAuthUrl(userId: string) {
        const oauth2Client = this.createOAuth2Client();
        return oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: [
                'https://www.googleapis.com/auth/calendar.app.created',
                'https://www.googleapis.com/auth/calendar.events'
            ],
            state: userId,
            prompt: 'consent' // Ensure refresh token is returned
        });
    }

    /**
     * Handle OAuth2 callback and save tokens
     */
    static async handleCallback(userId: string, code: string) {
        const oauth2Client = this.createOAuth2Client();
        const { tokens } = await oauth2Client.getToken(code);

        if (!tokens.access_token) {
            throw new Error('No access token returned from Google');
        }

        // Save or update integration
        await prisma.externalIntegration.upsert({
            where: { user_id_provider: { user_id: userId, provider: 'google_calendar' } },
            update: {
                access_token: tokens.access_token,
                refresh_token: tokens.refresh_token || undefined,
                expires_at: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
            },
            create: {
                user_id: userId,
                provider: 'google_calendar',
                access_token: tokens.access_token,
                refresh_token: tokens.refresh_token || '',
                expires_at: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
            }
        });

        return tokens;
    }

    /**
     * Get an authenticated calendar client for a user
     */
    private static async getCalendarClient(userId: string) {
        const integration = await prisma.externalIntegration.findUnique({
            where: { user_id_provider: { user_id: userId, provider: 'google_calendar' } }
        });

        if (!integration) return null;

        const oauth2Client = this.createOAuth2Client();
        oauth2Client.setCredentials({
            access_token: integration.access_token,
            refresh_token: integration.refresh_token,
            expiry_date: integration.expires_at?.getTime()
        });

        // Handle token refresh if needed
        oauth2Client.on('tokens', async (tokens) => {
            if (tokens.access_token) {
                await prisma.externalIntegration.update({
                    where: { id: integration.id },
                    data: {
                        access_token: tokens.access_token,
                        expires_at: tokens.expiry_date ? new Date(tokens.expiry_date) : null
                    }
                });
            }
        });

        return google.calendar({ version: 'v3', auth: oauth2Client });
    }

    /**
     * Ensure a "HabitFlow" calendar exists for the user
     */
    private static async ensureHabitFlowCalendar(calendar: any, userId: string): Promise<string> {
        const integration = await prisma.externalIntegration.findUnique({
            where: { user_id_provider: { user_id: userId, provider: 'google_calendar' } }
        });

        const metadata = (integration?.metadata as any) || {};
        if (metadata.calendar_id) return metadata.calendar_id;

        // Search for existing HabitFlow calendar
        const calendarList = await calendar.calendarList.list();
        const existing = calendarList.data.items.find((c: any) => c.summary === 'HabitFlow');

        if (existing) {
            await prisma.externalIntegration.update({
                where: { id: integration?.id },
                data: { metadata: { ...metadata, calendar_id: existing.id } }
            });
            return existing.id;
        }

        // Create new calendar
        const newCalendar = await calendar.calendars.insert({
            requestBody: {
                summary: 'HabitFlow',
                description: 'Your habits synced from HabitFlow'
            }
        });

        await prisma.externalIntegration.update({
            where: { id: integration?.id },
            data: { metadata: { ...metadata, calendar_id: newCalendar.data.id } }
        });

        return newCalendar.data.id!;
    }

    /**
     * Sync a habit completion to Google Calendar
     */
    static async syncCompletion(userId: string, habitTitle: string, date: Date) {
        try {
            const calendar = await this.getCalendarClient(userId);
            if (!calendar) return;

            const calendarId = await this.ensureHabitFlowCalendar(calendar, userId);

            const start = new Date(date);
            start.setHours(9, 0, 0, 0); // Default to 9 AM
            const end = new Date(start);
            end.setHours(10, 0, 0, 0);

            await calendar.events.insert({
                calendarId,
                requestBody: {
                    summary: `✅ ${habitTitle}`,
                    description: 'Completed in HabitFlow',
                    start: { dateTime: start.toISOString() },
                    end: { dateTime: end.toISOString() },
                    colorId: '10' // Green
                }
            });
        } catch (error) {
            console.error('Failed to sync habit to Google Calendar:', error);
        }
    }
}
