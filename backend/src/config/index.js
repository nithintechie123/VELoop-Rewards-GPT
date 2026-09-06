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
  jwtSecret: process.env.JWT_SECRET || 'veloop_rewards_super_secure_jwt_secret_2026',
  jwtAccessExpiresIn: '15m',
  jwtRefreshExpiresIn: '7d',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/veloop_rewards',
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
