import mongoose from 'mongoose';
import { config } from './index.js';
import { AuditLogger } from '../utils/logger.js';
import { Giveaway } from '../models/Giveaway.js';
import { initialSeedData } from '../data/initialSeedData.js';

export async function connectDB() {
  try {
    mongoose.set('strictQuery', false);
    mongoose.set('bufferCommands', false);
    const conn = await mongoose.connect(config.mongoUri, {
      tls: config.mongoUri.includes('ssl=true') || config.mongoUri.includes('+srv') || config.mongoUri.includes('mongodb.net'),
      tlsAllowInvalidCertificates: true,
      serverSelectionTimeoutMS: 5000
    });
    AuditLogger.info(`🍃 MongoDB Connected to Atlas: ${conn.connection.host}/${conn.connection.name}`);

    // Synchronize initial giveaway records if MongoDB Giveaway collection is empty
    try {
      const count = await Giveaway.countDocuments();
      if (count === 0) {
        const allGiveaways = [
          initialSeedData.heroGiveaway,
          ...initialSeedData.giveaways
        ];
        await Giveaway.insertMany(allGiveaways);
        AuditLogger.info(`🍃 Seeded ${allGiveaways.length} complete Giveaway configurations into MongoDB.`);
      }
    } catch (seedErr) {
      AuditLogger.warn('🍃 Giveaway seed check warning:', { message: seedErr.message });
    }

    return true;
  } catch (error) {
    AuditLogger.warn(`🍃 MongoDB not reachable (${error.message}). Using high-performance ACID DataStore.`);
    return false;
  }
}

