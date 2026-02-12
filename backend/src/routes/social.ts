import { Router, Request, Response, NextFunction } from 'express';
import * as socialService from '../services/socialService';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

// Friend requests
router.post('/request', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { receiver_id } = req.body;
        const request = await socialService.sendFriendRequest(req.user!.sub, receiver_id);
        res.status(201).json({ request });
    } catch (error) {
        next(error);
    }
});

router.put('/request/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { action } = req.body;
        if (action !== 'ACCEPT' && action !== 'DECLINE') {
            return res.status(400).json({ error: 'Invalid action' });
        }
        const result = await socialService.handleFriendRequest(req.params.id, req.user!.sub, action);
        res.json(result);
    } catch (error) {
        next(error);
    }
});

// Friend list
router.get('/friends', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const friends = await socialService.getFriends(req.user!.sub);
        res.json({ friends });
    } catch (error) {
        next(error);
    }
});

// Social feed
router.get('/feed', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const limit = parseInt(req.query.limit as string) || 20;
        const offset = parseInt(req.query.offset as string) || 0;
        const feed = await socialService.getSocialFeed(req.user!.sub, limit, offset);
        res.json({ feed });
    } catch (error) {
        next(error);
    }
});

// Search users
router.get('/search', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const query = req.query.q as string;
        if (!query) {
            return res.status(400).json({ error: 'Search query is required' });
        }
        const users = await socialService.searchUsers(query, req.user!.sub);
        res.json({ users });
    } catch (error) {
        next(error);
    }
});

export default router;
