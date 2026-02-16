/**
 * Correlation Analysis Routes
 */

import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { analyzeHabitCorrelations } from '../services/correlationService';

const router = Router();

/**
 * GET /api/correlations?days=30
 * Get habit correlations for authenticated user
 */
router.get('/', authenticate, async (req: Request, res: Response) => {
    try {
        const userId = req.user?.sub;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const days = parseInt(req.query.days as string) || 30;

        if (days < 7 || days > 365) {
            return res.status(400).json({ error: 'Days must be between 7 and 365' });
        }

        const analysis = await analyzeHabitCorrelations(userId, days);
        res.json(analysis);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
