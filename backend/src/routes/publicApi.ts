import { Router } from 'express';
import { apiKeyMiddleware, hasScope } from '../middleware/apiKeyMiddleware';
import * as HabitService from '../services/habitService';
import * as CompletionService from '../services/completionService';
import * as GamificationService from '../services/gamificationService';
import { WebhookService } from '../services/webhookService';

const router = Router();

// Apply API Key authentication to all routes in this router
router.use(apiKeyMiddleware);

/**
 * GET /api/v1/habits
 * Get all habits for the authenticated user
 */
router.get('/habits', hasScope('read'), async (req: any, res) => {
    try {
        const habits = await HabitService.getHabitsByUser(req.user.id);
        res.json(habits);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch habits' });
    }
});

/**
 * POST /api/v1/habits/:id/complete
 * Mark a habit as completed
 */
router.post('/habits/:id/complete', hasScope('write'), async (req: any, res) => {
    try {
        const { id } = req.params;
        const result = await CompletionService.logCompletion({
            habit_id: id,
            user_id: req.user.id,
            completed_date: new Date()
        });

        // Dispatch webhook
        await WebhookService.dispatch(req.user.id, 'habit.completed', {
            habit_id: id,
            reward: result.rewards
        });

        res.json({ message: 'Habit completed!', reward: result.rewards });
    } catch (error: any) {
        if (error.statusCode === 409) {
            return res.status(409).json({ error: 'Already completed today' });
        }
        res.status(error.statusCode || 500).json({ error: error.message || 'Internal server error' });
    }
});

/**
 * GET /api/v1/stats
 * Get user's gamification stats
 */
router.get('/stats', hasScope('read'), async (req: any, res) => {
    try {
        const stats = await GamificationService.getUserStats(req.user.id);
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

export default router;
