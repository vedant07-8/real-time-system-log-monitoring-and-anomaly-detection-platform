import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/authRoutes.js';
import ruleRoutes from './routes/ruleRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import investigationRoutes from './routes/investigationRoutes.js';
import logRoutes from './routes/logRoutes.js';
import alertRoutes from './routes/alertRoutes.js';
import statsRoutes from './routes/statsRoutes.js';
import monitorRoutes from './routes/monitorRoutes.js';
import healthRoutes from './routes/healthRoutes.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*'
}));
app.use(express.json({ limit: '5mb' }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000 // limit each IP to 1000 requests per windowMs
});
app.use('/api/', limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/monitor', monitorRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/rules', ruleRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/investigation', investigationRoutes);

// Error Handling
app.use(notFound);
app.use(errorHandler);

export default app;
