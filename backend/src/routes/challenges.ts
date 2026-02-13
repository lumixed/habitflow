import { Router, Request, Response, NextFunction } from 'express';
import * as challengeService from '../services/challengeService';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

/**
 * Create a new challenge
 */
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { group_id, title, description, start_date, end_date, target_habit_type, goal_count } = req.body;

        const challenge = await challengeService.createChallenge({
            group_id,
            title,
            description,
            start_date: new Date(start_date),
            end_date: new Date(end_date),
            target_habit_type,
            goal_count: parseInt(goal_count) || 0,
            created_by: req.user!.sub,
        });

        res.status(201).json({ challenge });
    } catch (error) {
        next(error);
    }
});

/**
 * Join a challenge
 */
router.post('/:id/join', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const membership = await challengeService.joinChallenge(req.params.id, req.user!.sub);
        res.json({ membership });
    } catch (error) {
        next(error);
    }
});

/**
 * Get challenge details
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const challenge = await challengeService.getChallengeDetails(req.params.id);
        res.json({ challenge });
    } catch (error) {
        next(error);
    }
});

export default router;
