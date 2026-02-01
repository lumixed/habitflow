import express from 'express';
import cors from 'cors';
import { errorHandler } from './middleware/errorHandler';

// ─── Import Routes ────────────────────────────────────────────────────
// We'll add auth, habits, completions, groups routes in later days.
// For now, just the health check to confirm everything is wired up.

const app = express();
const PORT = process.env.PORT || 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';

// ─── Middleware ────────────────────────────────────────────────────────
app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use(express.json());

// ─── Health Check ─────────────────────────────────────────────────────
// Used by Render (and Docker) to confirm the service is alive.
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'habitflow-api',
  });
});

// ─── Routes ───────────────────────────────────────────────────────────
// Day 2: app.use('/api/auth', authRoutes);
// Day 3: app.use('/api/habits', habitRoutes);
// Day 4: app.use('/api/habits', completionRoutes);
// Day 5: app.use('/api/groups', groupRoutes);

// ─── Error Handler ────────────────────────────────────────────────────
// Must be registered AFTER all routes.
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ HabitFlow API running on port ${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/api/health`);
});

export default app;
