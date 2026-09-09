import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from backend folder or root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config(); // fallback

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'veloop_rewards_super_secure_jwt_secret_2026',
  refreshSecret: process.env.REFRESH_SECRET || process.env.JWT_SECRET || 'veloop_rewards_super_secure_refresh_secret_2026',
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  clientUrl: process.env.CLIENT_URL || process.env.CORS_ORIGIN || 'http://localhost:5173',
  corsOrigin: process.env.CLIENT_URL || process.env.CORS_ORIGIN || 'http://localhost:5173',
  mongoUri: process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/veloop_rewards',
  fraud: {
    maxBurstRequests: 10,       // Max requests in 5 seconds
    burstWindowMs: 5000,        // 5 seconds
    maxRequestsPerMin: 60,      // Max requests in 1 minute
    maxDailyFreeEntries: 1,     // Max free entries per giveaway per day
    autoBlockRiskScore: 80,     // Threshold to auto-block suspicious users
    flagRiskScore: 40           // Threshold to flag for audit
  },
  dbFilePath: './backend/src/data/database.json'
};
