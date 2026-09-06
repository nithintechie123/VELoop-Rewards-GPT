import mongoose from 'mongoose';
import { db } from '../data/store.js';
import { BalanceService } from './balanceService.js';
import { GiveawayService } from './giveawayService.js';
import { FraudService } from './fraudService.js';
import { AuditLogger } from '../utils/logger.js';
import { Giveaway } from '../models/Giveaway.js';
import { GiveawayParticipation } from '../models/GiveawayParticipation.js';

const isMongo = () => mongoose.connection.readyState === 1;

export class ParticipationService {
  /**
   * Generates a compliant ticket identifier: #VEL-XXXXX-US
   */
  static generateTicketId() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `#VEL-${code}-US`;
  }

  /**
   * Core Zero-Trust Participation Handler
   */
  static async joinGiveaway({
    userId,
    giveawayId,
    entryType = 'paid',
    ticketCount = 1,
    ipAddress = '127.0.0.1',
    userAgent = 'Unknown'
  }) {
    // 1. Fetch Giveaway & Validate Status
    const giveaway = await GiveawayService.getGiveawayById(giveawayId);
    const eligibility = GiveawayService.validateGiveawayEligibility(giveaway);
    if (!eligibility.eligible) {
      const error = new Error(eligibility.message);
      error.code = eligibility.error;
      error.status = eligibility.error === 'GIVEAWAY_NOT_FOUND' ? 404 : 400;
      throw error;
    }

    // 2. Fetch User & Validate Identity
    const user = db.getUserById(userId);
    if (!user) {
      const error = new Error('User not found');
      error.code = 'USER_NOT_FOUND';
      error.status = 404;
      throw error;
    }

    // 3. Free Entry Limit Enforcement (1 Free Entry per user per giveaway)
    if (entryType === 'free') {
      const existingTickets = db.getTicketsByUser(userId).filter(t => t.giveawayId === giveaway.id && t.entryType === 'free');
      if (existingTickets.length >= 1) {
        // Record fraud/tampering attempt
        await FraudService.recordFraudIncident({
          userId,
          giveawayId: giveaway.id,
          eventType: 'DUPLICATE_FREE_ENTRY_ATTEMPT',
          description: `User attempted duplicate free entry for giveaway ${giveaway.id}`,
          riskScore: 35,
          ipAddress,
          userAgent
        });

        const error = new Error('You have already claimed your free entry for this giveaway.');
        error.code = 'FREE_ENTRY_LIMIT_REACHED';
        error.status = 400;
        throw error;
      }
    }

    // 4. Paid Entry - Calculate Required Fee & Atomic Debit
    const parsedTickets = Math.max(1, parseInt(ticketCount, 10) || 1);
    const totalRequiredFee = entryType === 'paid' ? (giveaway.entryFee || 0) * parsedTickets : 0;
    const currencyUnit = giveaway.entryFeeUnit || 'VEs';

    let debitResult = null;
    if (entryType === 'paid' && totalRequiredFee > 0) {
      // Server-side balance validation & atomic deduction
      try {
        debitResult = await BalanceService.debitEntryFee({
          userId,
          amount: totalRequiredFee,
          currencyUnit,
          giveawayId: giveaway.id,
          giveawayTitle: giveaway.title,
          ticketCount: parsedTickets,
          ipAddress
        });
      } catch (err) {
        if (err.code === 'INSUFFICIENT_BALANCE') {
          err.status = 402;
          throw err;
        }
        throw err;
      }
    }

    // 5. Mint Ticket(s) & Persist Participation
    const ticketId = this.generateTicketId();
    const participationRecord = {
      id: `part_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`,
      ticketId,
      userId,
      userName: user.name || user.fullName || 'Member',
      giveawayId: giveaway.id,
      giveawayTitle: giveaway.title,
      entryType,
      ticketCount: parsedTickets,
      entryFeePaid: totalRequiredFee,
      currencyUnit,
      ipAddress,
      userAgent,
      status: 'confirmed',
      createdAt: new Date().toISOString()
    };

    // Store in DataStore
    db.addTicket(participationRecord);

    // Sync to Mongoose
    if (isMongo()) {
      try {
        await GiveawayParticipation.create(participationRecord);
      } catch {}
    }

    // Increment giveaway participant count
    const updatedCount = Number(giveaway.totalTicketsEntered || giveaway.totalTickets || 0) + parsedTickets;
    db.updateGiveaway(giveaway.id, {
      totalTicketsEntered: updatedCount,
      totalTickets: updatedCount
    });

    if (isMongo()) {
      try {
        await Giveaway.updateOne(
          { id: giveaway.id },
          { $inc: { totalTicketsEntered: parsedTickets, totalTickets: parsedTickets } }
        );
      } catch {}
    }

    // Log Audit Event
    db.logAudit({
      action: 'PARTICIPATION_CONFIRMED',
      userId,
      giveawayId: giveaway.id,
      ticketId,
      entryType,
      ticketCount: parsedTickets,
      feePaid: totalRequiredFee,
      currencyUnit,
      ipAddress
    });

    AuditLogger.info(`Ticket minted [${ticketId}] for user ${userId} in ${giveaway.title}`);

    // Re-fetch remaining balance
    const updatedUser = db.getUserById(userId);
    const currentCoins = updatedUser ? (updatedUser.veloopCoins ?? updatedUser.coins ?? 0) : 0;

    return {
      success: true,
      ticket: participationRecord,
      remainingBalance: currentCoins,
      feePaid: totalRequiredFee,
      currencyUnit
    };
  }

  /**
   * Fetch all user participations
   */
  static async getUserParticipations(userId) {
    let tickets = [];
    if (isMongo()) {
      try {
        tickets = await GiveawayParticipation.find({ userId }).sort({ createdAt: -1 }).lean();
      } catch {}
    }

    if (tickets.length === 0) {
      tickets = db.getTicketsByUser(userId);
    }
    return tickets;
  }
}
