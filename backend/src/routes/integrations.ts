import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { GoogleCalendarService } from '../services/googleCalendarService';
import { StravaService } from '../services/stravaService';
import prisma from '../config/prisma';

const router = Router();

/**
 * GET /api/integrations/google/auth
 * Get the Google OAuth2 authorization URL
 */
router.get('/google/auth', authenticate, (req: any, res: Response) => {
    try {
        const url = GoogleCalendarService.getAuthUrl(req.user.sub);
        res.json({ url });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/integrations/google/callback
 * Handle Google OAuth2 callback
 */
router.get('/google/callback', async (req: Request, res: Response) => {
    const { code, state: userId } = req.query;

    if (!code || !userId) {
        return res.status(400).send('Invalid callback parameters');
    }

    try {
        await GoogleCalendarService.handleCallback(userId as string, code as string);

        // Redirect back to frontend settings
        const frontendUrl = process.env.CORS_ORIGIN || 'http://localhost:3000';
        res.redirect(`${frontendUrl}/settings?integration=google&status=success`);
    } catch (error: any) {
        console.error('Google callback error:', error);
        const frontendUrl = process.env.CORS_ORIGIN || 'http://localhost:3000';
        res.redirect(`${frontendUrl}/settings?integration=google&status=error&message=${encodeURIComponent(error.message)}`);
    }
});

/**
 * STRAVA INTEGRATION
 */

router.get('/strava/auth', authenticate, (req: any, res: Response) => {
    try {
        const url = StravaService.getAuthUrl(req.user.sub);
        res.json({ url });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/strava/callback', async (req: Request, res: Response) => {
    const { code, state: userId } = req.query;

    if (!code || !userId) {
        return res.status(400).send('Invalid callback parameters');
    }

    try {
        await StravaService.handleCallback(userId as string, code as string);

        // Trigger initial sync
        StravaService.syncActivities(userId as string).catch(console.error);

        const frontendUrl = process.env.CORS_ORIGIN || 'http://localhost:3000';
        res.redirect(`${frontendUrl}/settings?integration=strava&status=success`);
    } catch (error: any) {
        console.error('Strava callback error:', error);
        const frontendUrl = process.env.CORS_ORIGIN || 'http://localhost:3000';
        res.redirect(`${frontendUrl}/settings?integration=strava&status=error&message=${encodeURIComponent(error.message)}`);
    }
});

router.post('/strava/sync', authenticate, async (req: any, res: Response) => {
    try {
        await StravaService.syncActivities(req.user.sub);
        res.json({ message: 'Strava sync initiated' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to sync with Strava' });
    }
});

router.delete('/strava', authenticate, async (req: any, res: Response) => {
    try {
        await prisma.externalIntegration.delete({
            where: {
                user_id_provider: {
                    user_id: req.user.sub,
                    provider: 'strava'
                }
            }
        });
        res.json({ message: 'Strava disconnected' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to disconnect Strava' });
    }
});

router.delete('/google', authenticate, async (req: any, res: Response) => {
    try {
        await prisma.externalIntegration.delete({
            where: {
                user_id_provider: {
                    user_id: req.user.sub,
                    provider: 'google_calendar'
                }
            }
        });
        res.json({ message: 'Google Calendar disconnected' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to disconnect Google Calendar' });
    }
});

/**
 * GET /api/integrations
 * List active integrations for the user
 */
router.get('/', authenticate, async (req: any, res: Response) => {
    try {
        const integrations = await prisma.externalIntegration.findMany({
            where: { user_id: req.user.sub },
            select: {
                provider: true,
                created_at: true,
                updated_at: true
            }
        });
        res.json(integrations);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch integrations' });
    }
});

export default router;
