import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import useragent from 'express-useragent';
import mongoSanitize from 'express-mongo-sanitize';

import { config } from './config/index.js';
import { standardRateLimiter } from './middleware/rateLimitMiddleware.js';
import { errorHandler } from './middleware/errorMiddleware.js';

// Route Imports
import authRoutes from './routes/authRoutes.js';
import giveawayRoutes from './routes/giveawayRoutes.js';
import participationRoutes from './routes/participationRoutes.js';
import winnerRoutes from './routes/winnerRoutes.js';
import claimRoutes from './routes/claimRoutes.js';
import adminGiveawayRoutes from './routes/adminGiveawayRoutes.js';
import auditRoutes from './routes/auditRoutes.js';

const app = express();

// Security and utility middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

app.use(cors({
  origin: (origin, callback) => callback(null, true), // Dynamic origin for seamless local + preview dev
  credentials: true
}));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());
app.use(useragent.express());
app.use(mongoSanitize());

// General rate limiter on API
app.use('/api', standardRateLimiter);

// Healthchecks
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// API Route Mounts
app.use('/api/auth', authRoutes);
app.use('/api/giveaways', giveawayRoutes);
app.use('/api/participations', participationRoutes);
app.use('/api/participation', participationRoutes);
app.use('/api/winners', winnerRoutes);
app.use('/api/claims', claimRoutes);
app.use('/api/admin/giveaways', adminGiveawayRoutes);
app.use('/api/audit', auditRoutes);

// Fallback 404 for unknown endpoints
app.use((req, res, next) => {
  res.status(404).json({
    error: 'NOT_FOUND',
    message: `Endpoint ${req.method} ${req.originalUrl} not found on this server.`
  });
});

// Centralized error handler
app.use(errorHandler);

export default app;
