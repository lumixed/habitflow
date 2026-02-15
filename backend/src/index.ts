import express from 'express';
import cors from 'cors';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth';
import habitRoutes from './routes/habits';
import completionRoutes from './routes/completions';
import groupRoutes from './routes/groups';
import gamificationRoutes from './routes/gamification';
import analyticsRoutes from './routes/analytics';
import socialRoutes from './routes/social';
import interactionRoutes from './routes/interactions';
import challengeRoutes from './routes/challenges';
import notificationRoutes from './routes/notifications';
import aiRoutes from './routes/ai';

const app = express();
const PORT = process.env.PORT || 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';
const ALLOWED_ORIGINS = [
    CORS_ORIGIN,
    'capacitor://localhost',
    'http://localhost',
    'http://localhost:3000',
    'http://localhost:3001'
];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        // Allow everything for debugging
        callback(null, true);
    },
    credentials: true
}));
app.use(express.json());

app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'habitflow-api',
    });
});

app.use('/api/auth', authRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/completions', completionRoutes);
app.use('/api/streak', completionRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/interactions', interactionRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/ai', aiRoutes);

app.use(errorHandler);

app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`✅ HabitFlow API running on port ${PORT}`);
    console.log(`   Health check: http://localhost:${PORT}/api/health`);
});

export default app;