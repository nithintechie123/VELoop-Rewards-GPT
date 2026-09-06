import mongoose from 'mongoose';
import { db } from '../data/store.js';
import { AuditLogger } from '../utils/logger.js';
import { User } from '../models/User.js';
import { GiveawayEntryTransaction } from '../models/GiveawayEntryTransaction.js';

const isMongo = () => mongoose.connection.readyState === 1;

export class BalanceService {
  /**
   * Retrieves accurate server-side wallet balances for a user
   */
  static async getUserBalance(userId) {
    let user = null;
    if (isMongo()) {
      try {
        user = await User.findOne({ id: userId }).lean();
      } catch {}
    }
    if (!user) {
      user = db.getUserById(userId);
    }
    if (!user) return null;

    return {
      userId: user.id || user.userId,
      veloopCoins: user.veloopCoins ?? user.coins ?? 0,
      sveCoins: user.sveCoins ?? 0,
      tokens: user.tokens ?? user.veloopCoins ?? 0,
      tier: user.tier || 'Member',
      isVerified: Boolean(user.isVerified)
    };
  }

  /**
   * Zero-Trust validation: Verifies if user has sufficient balance on the server
   */
  static verifySufficientBalance(user, requiredAmount, currencyUnit = 'VEs') {
    if (!user) return { sufficient: false, currentBalance: 0, requiredAmount, difference: requiredAmount };

    let currentBalance = 0;
    if (currencyUnit === 'SVEs') {
      currentBalance = Number(user.sveCoins ?? 0);
    } else if (currencyUnit === 'Tokens') {
      currentBalance = Number(user.tokens ?? user.veloopCoins ?? 0);
    } else {
      // Default to VEs (veloopCoins)
      currentBalance = Number(user.veloopCoins ?? user.coins ?? 0);
    }

    const difference = Math.max(0, requiredAmount - currentBalance);
    const sufficient = currentBalance >= requiredAmount;

    return {
      sufficient,
      currentBalance,
      requiredAmount,
      difference,
      currencyUnit
    };
  }

  /**
   * Atomic deduction of entry fee from user balance with transaction ledger recording
   */
  static async debitEntryFee({ userId, amount, currencyUnit = 'VEs', giveawayId, giveawayTitle, ticketCount = 1, ipAddress = '127.0.0.1' }) {
    return db.withLock(async () => {
      let user = db.getUserById(userId);
      if (!user) {
        throw new Error('User account not found');
      }

      const balanceCheck = this.verifySufficientBalance(user, amount, currencyUnit);
      if (!balanceCheck.sufficient) {
        const error = new Error(`Insufficient ${currencyUnit} balance`);
        error.code = 'INSUFFICIENT_BALANCE';
        error.details = balanceCheck;
        throw error;
      }

      let updatedFields = {};
      const beforeBalance = balanceCheck.currentBalance;
      const afterBalance = beforeBalance - amount;

      if (currencyUnit === 'SVEs') {
        updatedFields.sveCoins = afterBalance;
      } else if (currencyUnit === 'Tokens') {
        updatedFields.tokens = afterBalance;
      } else {
        updatedFields.veloopCoins = afterBalance;
        updatedFields.coins = afterBalance;
      }

      // Update in data store
      user = db.updateUser(userId, updatedFields);

      // Attempt Mongoose sync if connected
      if (isMongo()) {
        try {
          await User.updateOne({ id: userId }, { $set: updatedFields });
        } catch {}
      }

      // Create Entry Transaction
      const transaction = {
        id: `tx_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`,
        userId,
        giveawayId,
        giveawayTitle,
        type: 'DEBIT',
        amount,
        currencyUnit,
        ticketCount,
        balanceBefore: beforeBalance,
        balanceAfter: afterBalance,
        ipAddress,
        timestamp: new Date().toISOString()
      };

      db.addTransaction(transaction);
      if (isMongo()) {
        try {
          await GiveawayEntryTransaction.create(transaction);
        } catch {}
      }

      db.logAudit({
        action: 'ENTRY_FEE_DEBITED',
        userId,
        giveawayId,
        amount,
        currencyUnit,
        balanceBefore: beforeBalance,
        balanceAfter: afterBalance,
        ipAddress
      });

      AuditLogger.info(`Atomic debit: User ${userId} charged ${amount} ${currencyUnit} for ${giveawayTitle}. Remaining: ${afterBalance}`);

      return {
        success: true,
        transaction,
        remainingBalance: afterBalance,
        currencyUnit
      };
    });
  }
}
