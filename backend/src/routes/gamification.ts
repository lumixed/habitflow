/**
 * Gamification Routes
 * API endpoints for gamification features
 */

import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import {
    getUserStats,
    getLeaderboard,
    getAvailablePowerups,
    getUserPowerups,
    purchasePowerup
} from '../services/gamificationService';
import {
    getAllAchievementsWithProgress,
    getUserAchievements
} from '../services/achievementService';
import { getUserStreaks } from '../services/streakService';

const router = Router();

/**
 * GET /api/gamification/stats
 * Get user's gamification stats
 */
router.get('/stats', authenticate, async (req: Request, res: Response) => {
    try {
        const userId = req.user?.sub;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const stats = await getUserStats(userId);
        res.json(stats);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/gamification/profile/:id
 * Get gamification stats for a specific user (public/friend profile)
 */
router.get('/profile/:id', authenticate, async (req: Request, res: Response) => {
    try {
        const userId = req.params.id;
        const stats = await getUserStats(userId);
        res.json(stats);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/gamification/achievements
 * Get all achievements with user progress
 */
router.get('/achievements', authenticate, async (req: Request, res: Response) => {
    try {
        const userId = req.user?.sub;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const achievements = await getAllAchievementsWithProgress(userId);
        res.json(achievements);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/gamification/achievements/unlocked
 * Get user's unlocked achievements
 */
router.get('/achievements/unlocked', authenticate, async (req: Request, res: Response) => {
    try {
        const userId = req.user?.sub;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const achievements = await getUserAchievements(userId);
        res.json(achievements);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/gamification/streaks
 * Get user's streaks
 */
router.get('/streaks', authenticate, async (req: Request, res: Response) => {
    try {
        const userId = req.user?.sub;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const streaks = await getUserStreaks(userId);
        res.json(streaks);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/gamification/leaderboard
 * Get leaderboard
 */
router.get('/leaderboard', authenticate, async (req: Request, res: Response) => {
    try {
        const limit = parseInt(req.query.limit as string) || 10;
        const leaderboard = await getLeaderboard(limit);
        res.json(leaderboard);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/gamification/powerups
 * Get available powerups
 */
router.get('/powerups', authenticate, async (req: Request, res: Response) => {
    try {
        const powerups = await getAvailablePowerups();
        res.json(powerups);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/gamification/powerups/my
 * Get user's powerups
 */
router.get('/powerups/my', authenticate, async (req: Request, res: Response) => {
    try {
        const userId = req.user?.sub;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const powerups = await getUserPowerups(userId);
        res.json(powerups);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/gamification/powerups/purchase
 * Purchase a powerup
 */
router.post('/powerups/purchase', authenticate, async (req: Request, res: Response) => {
    try {
        const userId = req.user?.sub;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { powerupKey } = req.body;
        if (!powerupKey) {
            return res.status(400).json({ error: 'Powerup key is required' });
        }

        const success = await purchasePowerup(userId, powerupKey);

        if (!success) {
            return res.status(400).json({ error: 'Unable to purchase powerup. Check if you have enough coins.' });
        }

        res.json({ message: 'Powerup purchased successfully' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
