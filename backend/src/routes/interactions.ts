import { Router, Request, Response, NextFunction } from 'express';
import * as interactionService from '../services/interactionService';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

// Reactions
router.post('/react', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { activity_id, type } = req.body;
        const result = await interactionService.reactToActivity(req.user!.sub, activity_id, type);
        res.json({ result });
    } catch (error) {
        next(error);
    }
});

// Comments
router.post('/comment', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { activity_id, content } = req.body;
        const comment = await interactionService.addComment(req.user!.sub, activity_id, content);
        res.status(201).json({ comment });
    } catch (error) {
        next(error);
    }
});

router.delete('/comment/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await interactionService.deleteComment(req.user!.sub, req.params.id);
        res.json(result);
    } catch (error) {
        next(error);
    }
});

export default router;
