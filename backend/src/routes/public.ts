import { Router, Request, Response } from 'express';
import prisma from '../config/prisma';
import { format, startOfWeek, endOfWeek } from 'date-fns';

const router = Router();

/**
 * GET /api/public/widget/:userId
 * Returns minimal, non-sensitive stats for embeddable widgets
 */
router.get('/widget/:userId', async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                display_name: true,
                avatar_url: true,
                level: true,
                xp: true,
                accent_color: true,
                is_profile_public: true,
                analytics: {
                    select: {
                        best_streak: true,
                        total_completions: true
                    }
                }
            }
        });

        if (!user || !user.is_profile_public) {
            return res.status(404).json({ error: 'User not found or profile is private' });
        }

        // Get this week's completion counts
        const startOfContent = startOfWeek(new Date(), { weekStartsOn: 1 });
        const endOfContent = endOfWeek(new Date(), { weekStartsOn: 1 });

        const completions = await prisma.completion.findMany({
            where: {
                user_id: userId,
                completed_date: {
                    gte: startOfContent,
                    lte: endOfContent
                }
            },
            select: {
                completed_date: true
            }
        });

        // Group by day of week
        const weeklyActivity = [0, 0, 0, 0, 0, 0, 0];
        completions.forEach(c => {
            const day = (c.completed_date.getDay() + 6) % 7; // Monday = 0
            weeklyActivity[day]++;
        });

        res.json({
            user: {
                display_name: user.display_name,
                avatar_url: user.avatar_url,
                level: user.level,
                accent_color: user.accent_color
            },
            stats: {
                best_streak: user.analytics?.best_streak || 0,
                total_completions: user.analytics?.total_completions || 0,
                weeklyActivity
            }
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
