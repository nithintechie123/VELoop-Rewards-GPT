import mongoose from 'mongoose';
import { db } from '../data/store.js';
import { AuditLogger } from '../utils/logger.js';
import { AuditLog } from '../models/AuditLog.js';

export class AuditService {
  /**
   * Generic audit log dispatcher
   */
  static async recordEvent({
    userId = 'SYSTEM',
    action,
    giveawayId = null,
    giveawayTitle = null,
    amount = 0,
    currency = 'VEs',
    result = 'SUCCESS',
    requestId = null,
    transactionId = null,
    idempotencyKey = null,
    securityInfo = {},
    metadata = {}
  }) {
    const timestampISO = new Date().toISOString();
    const entryId = `audit_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;

    const logEntry = {
      id: entryId,
      userId,
      action,
      giveawayId,
      giveawayTitle,
      amount: Number(amount) || 0,
      currency,
      result,
      requestId: requestId || idempotencyKey || transactionId || entryId,
      transactionId,
      idempotencyKey,
      securityInfo: {
        ipAddress: securityInfo.ipAddress || '127.0.0.1',
        deviceHash: securityInfo.deviceHash || null,
        userAgent: securityInfo.userAgent || 'Unknown',
        riskScore: securityInfo.riskScore || 0,
        riskLevel: securityInfo.riskLevel || 'LOW',
        reason: securityInfo.reason || null
      },
      metadata,
      timestamp: timestampISO,
      createdAt: timestampISO
    };

    // 1. Save to in-memory/JSON data store
    db.logAudit(logEntry);

    // 2. Save to Mongo if connected
    if (mongoose.connection?.readyState === 1) {
      try {
        await AuditLog.create(logEntry);
      } catch (err) {
        AuditLogger.warn(`MongoDB AuditLog write deferred: ${err.message}`);
      }
    }

    AuditLogger.info(`[AUDIT] Action: ${action} | User: ${userId} | Giveaway: ${giveawayId || 'N/A'} | Amount: ${amount} ${currency} | Result: ${result}`);
    return logEntry;
  }

  // --- Specific Action Helpers (Requirement 29) ---

  static async logJoinGiveaway({ userId, giveawayId, giveawayTitle, amount, currency, ticketId, transactionId, idempotencyKey, ipAddress, deviceHash, userAgent }) {
    return await this.recordEvent({
      userId,
      action: 'JOIN_GIVEAWAY',
      giveawayId,
      giveawayTitle,
      amount,
      currency,
      result: 'SUCCESS',
      transactionId,
      idempotencyKey,
      securityInfo: { ipAddress, deviceHash, userAgent },
      metadata: { ticketId }
    });
  }

  static async logEntryFeeDeducted({ userId, giveawayId, giveawayTitle, amount, currency, transactionId, balanceBefore, balanceAfter, ipAddress, deviceHash }) {
    return await this.recordEvent({
      userId,
      action: 'ENTRY_FEE_DEDUCTED',
      giveawayId,
      giveawayTitle,
      amount,
      currency,
      result: 'SUCCESS',
      transactionId,
      securityInfo: { ipAddress, deviceHash },
      metadata: { balanceBefore, balanceAfter }
    });
  }

  static async logJoinRejected({ userId, giveawayId, giveawayTitle, reason, error, amount = 0, currency = 'VEs', ipAddress, deviceHash, userAgent, riskScore = 0 }) {
    return await this.recordEvent({
      userId,
      action: 'JOIN_REJECTED',
      giveawayId,
      giveawayTitle,
      amount,
      currency,
      result: 'REJECTED',
      securityInfo: { ipAddress, deviceHash, userAgent, riskScore, reason: reason || error },
      metadata: { error: error || reason }
    });
  }

  static async logDuplicateAttempt({ userId, giveawayId, giveawayTitle, ipAddress, deviceHash, userAgent }) {
    return await this.recordEvent({
      userId,
      action: 'DUPLICATE_ATTEMPT',
      giveawayId,
      giveawayTitle,
      result: 'BLOCKED',
      securityInfo: { ipAddress, deviceHash, userAgent, reason: 'Duplicate participation attempt' },
      metadata: { violation: 'ALREADY_PARTICIPATED' }
    });
  }

  static async logFraudFlagged({ userId, giveawayId, giveawayTitle, reason, signals, riskScore, riskLevel, action, ipAddress, deviceHash, userAgent }) {
    return await this.recordEvent({
      userId,
      action: 'FRAUD_FLAGGED',
      giveawayId,
      giveawayTitle,
      result: action || 'FLAGGED',
      securityInfo: { ipAddress, deviceHash, userAgent, riskScore, riskLevel, reason },
      metadata: { signals }
    });
  }

  static async logClaimSubmitted({ userId, giveawayId, giveawayTitle, prizeId, claimType, shippingDetails, transactionId, ipAddress }) {
    return await this.recordEvent({
      userId,
      action: 'CLAIM_SUBMITTED',
      giveawayId,
      giveawayTitle,
      result: 'CONFIRMED',
      transactionId,
      securityInfo: { ipAddress },
      metadata: { prizeId, claimType, shippingCity: shippingDetails?.city }
    });
  }

  static async logWinnerSelected({ giveawayId, giveawayTitle, winningTicketId, winnerUserId, winnerName, prize, proof, clientSeed, serverSeedHash }) {
    return await this.recordEvent({
      userId: winnerUserId,
      action: 'WINNER_SELECTED',
      giveawayId,
      giveawayTitle,
      amount: prize?.value || 0,
      currency: 'PRIZE',
      result: 'COMPLETED',
      securityInfo: { serverSeedHash, clientSeed },
      metadata: { winningTicketId, winnerName, prize, proof }
    });
  }

  static getAuditLogs({ userId, giveawayId, action, limit = 50 } = {}) {
    let logs = db.getAuditLogs(1000);
    if (userId) logs = logs.filter(l => l.userId === userId);
    if (giveawayId) logs = logs.filter(l => l.giveawayId === giveawayId);
    if (action) logs = logs.filter(l => l.action === action);
    return logs.slice(0, limit);
  }
}
