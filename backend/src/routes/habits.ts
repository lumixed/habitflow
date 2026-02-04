import { Router, Request, Response, NextFunction } from 'express';
import * as habitService from '../services/habitService';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);


router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const habits = await habitService.getHabitsByUser(req.user!.sub);
    res.json({ habits });
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, description, frequency, color, icon } = req.body;
    const habit = await habitService.createHabit({
      user_id: req.user!.sub,
      title,
      description,
      frequency,
      color,
      icon,
    });
    res.status(201).json({ habit });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const habit = await habitService.getHabitById(req.params.id, req.user!.sub);
    res.json({ habit });
  } catch (error) {
    next(error);
  }
});


router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, description, frequency, color, icon, is_active } = req.body;
    const habit = await habitService.updateHabit(req.params.id, req.user!.sub, {
      title,
      description,
      frequency,
      color,
      icon,
      is_active,
    });
    res.json({ habit });
  } catch (error) {
    next(error);
  }
});


router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await habitService.deleteHabit(req.params.id, req.user!.sub);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;