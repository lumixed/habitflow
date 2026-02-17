/**
 * Analytics Routes
 */

import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as analyticsService from '../services/analyticsService';

const router = Router();

/**
 * GET /api/analytics/heatmap
 * Get completion heatmap data for a specific year
 */
router.get('/heatmap', authenticate, async (req: any, res) => {
    try {
        const userId = req.user.sub;
        const year = parseInt(req.query.year as string) || new Date().getFullYear();

        const data = await analyticsService.getHeatmapData(userId, year);
        res.json(data);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/analytics/insights
 * Get general stats and patterns
 */
router.get('/insights', authenticate, async (req: any, res) => {
    try {
        const userId = req.user.sub;
        const data = await analyticsService.updateUserInsights(userId);
        res.json(data);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/analytics/trends
 * Get completion trends for last 30 days
 */
router.get('/trends', authenticate, async (req: any, res) => {
    try {
        const userId = req.user.sub;
        const data = await analyticsService.getTrendData(userId);
        res.json(data);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/analytics/global
 * Get community-wide stats
 */
router.get('/global', authenticate, async (req: any, res) => {
    try {
        const data = await analyticsService.getGlobalStats();
        res.json(data);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
