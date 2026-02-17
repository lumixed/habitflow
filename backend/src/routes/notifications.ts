import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as notificationService from '../services/notificationService';

const router = Router();

// Get notification preferences
router.get('/', authenticate, async (req: any, res, next) => {
    try {
        const userId = req.user.sub;
        const prefs = await notificationService.getNotificationPrefs(userId);
        res.json({ prefs });
    } catch (error) {
        next(error);
    }
});

// Update notification preferences
router.put('/', authenticate, async (req: any, res, next) => {
    try {
        const userId = req.user.sub;
        const prefs = await notificationService.updateNotificationPrefs(userId, req.body);
        res.json({ prefs });
    } catch (error) {
        next(error);
    }
});

// Get smart reminder suggestion
router.get('/suggest-time', authenticate, async (req: any, res, next) => {
    try {
        const userId = req.user.sub;
        const suggestedTime = await notificationService.calculateSmartReminderTime(userId);
        res.json({ suggestedTime });
    } catch (error) {
        next(error);
    }
});

// Subscribe to push notifications
router.post('/subscribe', authenticate, async (req: any, res, next) => {
    try {
        const userId = req.user.sub;
        await notificationService.subscribeToPush(userId, req.body);
        res.status(201).json({ message: 'Subscribed successfully' });
    } catch (error) {
        next(error);
    }
});

export default router;
