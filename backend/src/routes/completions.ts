import { Router, Request, Response, NextFunction } from 'express';
import * as completionService from '../services/completionService';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { habit_id, completed_date } = req.body;

        if (!habit_id || !completed_date) {
            return res.status(400).json({ error: 'habit_id and completed_date are required' });
        }

        const { completion, rewards } = await completionService.logCompletion({
            habit_id,
            user_id: req.user!.sub,
            completed_date: new Date(completed_date),
        });

        res.status(201).json({ completion, rewards });
    } catch (error) {
        next(error);
    }
});

router.delete('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { habit_id, completed_date } = req.body;

        if (!habit_id || !completed_date) {
            return res.status(400).json({ error: 'habit_id and completed_date are required' });
        }

        const result = await completionService.unlogCompletion(
            habit_id,
            req.user!.sub,
            new Date(completed_date)
        );

        res.json(result);
    } catch (error) {
        next(error);
    }
});


router.get('/:habit_id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const completions = await completionService.getCompletionsByHabit(
            req.params.habit_id,
            req.user!.sub
        );
        res.json({ completions });
    } catch (error) {
        next(error);
    }
});


router.get('/streak/:habit_id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const streak = await completionService.calculateStreak(
            req.params.habit_id,
            req.user!.sub
        );
        res.json({ streak });
    } catch (error) {
        next(error);
    }
});

export default router;
