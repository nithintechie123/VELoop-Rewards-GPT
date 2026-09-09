import mongoose from 'mongoose';
import { db } from '../data/store.js';
import { CryptoFairEngine } from '../utils/cryptoFair.js';
import { AuditLogger } from '../utils/logger.js';
import { GiveawayWinner } from '../models/GiveawayWinner.js';
import { Giveaway } from '../models/Giveaway.js';
import { GiveawayService } from './giveawayService.js';
import { sanitizePublicWinner } from '../utils/sanitizer.js';

const isMongo = () => mongoose.connection.readyState === 1;

export class WinnerService {
  /**
   * Centralized Public Winner Record Sanitizer (Requirement 38)
   */
  static sanitizePublicWinner(winner) {
    return sanitizePublicWinner(winner);
  }

  /**
   * Fetch Spotlight & Archive Winners (Strictly Sanitized Public Output)
   */
  static async getWinners() {
    let spotlight = [];
    let archive = [];

    if (isMongo()) {
      try {
        spotlight = await GiveawayWinner.find({ isSpotlight: true }).lean();
        archive = await GiveawayWinner.find({ isSpotlight: false }).sort({ wonAt: -1 }).lean();
      } catch {}
    }

    if (spotlight.length === 0) {
      spotlight = db.getSpotlightWinners();
    }
    if (archive.length === 0) {
      archive = db.getArchiveWinners();
    }

    return {
      spotlightWinners: spotlight.map(w => this.sanitizePublicWinner(w)),
      archiveWinners: archive.map(w => this.sanitizePublicWinner(w))
    };
  }

  /**
   * Look up winning eligibility / status for a specific user
   */
  static async getWinnerByUserId(userId) {
    let winner = null;
    if (isMongo()) {
      try {
        winner = await GiveawayWinner.findOne({ userId }).lean();
      } catch {}
    }

    if (!winner) {
      winner = db.getWinnerRecord(userId);
    }
    return winner;
  }

  /**
   * Verify provably fair cryptographic proof for a giveaway
   */
  static verifyFairnessProof({ serverSeed, clientSeed, nonce = 1, totalTickets, winningIndex }) {
    return CryptoFairEngine.verifyProof(serverSeed, clientSeed, nonce, totalTickets, winningIndex);
  }

  /**
   * Authoritative Backend Winner Selection (Requirement 30)
   * Winner selection is strictly executed and finalized by the backend.
   * Never select winners using frontend JavaScript.
   */
  static async drawGiveawayWinner(giveawayId, communitySeed = 'VELOOP_COMMUNITY_PUBLIC_SEED') {
    const drawResult = await GiveawayService.executeDraw(giveawayId, communitySeed);
    if (!drawResult.success) {
      throw new Error(drawResult.message || 'No eligible tickets available for draw');
    }
    return drawResult;
  }
}
