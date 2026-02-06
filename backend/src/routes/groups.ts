import { Router, Request, Response, NextFunction } from 'express';
import * as groupService from '../services/groupService';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, description } = req.body;
        const group = await groupService.createGroup({
        name,
        description,
        created_by: req.user!.sub,
        });
        res.status(201).json({ group });
    } catch (error) {
        next(error);
    }
});

router.post('/join', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { invite_code } = req.body;
        if (!invite_code) {
        return res.status(400).json({ error: 'invite_code is required' });
        }
        const group = await groupService.joinGroup(invite_code, req.user!.sub);
        res.json({ group });
    } catch (error) {
        next(error);
    }
});

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const groups = await groupService.getGroupsByUser(req.user!.sub);
        res.json({ groups });
    } catch (error) {
        next(error);
    }
});

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const group = await groupService.getGroupDetails(req.params.id, req.user!.sub);
        res.json({ group });
    } catch (error) {
        next(error);
    }
});

router.delete('/:id/leave', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await groupService.leaveGroup(req.params.id, req.user!.sub);
        res.json(result);
    } catch (error) {
        next(error);
    }
});

router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await groupService.deleteGroup(req.params.id, req.user!.sub);
        res.json(result);
    } catch (error) {
        next(error);
    }
});

export default router;
