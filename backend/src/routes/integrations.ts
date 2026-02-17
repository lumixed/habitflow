import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { GoogleCalendarService } from '../services/googleCalendarService';
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
 * DELETE /api/integrations/google
 * Disconnect Google Calendar integration
 */
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
        res.json({ message: 'Disconnected successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to disconnect integration' });
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
