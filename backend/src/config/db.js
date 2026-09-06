import mongoose from 'mongoose';
import { config } from './index.js';
import { AuditLogger } from '../utils/logger.js';

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
    return true;
  } catch (error) {
    AuditLogger.warn(`🍃 MongoDB not reachable (${error.message}). Using high-performance ACID DataStore.`);
    return false;
  }
}
