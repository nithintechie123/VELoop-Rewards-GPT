import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import useragent from 'express-useragent';
import mongoSanitize from 'express-mongo-sanitize';

import { config } from './config/index.js';
import { standardRateLimiter } from './middleware/rateLimitMiddleware.js';
import { errorHandler } from './middleware/errorMiddleware.js';
import { sanitizeInputs } from './middleware/validationMiddleware.js';

// Route Imports
import authRoutes from './routes/authRoutes.js';
import giveawayRoutes from './routes/giveawayRoutes.js';
import participationRoutes from './routes/participationRoutes.js';
import winnerRoutes from './routes/winnerRoutes.js';
import claimRoutes from './routes/claimRoutes.js';
import adminGiveawayRoutes from './routes/adminGiveawayRoutes.js';
import auditRoutes from './routes/auditRoutes.js';

const app = express();

// 1. Security Headers (Helmet)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"]
    }
  },
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  xContentTypeOptions: true,
  xFrameOptions: { action: 'deny' },
  hidePoweredBy: true
}));

// 2. CORS Configuration (Never use wildcard '*' with credentials or in production)
const allowedOrigins = [
  config.corsOrigin,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000'
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (like mobile apps, curl, or server-to-server)
    if (!origin) return callback(null, true);
    
    // Check if origin is in whitelist
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // In development mode, allow localhost/127.0.0.1 ports
    if (process.env.NODE_ENV !== 'production' && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }
    
    return callback(new Error(`Origin '${origin}' not allowed by CORS policy`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'x-user-id', 'x-session-id']
};

app.use(cors(corsOptions));

// 3. Payload Limits (Strict 100kb to mitigate payload DoS / memory exhaustion)
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));
app.use(cookieParser());
app.use(useragent.express());

// 4. Input Sanitization (NoSQL injection & Prototype pollution prevention)
app.use(mongoSanitize());
app.use(sanitizeInputs);

// 5. Rate Limiting (General API rate limiter)
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
app.use('/api/claim', claimRoutes);
app.use('/api/admin/giveaways', adminGiveawayRoutes);
app.use('/api/admin', adminGiveawayRoutes);
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
