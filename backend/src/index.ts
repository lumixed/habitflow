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
import yearInReviewRoutes from './routes/yearInReview';
import correlationRoutes from './routes/correlations';
import publicApiRoutes from './routes/publicApi';
import developerRoutes from './routes/developer';
import integrationRoutes from './routes/integrations';
import referralRoutes from './routes/referrals';
import { initializeScheduledJobs } from './jobs/emailReports';
import { initBackupJob } from './services/backupService';

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
app.use('/api/year-in-review', yearInReviewRoutes);
app.use('/api/correlations', correlationRoutes);
app.use('/api/v1', publicApiRoutes);
app.use('/api/developer', developerRoutes);
app.use('/api/integrations', integrationRoutes);
app.use('/api/referrals', referralRoutes);

app.use(errorHandler);

// Initialize scheduled email reports
initializeScheduledJobs();

// Initialize weekly data backups
initBackupJob();

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📧 Email reports scheduled and ready`);
    console.log(`   Health check: http://localhost:${PORT}/api/health`);
});

export default app;