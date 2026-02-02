import express from 'express';
import cors from 'cors';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth';

const app = express();
const PORT = process.env.PORT || 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';

app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'habitflow-api',
  });
});

app.use('/api/auth', authRoutes);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`✅ HabitFlow API running on port ${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/api/health`);
});

export default app;