/**
 * Year in Review Routes
 * API endpoints for annual wrap-up
 */

import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { getYearInReview } from '../services/yearInReviewService';
import prisma from '../config/prisma';

const router = Router();

/**
 * GET /api/year-in-review/:year?
 * Get year in review data for authenticated user
 */
router.get('/:year?', authenticate, async (req: Request, res: Response) => {
    try {
        const userId = req.user?.sub;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (user?.plan === 'FREE') {
            return res.status(403).json({ error: 'Year in Review is a Pro feature. Upgrade to unlock!' });
        }

        const year = req.params.year ? parseInt(req.params.year) : new Date().getFullYear();

        if (year < 2020 || year > new Date().getFullYear()) {
            return res.status(400).json({ error: 'Invalid year' });
        }

        const data = await getYearInReview(userId, year);
        res.json(data);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
