import mongoose from 'mongoose';
import { db } from '../data/store.js';
import { BalanceService } from './balanceService.js';
import { GiveawayService } from './giveawayService.js';
import { FraudService } from './fraudService.js';
import { AuditLogger } from '../utils/logger.js';
import { AuditService } from './auditService.js';
import { Giveaway } from '../models/Giveaway.js';
import { GiveawayParticipation } from '../models/GiveawayParticipation.js';
import { GiveawayEntryTransaction, TransactionStatus } from '../models/GiveawayEntryTransaction.js';

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
    idempotencyKey = null,
    deviceHash = null,
    ipAddress = '127.0.0.1',
    userAgent = 'Unknown'
  }) {
    // 0. Idempotency Check (Requirement 17)
    // If the exact same idempotency/request key was already processed, return the cached result
    // to prevent duplicate balance deductions during rapid repeated clicks.
    if (idempotencyKey) {
      const cachedIdempotency = db.getIdempotencyRecord(idempotencyKey);
      if (cachedIdempotency) {
        AuditLogger.info(`Idempotent request intercepted: returning cached result for key ${idempotencyKey}`);
        return {
          ...cachedIdempotency.result,
          isIdempotent: true
        };
      }
    }

    // 1. Fetch Giveaway & Validate Status
    const giveaway = await GiveawayService.getGiveawayById(giveawayId);
    const eligibility = GiveawayService.validateGiveawayEligibility(giveaway);
    if (!eligibility.eligible) {
      await AuditService.logJoinRejected({
        userId: userId || 'ANONYMOUS',
        giveawayId: giveaway?.id || giveawayId,
        giveawayTitle: giveaway?.title || giveawayId,
        reason: eligibility.message,
        error: eligibility.error,
        ipAddress,
        deviceHash,
        userAgent
      });

      const error = new Error(eligibility.message);
      error.code = eligibility.error;
      error.status = eligibility.error === 'GIVEAWAY_NOT_FOUND' ? 404 : 400;
      throw error;
    }

    // 2. Fetch User & Validate Identity & Eligibility (Step 9 of Backend Flow)
    const user = db.getUserById(userId);
    if (!user) {
      const error = new Error('User not found');
      error.code = 'USER_NOT_FOUND';
      error.status = 404;
      throw error;
    }

    if (user.status === 'suspended' || user.status === 'blocked' || user.status === 'banned') {
      await AuditService.logJoinRejected({
        userId: user.id || userId,
        giveawayId: giveaway.id,
        giveawayTitle: giveaway.title,
        reason: `User account is ${user.status}. Ineligible for participation.`,
        error: 'PARTICIPATION_BLOCKED',
        ipAddress,
        deviceHash,
        userAgent
      });

      const error = new Error(`User account is ${user.status}. Participation is blocked.`);
      error.code = 'PARTICIPATION_BLOCKED';
      error.status = 403;
      throw error;
    }

    // 3. Mandatory One Participation Per User Rule (Requirement 7 & 17)
    // A user can participate only once in a particular giveaway event.
    // Check if the user already has a ticket with this idempotencyKey (in which case return idempotent success)
    const userTickets = db.getTicketsByUser(userId) || [];
    if (idempotencyKey) {
      const matchingKeyTicket = userTickets.find(t => t.idempotencyKey === idempotencyKey);
      if (matchingKeyTicket) {
        return {
          success: true,
          ticket: matchingKeyTicket,
          remainingBalance: user.veloopCoins ?? user.coins ?? 0,
          feePaid: matchingKeyTicket.feeCharged || 0,
          currencyUnit: matchingKeyTicket.feeUnit || 'VEs',
          isIdempotent: true
        };
      }
    }

    const hasExistingParticipation = userTickets.some(
      t => t.giveawayId === giveaway.id || (giveaway.slug && t.giveawayId === giveaway.slug)
    );

    let hasMongoParticipation = false;
    if (isMongo()) {
      try {
        const count = await GiveawayParticipation.countDocuments({
          userId: user.id || userId,
          $or: [{ giveawayId: giveaway.id }, { giveawayId: giveaway.slug }]
        });
        if (count > 0) hasMongoParticipation = true;
      } catch {}
    }

    if (hasExistingParticipation || hasMongoParticipation) {
      // Record security incident for duplicate participation attempt
      await FraudService.recordFraudIncident({
        userId: user.id || userId,
        giveawayId: giveaway.id,
        eventType: 'DUPLICATE_PARTICIPATION_ATTEMPT',
        description: `Participation already exists. User ${userId} attempted duplicate entry in giveaway ${giveaway.title} (${giveaway.id})`,
        riskScore: 35,
        ipAddress,
        userAgent
      });

      await AuditService.logDuplicateAttempt({
        userId: user.id || userId,
        giveawayId: giveaway.id,
        giveawayTitle: giveaway.title,
        ipAddress,
        deviceHash,
        userAgent
      });

      const error = new Error('Participation already exists.');
      error.code = 'ALREADY_PARTICIPATING';
      error.status = 400;
      throw error;
    }

    // 3.1 Same Device Protection (Requirement 23)
    // One device may participate only once in a particular giveaway.
    // A second account attempting to participate from the same device is flagged for review or rejected
    // according to the platform's finalized policy (Default: REJECT with SAME_DEVICE_PARTICIPATION_LIMIT).
    let participationStatus = 'confirmed';
    if (deviceHash) {
      let existingDeviceTicket = db.getTicketByDeviceAndGiveaway(deviceHash, giveaway.id);

      if (!existingDeviceTicket && isMongo()) {
        try {
          const mongoDevTicket = await GiveawayParticipation.findOne({
            deviceHash,
            $or: [{ giveawayId: giveaway.id }, { giveawayId: giveaway.slug }]
          }).lean();
          if (mongoDevTicket) {
            existingDeviceTicket = mongoDevTicket;
          }
        } catch {}
      }

      if (existingDeviceTicket && existingDeviceTicket.userId !== (user.id || userId)) {
        await FraudService.recordFraudIncident({
          userId: user.id || userId,
          giveawayId: giveaway.id,
          eventType: 'SAME_DEVICE_MULTIPLE_ACCOUNTS_ATTEMPT',
          description: `Device ${deviceHash.substring(0, 16)}... already participated with account ${existingDeviceTicket.userId}. Second account ${userId} attempted participation in giveaway ${giveaway.title}.`,
          riskScore: 75,
          deviceId: deviceHash,
          ipAddress,
          userAgent,
          signals: ['MULTIPLE_ACCOUNTS_SAME_DEVICE', 'SAME_DEVICE_PARTICIPATION_LIMIT']
        });

        const sameDevicePolicy = process.env.SAME_DEVICE_POLICY || giveaway.sameDevicePolicy || 'REJECT';
        if (sameDevicePolicy === 'REJECT') {
          await AuditService.logJoinRejected({
            userId: user.id || userId,
            giveawayId: giveaway.id,
            giveawayTitle: giveaway.title,
            reason: 'This device has already participated in this giveaway with another account.',
            error: 'SAME_DEVICE_PARTICIPATION_LIMIT',
            ipAddress,
            deviceHash,
            userAgent,
            riskScore: 75
          });

          const error = new Error('This device has already participated in this giveaway with another account.');
          error.code = 'SAME_DEVICE_PARTICIPATION_LIMIT';
          error.status = 400;
          error.deviceHash = deviceHash;
          error.existingParticipation = {
            giveawayId: giveaway.id,
            createdAt: existingDeviceTicket.createdAt || existingDeviceTicket.allocatedAt
          };
          throw error;
        } else {
          // Policy: FLAG_REVIEW
          participationStatus = 'flagged_review';
        }
      }
    }

    // 4. Zero-Trust Backend Fee Determination (Requirement 10)
    // The frontend must NEVER send or dictate the entry fee. Any client-sent 'amount', 'fee',
    // or 'price' payload parameters are strictly ignored.
    // The backend determines the fee exclusively from the verified giveaway database record.
    const authoritativeEntryFee = Number(
      giveaway.entryFee ?? 
      giveaway.participationSettings?.entryFee ?? 
      giveaway.coinCost ?? 
      0
    );
    const parsedTickets = Math.max(1, parseInt(ticketCount, 10) || 1);
    const totalRequiredFee = entryType === 'paid' ? authoritativeEntryFee * parsedTickets : 0;
    const currencyUnit = giveaway.entryFeeUnit || giveaway.participationSettings?.entryFeeUnit || 'VEs';

    // 5. ATOMIC EXECUTION BLOCK (MongoDB Transaction + ACID Mutex Lock)
    // Ensures: Participation Created + Balance Deducted + Transaction Recorded + Pool Count Updated
    // Either all succeed together or all roll back with zero partial state.
    return await db.withLock(async () => {
      // Re-check idempotency under atomic lock in case a concurrent request completed
      if (idempotencyKey) {
        const lockedIdempotency = db.getIdempotencyRecord(idempotencyKey);
        if (lockedIdempotency) {
          return {
            ...lockedIdempotency.result,
            isIdempotent: true
          };
        }
      }

      // Re-verify under atomic lock to prevent race conditions (Requirement 18)
      const liveUserTickets = db.getTicketsByUser(userId) || [];
      const inLockDuplicate = liveUserTickets.some(
        t => t.giveawayId === giveaway.id || (giveaway.slug && t.giveawayId === giveaway.slug)
      );
      if (inLockDuplicate) {
        const error = new Error('Participation already exists.');
        error.code = 'ALREADY_PARTICIPATING';
        error.status = 400;
        throw error;
      }

      // Re-verify same device protection under atomic lock
      if (deviceHash) {
        const inLockDeviceTicket = db.getTicketByDeviceAndGiveaway(deviceHash, giveaway.id);
        if (inLockDeviceTicket && inLockDeviceTicket.userId !== (user.id || userId)) {
          const sameDevicePolicy = process.env.SAME_DEVICE_POLICY || giveaway.sameDevicePolicy || 'REJECT';
          if (sameDevicePolicy === 'REJECT') {
            const error = new Error('This device has already participated in this giveaway with another account.');
            error.code = 'PARTICIPATION_BLOCKED';
            error.status = 400;
            throw error;
          } else {
            participationStatus = 'flagged_review';
          }
        }
      }

      const liveUser = db.getUserById(userId);
      const balanceCheck = BalanceService.verifySufficientBalance(liveUser, totalRequiredFee, currencyUnit);
      if (entryType === 'paid' && totalRequiredFee > 0 && !balanceCheck.sufficient) {
        const specificCode = currencyUnit === 'SVEs'
          ? 'INSUFFICIENT_SVE_BALANCE'
          : (currencyUnit === 'Tokens' ? 'INSUFFICIENT_TOKEN_BALANCE' : 'INSUFFICIENT_VE_BALANCE');

        await AuditService.logJoinRejected({
          userId: liveUser.id || userId,
          giveawayId: giveaway.id,
          giveawayTitle: giveaway.title,
          amount: totalRequiredFee,
          currency: currencyUnit,
          reason: `Insufficient ${currencyUnit} balance`,
          error: specificCode,
          ipAddress,
          deviceHash: deviceHash || null,
          userAgent
        });

        const error = new Error(`Insufficient ${currencyUnit} balance`);
        error.code = specificCode;
        error.status = 402;
        error.details = { ...balanceCheck, baseCode: 'INSUFFICIENT_BALANCE' };
        throw error;
      }

      const ticketId = this.generateTicketId();
      const txId = `tx_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
      const beforeBalance = balanceCheck.currentBalance;
      const afterBalance = beforeBalance - totalRequiredFee;

      const participationRecord = {
        id: `part_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`,
        ticketId,
        userId: liveUser.id || userId,
        userFullName: liveUser.name || liveUser.fullName || 'Member',
        userName: liveUser.name || liveUser.fullName || 'Member',
        giveawayId: giveaway.id,
        giveawayTitle: giveaway.title,
        entryType,
        ticketCount: parsedTickets,
        entryFeePaid: totalRequiredFee,
        feeCharged: totalRequiredFee,
        currencyUnit,
        feeUnit: currencyUnit,
        idempotencyKey,
        deviceHash: deviceHash || null,
        ipAddress,
        userAgent,
        status: participationStatus,
        allocatedAt: new Date(),
        createdAt: new Date().toISOString()
      };

      const prizeId = giveaway.prizes?.[0]?.id || giveaway.prizeId || giveaway.id;
      const createdAtISO = new Date().toISOString();

      const transactionRecord = {
        id: txId,
        transactionId: txId,
        userId: liveUser.userId || liveUser.id || userId,
        userDbId: liveUser.id,
        giveawayId: giveaway.id,
        giveawayTitle: giveaway.title,
        prizeId,
        currency: currencyUnit,
        currencyUnit,
        amount: totalRequiredFee,
        type: 'GIVEAWAY_ENTRY',
        status: TransactionStatus.SUCCESS,
        balanceBefore: beforeBalance,
        balanceAfter: afterBalance,
        ticketCount: parsedTickets,
        ticketId,
        idempotencyKey,
        deviceHash: deviceHash || null,
        ipAddress,
        createdAt: createdAtISO,
        timestamp: createdAtISO
      };

      // 5.1 Execute MongoDB Transaction if connected
      let mongoSession = null;
      if (isMongo()) {
        try {
          mongoSession = await mongoose.startSession();
          mongoSession.startTransaction();

          // 1. Create Participation (Protected by compound unique index)
          await GiveawayParticipation.create([participationRecord], { session: mongoSession });

          // 2. Deduct User Balance
          if (entryType === 'paid' && totalRequiredFee > 0) {
            const updateObj = {};
            if (currencyUnit === 'SVEs') {
              updateObj.sveCoins = afterBalance;
            } else if (currencyUnit === 'Tokens') {
              updateObj.tokens = afterBalance;
            } else {
              updateObj.veloopCoins = afterBalance;
              updateObj.coins = afterBalance;
            }
            await User.updateOne({ id: liveUser.id || userId }, { $set: updateObj }, { session: mongoSession });

            // 3. Create Transaction Record
            await GiveawayEntryTransaction.create([transactionRecord], { session: mongoSession });
          }

          // 4. Increment Giveaway Pool Counts
          await Giveaway.updateOne(
            { id: giveaway.id },
            { $inc: { totalTicketsEntered: parsedTickets, totalTickets: parsedTickets } },
            { session: mongoSession }
          );

          await mongoSession.commitTransaction();
        } catch (mongoErr) {
          if (mongoSession) {
            try { await mongoSession.abortTransaction(); } catch {}
          }
          if (mongoErr.code === 11000 || mongoErr.name === 'MongoServerError' || mongoErr.message?.includes('duplicate key')) {
            const error = new Error('Participation already exists.');
            error.code = 'ALREADY_PARTICIPATED';
            error.status = 400;
            throw error;
          }
          throw mongoErr;
        } finally {
          if (mongoSession) {
            mongoSession.endSession();
          }
        }
      }

      // 5.2 Execute Atomic State Store updates
      try {
        db.addTicket(participationRecord);
        
        if (entryType === 'paid' && totalRequiredFee > 0) {
          const updatedFields = {};
          if (currencyUnit === 'SVEs') {
            updatedFields.sveCoins = afterBalance;
          } else if (currencyUnit === 'Tokens') {
            updatedFields.tokens = afterBalance;
          } else {
            updatedFields.veloopCoins = afterBalance;
            updatedFields.coins = afterBalance;
          }
          db.updateUser(liveUser.id || userId, updatedFields);
          db.addTransaction(transactionRecord);
        }

        const updatedCount = Number(giveaway.totalTicketsEntered || giveaway.totalTickets || 0) + parsedTickets;
        db.updateGiveaway(giveaway.id, {
          totalTicketsEntered: updatedCount,
          totalTickets: updatedCount
        });
      } catch (storeErr) {
        if (storeErr.code === 11000 || storeErr.message?.includes('duplicate key')) {
          const error = new Error('Participation already exists.');
          error.code = 'ALREADY_PARTICIPATED';
          error.status = 400;
          throw error;
        }
        throw storeErr;
      }

      // Register device session for abuse detection
      if (deviceHash) {
        db.registerDeviceSession(deviceHash, liveUser.id || userId, ipAddress, userAgent);
      }

      // Requirement 29: Audit Logging
      await AuditService.logJoinGiveaway({
        userId: liveUser.id || userId,
        giveawayId: giveaway.id,
        giveawayTitle: giveaway.title,
        amount: totalRequiredFee,
        currency: currencyUnit,
        ticketId,
        transactionId: txId,
        idempotencyKey,
        ipAddress,
        deviceHash: deviceHash || null,
        userAgent
      });

      if (entryType === 'paid' && totalRequiredFee > 0) {
        await AuditService.logEntryFeeDeducted({
          userId: liveUser.id || userId,
          giveawayId: giveaway.id,
          giveawayTitle: giveaway.title,
          amount: totalRequiredFee,
          currency: currencyUnit,
          transactionId: txId,
          balanceBefore: beforeBalance,
          balanceAfter: afterBalance,
          ipAddress,
          deviceHash: deviceHash || null
        });
      }

      AuditLogger.info(`Atomic transaction complete: User ${liveUser.id || userId} charged ${totalRequiredFee} ${currencyUnit}, ticket ${ticketId} minted for ${giveaway.title}`);

      const responseResult = {
        success: true,
        ticket: participationRecord,
        status: participationStatus,
        flaggedForReview: participationStatus === 'flagged_review',
        remainingBalance: afterBalance,
        feePaid: totalRequiredFee,
        currencyUnit,
        transactionId: txId,
        deviceHash: deviceHash || null
      };

      if (idempotencyKey) {
        db.saveIdempotencyRecord(idempotencyKey, responseResult);
      }

      return responseResult;
    });
  }

  /**
   * Reverses a transaction and refunds user balance (e.g. administrative refund, canceled draw, fraud reversal)
   */
  static async reverseTransaction(txId, reversalReason = 'Administrative refund') {
    return await db.withLock(async () => {
      let tx = db.getTransactionById(txId);
      if (!tx) {
        throw new Error(`Transaction ${txId} not found`);
      }

      if (tx.status === TransactionStatus.REVERSED) {
        throw new Error(`Transaction ${txId} is already reversed`);
      }

      const user = db.getUserById(tx.userDbId || tx.userId);
      if (!user) {
        throw new Error(`User ${tx.userId} not found for transaction reversal`);
      }

      const currencyUnit = tx.currency || tx.currencyUnit || 'VEs';
      const refundAmount = Number(tx.amount || 0);

      const beforeBalance = currencyUnit === 'SVEs' 
        ? Number(user.sveCoins ?? 0) 
        : currencyUnit === 'Tokens'
          ? Number(user.tokens ?? 0)
          : Number(user.veloopCoins ?? user.coins ?? 0);
      const afterBalance = beforeBalance + refundAmount;

      const updatedFields = {};
      if (currencyUnit === 'SVEs') {
        updatedFields.sveCoins = afterBalance;
      } else if (currencyUnit === 'Tokens') {
        updatedFields.tokens = afterBalance;
      } else {
        updatedFields.veloopCoins = afterBalance;
        updatedFields.coins = afterBalance;
      }

      db.updateUser(user.id, updatedFields);
      const updatedTx = db.updateTransaction(txId, {
        status: TransactionStatus.REVERSED,
        reversalReason,
        reversedAt: new Date().toISOString()
      });

      if (isMongo()) {
        try {
          await User.updateOne({ id: user.id }, { $set: updatedFields });
          await GiveawayEntryTransaction.updateOne(
            { transactionId: txId },
            { $set: { status: TransactionStatus.REVERSED, reversalReason } }
          );
        } catch {}
      }

      db.logAudit({
        action: 'TRANSACTION_REVERSED',
        txId,
        userId: user.id,
        refundAmount,
        currencyUnit,
        reversalReason,
        beforeBalance,
        afterBalance
      });

      AuditLogger.warn(`Transaction ${txId} REVERSED: Refunded ${refundAmount} ${currencyUnit} to ${user.userId || user.id}. Reason: ${reversalReason}`);

      return {
        success: true,
        transaction: updatedTx,
        refundedAmount: refundAmount,
        currencyUnit,
        newBalance: afterBalance
      };
    });
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

  /**
   * Fetch all user transactions
   */
  static async getUserTransactions(userId) {
    let txs = [];
    if (isMongo()) {
      try {
        txs = await GiveawayEntryTransaction.find({ userId }).sort({ createdAt: -1 }).lean();
      } catch {}
    }
    if (txs.length === 0) {
      txs = db.getTransactionsByUser(userId);
    }
    return txs;
  }
}

