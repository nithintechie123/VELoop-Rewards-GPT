import { db } from '../data/store.js';
import { AuditLogger } from '../utils/logger.js';
import { config } from '../config/index.js';
import { FraudEvent } from '../models/FraudEvent.js';

// In-memory sliding velocity tracker
const requestTimestamps = new Map(); // key: `${userId || ip}` -> [timestamps]

export class FraudService {
  /**
   * Tracks and evaluates burst velocity for rapid-fire / bot detection
   */
  static checkVelocity(identifier, windowMs = config.fraud.burstWindowMs, maxLimit = config.fraud.maxBurstRequests) {
    const now = Date.now();
    const timestamps = requestTimestamps.get(identifier) || [];
    
    // Purge older timestamps
    const activeTimestamps = timestamps.filter(ts => now - ts < windowMs);
    activeTimestamps.push(now);
    requestTimestamps.set(identifier, activeTimestamps);

    if (activeTimestamps.length > maxLimit) {
      return {
        isThrottled: true,
        requestCount: activeTimestamps.length,
        limit: maxLimit,
        windowMs
      };
    }

    return {
      isThrottled: false,
      requestCount: activeTimestamps.length,
      limit: maxLimit,
      windowMs
    };
  }

  /**
   * Evaluates participation request payload for tampering, negative tickets, float injection, etc.
   */
  static inspectParticipationPayload(body) {
    const issues = [];
    let riskScore = 0;

    const { ticketCount, entryType, clientBalanceClaim } = body || {};

    if (ticketCount !== undefined) {
      const parsedTickets = Number(ticketCount);
      if (!Number.isInteger(parsedTickets) || parsedTickets <= 0) {
        issues.push('Invalid or negative ticket count');
        riskScore += 50;
      }
      if (parsedTickets > 1000) {
        issues.push('Excessive batch ticket count (> 1000)');
        riskScore += 30;
      }
    }

    if (clientBalanceClaim !== undefined) {
      // Zero-trust: clientBalanceClaim is safely ignored in business logic
      riskScore += 10;
    }

    if (entryType && !['free', 'paid'].includes(entryType)) {
      issues.push(`Invalid entryType parameter: ${entryType}`);
      riskScore += 30;
    }

    return {
      isValid: issues.length === 0,
      issues,
      riskScore
    };
  }

  /**
   * Records a fraud incident with risk score escalation
   */
  static async recordFraudIncident({
    userId,
    giveawayId,
    eventType,
    description,
    riskScore = 50,
    ipAddress = '127.0.0.1',
    userAgent = 'Unknown',
    metadata = {}
  }) {
    const incident = {
      id: `fraud_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`,
      userId: userId || 'ANONYMOUS',
      giveawayId: giveawayId || null,
      eventType,
      description,
      riskScore,
      actionTaken: riskScore >= config.fraud.autoBlockRiskScore ? 'AUTO_BLOCKED' : 'FLAGGED_FOR_REVIEW',
      ipAddress,
      userAgent,
      metadata,
      timestamp: new Date().toISOString()
    };

    // Add to DataStore
    db.logFraudIncident(incident);

    // Save to Mongo if available
    try {
      await FraudEvent.create(incident);
    } catch {}

    // Add audit entry
    db.logAudit({
      action: 'FRAUD_ALERT',
      eventType,
      userId: incident.userId,
      giveawayId: incident.giveawayId,
      riskScore,
      details: description
    });

    AuditLogger.warn(`🚨 Fraud Incident [${eventType}] - User: ${userId} - Risk: ${riskScore} - ${description}`);

    return incident;
  }
}
