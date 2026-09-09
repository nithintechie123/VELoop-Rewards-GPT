import mongoose from 'mongoose';
import { db } from '../data/store.js';
import { AuditLogger } from '../utils/logger.js';
import { config } from '../config/index.js';
import { FraudEvent } from '../models/FraudEvent.js';
import { AuditService } from './auditService.js';

// In-memory sliding velocity tracker
const requestTimestamps = new Map(); // key: `${userId || ip}` -> [timestamps]

export const RiskLevel = Object.freeze({
  LOW: 'LOW',         // 0–29: Normal legitimate participation
  MEDIUM: 'MEDIUM',   // 30–59: Mild anomalies / single irregularity (Monitored)
  HIGH: 'HIGH',       // 60–79: Suspicious behavior / repeated anomalies (Challenge/Review)
  CRITICAL: 'CRITICAL' // 80–100: Confirmed multi-signal abuse / Sybil / exploit (Auto-Blocked)
});

export const RiskAction = Object.freeze({
  ALLOW: 'ALLOW',
  MONITORED: 'MONITORED',
  FLAGGED_FOR_REVIEW: 'FLAGGED_FOR_REVIEW',
  CHALLENGE: 'CHALLENGE',
  AUTO_BLOCKED: 'AUTO_BLOCKED'
});

