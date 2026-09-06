import app from './src/app.js';
import { config } from './src/config/index.js';
import { connectDB } from './src/config/db.js';
import { AuditLogger } from './src/utils/logger.js';
import { db } from './src/data/store.js';

const PORT = config.port || 5000;

// Initialize Database connection asynchronously
connectDB().catch(err => {
  AuditLogger.warn('MongoDB connection attempt finished with error:', { message: err.message });
});

// Guard: Avoid automatic port binding during automated test suite runs
const isTestRun = process.argv[1]?.includes('backendTests') || process.env.NODE_ENV === 'test';

if (!isTestRun) {
  const server = app.listen(PORT, () => {
    console.log('\n=============================================================');
    console.log(`🚀 VELOOP REWARDS BACKEND & FRAUD ENGINE RUNNING ON PORT ${PORT}`);
    console.log(`🔗 REST API Base: http://localhost:${PORT}/api`);
    console.log(`🛡️  Zero-Trust Validation: ENABLED`);
    console.log(`🔒 Provably Fair SHA-256 System: ACTIVE`);
    console.log(`📦 Seeded Users, Hero Giveaway, Active Pools: READY`);
    console.log('=============================================================\n');
  });

  process.on('SIGTERM', () => {
    AuditLogger.info('SIGTERM received. Shutting down gracefully.');
    server.close(() => process.exit(0));
  });
}

export default app;
