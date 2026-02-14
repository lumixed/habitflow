import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as weatherService from '../services/weatherService';
import * as aiService from '../services/aiService';

const router = Router();

// Get weather-based habit suggestions
router.get('/weather-suggestions', authenticate, async (req: any, res, next) => {
    try {
        const { lat, lon } = req.query;
        if (!lat || !lon) {
            return res.status(400).json({ error: 'Latitude and longitude are required' });
        }

        const weather = await weatherService.getWeather(parseFloat(lat as string), parseFloat(lon as string));
        if (!weather) {
            return res.status(500).json({ error: 'Failed to fetch weather data' });
        }

        const suggestions = weatherService.suggestHabitsForWeather(weather.condition);
        res.json({
            weather,
            suggestions
        });
    } catch (error) {
        next(error);
    }
});

// Get insights for all habits
router.get('/insights', authenticate, async (req: any, res, next) => {
    try {
        const userId = req.user.sub;
        const insights = await aiService.getAllHabitInsights(userId);
        res.json({ insights });
    } catch (error) {
        next(error);
    }
});

// Get insights for a specific habit
router.get('/insights/:habitId', authenticate, async (req: any, res, next) => {
    try {
        const userId = req.user.sub;
        const insight = await aiService.getHabitProbability(req.params.habitId, userId);
        res.json({ insight });
    } catch (error) {
        next(error);
    }
});

// Get habit recommendations
router.get('/recommendations', authenticate, async (req: any, res, next) => {
    try {
        const userId = req.user.sub;
        const recommendations = await aiService.suggestNewHabits(userId);
        res.json({ recommendations });
    } catch (error) {
        next(error);
    }
});

// Get habit stacking suggestions
router.get('/stacks', authenticate, async (req: any, res, next) => {
    try {
        const userId = req.user.sub;
        const stacks = await aiService.suggestHabitStacks(userId);
        res.json({ stacks });
    } catch (error) {
        next(error);
    }
});

export default router;