export class FraudService {
  /**
   * Classifies numerical riskScore (0–100) into standardized risk classification bands (Requirement 26)
   * 0–29:   LOW
   * 30–59:  MEDIUM
   * 60–79:  HIGH
   * 80–100: CRITICAL
   */
  static classifyRiskScore(score = 0) {
    const numeric = Math.max(0, Math.min(100, Math.round(Number(score) || 0)));
    if (numeric >= 80) {
      return {
        score: numeric,
        level: RiskLevel.CRITICAL,
        band: '80–100',
        action: RiskAction.AUTO_BLOCKED,
        description: 'Critical abuse risk: Confirmed Sybil, payload exploit, or compounding multi-signal attack'
      };
    }
    if (numeric >= 60) {
      return {
        score: numeric,
        level: RiskLevel.HIGH,
        band: '60–79',
        action: RiskAction.CHALLENGE,
        description: 'High suspicious risk: Multiple correlating anomalies requiring step-up challenge or review'
      };
    }
    if (numeric >= 30) {
      return {
        score: numeric,
        level: RiskLevel.MEDIUM,
        band: '30–59',
        action: RiskAction.MONITORED,
        description: 'Medium risk: Minor telemetry deviations, actively monitored with zero user friction'
      };
    }
    return {
      score: numeric,
      level: RiskLevel.LOW,
      band: '0–29',
      action: RiskAction.ALLOW,
      description: 'Low risk: Normal legitimate participation patterns'
    };
  }
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
   * Reset velocity history for tests or manual unblock
   */
  static resetVelocity(identifier) {
    if (identifier) {
      requestTimestamps.delete(identifier);
    } else {
      requestTimestamps.clear();
    }
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
   * Multi-Signal Fraud Protection Layer (Requirement 21)
   * Evaluates 11 distinct signals and computes a composite weighted risk score.
   * Core Rule: "No single signal should automatically be treated as definitive proof of fraud."
   */
  static evaluateMultiSignalRisk({
    user,
    userId,
    deviceId,
    ipAddress = '127.0.0.1',
    userAgent = 'Unknown',
    sessionInfo = {},
    requestCount = 1,
    giveawayId = null,
    payload = {}
  }) {
    const signals = [];
    const resolvedUser = user || (userId ? db.getUserById(userId) : null);
    const resolvedUserId = resolvedUser?.id || resolvedUser?.userId || userId || 'ANONYMOUS';

    // 1. User Account Signal (Status, baseline risk, tier)
    let userScore = 0;
    if (resolvedUser) {
      if (resolvedUser.status === 'suspended' || resolvedUser.status === 'blocked') {
        userScore = 50;
        signals.push({ signalName: 'USER_ACCOUNT', score: 50, details: 'Account is suspended or restricted' });
      } else if (resolvedUser.riskScore && resolvedUser.riskScore > 0) {
        userScore = Math.min(25, resolvedUser.riskScore);
        signals.push({ signalName: 'USER_ACCOUNT', score: userScore, details: `Prior account risk score: ${resolvedUser.riskScore}` });
      }
    } else {
      userScore = 15;
      signals.push({ signalName: 'USER_ACCOUNT', score: 15, details: 'Unregistered or guest user identity' });
    }

    // 2. Device Identifier Signal
    if (!deviceId) {
      signals.push({ signalName: 'DEVICE_IDENTIFIER', score: 10, details: 'Missing or obscured device fingerprint' });
    } else {
      db.registerDeviceSession(deviceId, resolvedUserId, ipAddress, userAgent);
    }

    // 3. IP Address & Geolocation Signal
    if (ipAddress === '127.0.0.1' || ipAddress === 'localhost' || ipAddress === '::1') {
      // Local/internal - normal for dev/testing
    } else if (ipAddress.startsWith('10.') || ipAddress.startsWith('192.168.')) {
      // Private subnet
    }

    // 4. Session Information Signal
    if (sessionInfo.isExpired) {
      signals.push({ signalName: 'SESSION_INFO', score: 30, details: 'Stale or expired session token' });
    }

    // 5. Request Frequency / Velocity Signal
    const velocity = this.checkVelocity(resolvedUserId || ipAddress);
    if (velocity.isThrottled) {
      signals.push({ 
        signalName: 'REQUEST_FREQUENCY', 
        score: 35, 
        details: `High burst velocity: ${velocity.requestCount} reqs in ${velocity.windowMs}ms window` 
      });
    }

    // 6. Account Age Signal
    if (resolvedUser && resolvedUser.joinedDate) {
      const accountAgeDays = (Date.now() - new Date(resolvedUser.joinedDate).getTime()) / (1000 * 3600 * 24);
      if (accountAgeDays < 1) {
        signals.push({ signalName: 'ACCOUNT_AGE', score: 10, details: 'Newly created account (< 24h old)' });
      }
    }

    // 7. Participation History Signal
    if (resolvedUser) {
      const tickets = db.getTicketsByUser(resolvedUser.id) || [];
      if (tickets.length > 500) {
        signals.push({ signalName: 'PARTICIPATION_HISTORY', score: 15, details: `Extremely high participation volume: ${tickets.length} total tickets` });
      }
    }

    // 8. Suspicious Account Patterns Signal
    if (resolvedUser && resolvedUser.userEntries) {
      const enteredCount = Object.keys(resolvedUser.userEntries).length;
      if (enteredCount > 20) {
        signals.push({ signalName: 'SUSPICIOUS_PATTERNS', score: 15, details: `Simultaneous active participation across ${enteredCount} giveaways` });
      }
    }

    // 9. Repeated Failed Attempts Signal
    const recentFailures = db.getFailedAttemptsCount(resolvedUserId, 300000); // 5 min window
    if (recentFailures >= 3) {
      const failScore = Math.min(30, recentFailures * 10);
      signals.push({ signalName: 'REPEATED_FAILED_ATTEMPTS', score: failScore, details: `${recentFailures} failed attempts recorded in last 5 minutes` });
    }

    // 10. Multiple Accounts on Same Device Signal (Sybil Detection)
    if (deviceId) {
      const linkedAccounts = db.getAccountsForDevice(deviceId);
      if (linkedAccounts.length > 2) {
        const sybilScore = Math.min(45, (linkedAccounts.length - 1) * 15);
        signals.push({ 
          signalName: 'MULTIPLE_ACCOUNTS_SAME_DEVICE', 
          score: sybilScore, 
          details: `Sybil pattern: ${linkedAccounts.length} distinct accounts sharing deviceId ${deviceId}` 
        });
      }
    }

    // 11. Abnormal Participation Patterns Signal (Payload inspection)
    const payloadInspection = this.inspectParticipationPayload(payload);
    if (!payloadInspection.isValid || payloadInspection.riskScore > 0) {
      signals.push({ 
        signalName: 'ABNORMAL_PATTERNS', 
        score: payloadInspection.riskScore, 
        details: payloadInspection.issues.join('; ') || 'Abnormal payload structure' 
      });
    }

    // Composite Weighted Score Calculation (Capped at 100)
    const totalRiskScore = Math.min(100, signals.reduce((sum, s) => sum + s.score, 0));
    const classification = this.classifyRiskScore(totalRiskScore);

    return {
      userId: resolvedUserId,
      deviceId,
      ipAddress,
      totalRiskScore,
      riskLevel: classification.level,
      riskBand: classification.band,
      actionTaken: classification.action,
      classificationDescription: classification.description,
      signalsCount: signals.length,
      signals,
      isAllowed: classification.action !== RiskAction.AUTO_BLOCKED
    };
  }

  /**
   * Self-Participation & Multiple Account Detection (Requirement 25)
   * Evaluates if a single individual is spinning up duplicate/burner accounts to enter the same giveaway.
   * 
   * Multi-Signal Inputs:
   * - Device: deviceHash matching
   * - IP: Subnet/network matching (Shared Wi-Fi/IP is NOT penalized alone)
   * - Account Behavior: Account age, profile completeness
   * - Participation History: Lifetime tickets and engagement
   * - Session Patterns: Rapid synchronized entry timestamps
   * 
   * Anti-False-Positive Guarantee:
   * Legitimate users on the same Wi-Fi/IP (e.g., family members, dorms, offices) with distinct devices
   * and normal accounts receive RiskAction.ALLOW and are never blocked.
   */
  static evaluateSelfParticipation({
    userId,
    giveawayId,
    deviceHash,
    ipAddress = '127.0.0.1',
    userAgent = 'Unknown',
    sessionInfo = {}
  }) {
    const signals = [];
    const user = db.getUserById(userId);
    const resolvedUserId = user?.id || user?.userId || userId;

    // 1. Device Correlation
    let sameDevicePriorEntry = false;
    if (deviceHash && giveawayId) {
      const existingDeviceTicket = db.getTicketByDeviceAndGiveaway(deviceHash, giveawayId);
      if (existingDeviceTicket && existingDeviceTicket.userId !== resolvedUserId) {
        sameDevicePriorEntry = true;
        signals.push({
          signalName: 'DEVICE_CORRELATION',
          score: 40,
          details: `Same physical device environment (${deviceHash.substring(0, 16)}...) previously entered by user ${existingDeviceTicket.userId}`
        });
      }
    }

    // 2. IP Subnet / Wi-Fi Correlation
    // Note: Shared IP alone gets score: 0 (or low monitored score if paired with other anomalies)
    // to strictly protect legitimate users sharing a router/campus Wi-Fi.
    const ipTickets = db.state.tickets.filter(
      t => t.giveawayId === giveawayId && t.ipAddress === ipAddress && t.userId !== resolvedUserId
    );
    if (ipTickets.length > 0) {
      if (sameDevicePriorEntry) {
        // Compounding signal: Same Device + Same IP
        signals.push({
          signalName: 'IP_CORRELATION',
          score: 15,
          details: `Matching IP ${ipAddress} alongside shared device fingerprint`
        });
      } else {
        // Shared Wi-Fi only (Clean device, separate accounts) -> Harmless/Monitored
        signals.push({
          signalName: 'SHARED_WIFI_NETWORK',
          score: 5,
          details: `Shared Wi-Fi/IP (${ipAddress}) detected across separate devices (Normal for households/offices)`
        });
      }
    }

    // 3. Account Behavior & Age Signal
    if (user && user.joinedDate) {
      const accountAgeDays = (Date.now() - new Date(user.joinedDate).getTime()) / (1000 * 3600 * 24);
      if (accountAgeDays < 1) {
        signals.push({
          signalName: 'ACCOUNT_BEHAVIOR',
          score: 15,
          details: 'Newly registered account (< 24h old) participating immediately'
        });
      }
    }

    // 4. Participation History Signal
    const userTickets = db.getTicketsByUser(resolvedUserId) || [];
    if (userTickets.length === 0) {
      signals.push({
        signalName: 'PARTICIPATION_HISTORY',
        score: 10,
        details: 'Zero prior platform history (Fresh burner account profile)'
      });
    }

    // 5. Session Patterns & Velocity Signal
    const velocity = this.checkVelocity(resolvedUserId || ipAddress);
    if (velocity.isThrottled) {
      signals.push({
        signalName: 'SESSION_PATTERNS',
        score: 25,
        details: `High velocity session burst: ${velocity.requestCount} requests`
      });
    }

    // 6. Failed Attempts History
    const recentFailures = db.getFailedAttemptsCount(resolvedUserId, 300000);
    if (recentFailures >= 2) {
      signals.push({
        signalName: 'FAILED_ATTEMPTS',
        score: 15,
        details: `${recentFailures} prior failed attempts in current session`
      });
    }

    const totalRiskScore = Math.min(100, signals.reduce((sum, s) => sum + s.score, 0));
    const classification = this.classifyRiskScore(totalRiskScore);

    return {
      userId: resolvedUserId,
      giveawayId,
      deviceHash,
      ipAddress,
      totalRiskScore,
      riskLevel: classification.level,
      riskBand: classification.band,
      actionTaken: classification.action,
      classificationDescription: classification.description,
      signalsCount: signals.length,
      signals,
      isAllowed: classification.action !== RiskAction.AUTO_BLOCKED
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
    signals = [],
    deviceId = null,
    ipAddress = '127.0.0.1',
    userAgent = 'Unknown',
    metadata = {}
  }) {
    const classification = this.classifyRiskScore(riskScore);
    const incidentReason = description || eventType || 'Suspicious activity detected';
    const incidentCreatedAt = new Date().toISOString();
    const effectiveDeviceHash = deviceId || metadata?.deviceHash || null;

    const incident = {
      id: `fraud_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`,
      userId: userId || 'ANONYMOUS',
      giveawayId: giveawayId || null,
      deviceHash: effectiveDeviceHash,
      deviceId: effectiveDeviceHash,
      riskScore: classification.score,
      riskLevel: classification.level,
      riskBand: classification.band,
      reason: incidentReason,
      description: incidentReason,
      eventType: eventType || 'FRAUD_ALERT',
      type: eventType || 'FRAUD_ALERT',
      signals,
      action: classification.action,
      actionTaken: classification.action,
      ipAddress,
      ip: ipAddress,
      userAgent,
      metadata,
      createdAt: incidentCreatedAt,
      timestamp: incidentCreatedAt
    };

    // Add to DataStore
    db.logFraudIncident(incident);

    // Save to Mongo if connected
    if (mongoose.connection?.readyState === 1) {
      try {
        await FraudEvent.create(incident);
      } catch {}
    }

    // Add audit entry
    db.logAudit({
      action: 'FRAUD_ALERT',
      eventType,
      userId: incident.userId,
      giveawayId: incident.giveawayId,
      riskScore: classification.score,
      details: incidentReason
    });

    await AuditService.logFraudFlagged({
      userId: incident.userId,
      giveawayId: incident.giveawayId,
      reason: incidentReason,
      signals,
      riskScore: classification.score,
      riskLevel: classification.level,
      action: classification.action,
      ipAddress,
      deviceHash: effectiveDeviceHash,
      userAgent
    });

    AuditLogger.warn(`🚨 Fraud Incident [${eventType || 'FRAUD_ALERT'}] - User: ${userId} - Risk: ${classification.score} - Reason: ${incidentReason} - Action: ${classification.action}`);

    return incident;
  }
}

