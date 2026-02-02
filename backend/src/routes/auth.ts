import { Router, Request, Response, NextFunction } from 'express';
import * as authService from '../services/authService';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/signup', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, display_name } = req.body;
    const result = await authService.signup({ email, password, display_name });
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login({ email, password });
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.get('/me', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const user = await authService.getUserById(req.user.sub);
    res.json({ user });
  } catch (error) {
    next(error);
  }
});

export default router;
