import { Router, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { ReferralService } from '../services/referralService';

const router = Router();

/**
 * GET /api/referrals/stats
 * Get user's referral code and history
 */
router.get('/stats', authenticate, async (req: any, res: Response) => {
    try {
        const stats = await ReferralService.getStats(req.user.sub);
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch referral stats' });
    }
});

export default router;
