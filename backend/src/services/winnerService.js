import mongoose from 'mongoose';
import { db } from '../data/store.js';
import { CryptoFairEngine } from '../utils/cryptoFair.js';
import { AuditLogger } from '../utils/logger.js';
import { GiveawayWinner } from '../models/GiveawayWinner.js';
import { Giveaway } from '../models/Giveaway.js';

const isMongo = () => mongoose.connection.readyState === 1;

export class WinnerService {
  /**
   * Fetch Spotlight & Archive Winners
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
      spotlightWinners: spotlight,
      archiveWinners: archive
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
   * Draw winner for a completed giveaway deterministically
   */
  static async drawGiveawayWinner(giveawayId, communitySeed = 'VELOOP_COMMUNITY_PUBLIC_SEED') {
    const giveaway = db.getGiveawayById(giveawayId);
    if (!giveaway) throw new Error('Giveaway not found');

    const tickets = db.getTicketsByGiveaway(giveaway.id);
    if (tickets.length === 0) {
      throw new Error('No tickets participated in this giveaway');
    }

    const serverSeed = giveaway.serverSeed || CryptoFairEngine.generateServerSeed();
    const calculation = CryptoFairEngine.calculateWinningTicketIndex(
      serverSeed,
      communitySeed,
      1,
      tickets.length
    );

    const winningTicket = tickets[calculation.winningIndex];
    const winnerUser = db.getUserById(winningTicket.userId);

    const winnerDoc = {
      id: `win_${Date.now()}`,
      giveawayId: giveaway.id,
      giveawayTitle: giveaway.title,
      userId: winningTicket.userId,
      userName: winnerUser?.name || winnerUser?.fullName || winningTicket.userName,
      userAvatar: winnerUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      userLocation: winnerUser?.location || 'Bengaluru, India',
      ticketNumber: winningTicket.ticketId,
      prizeTitle: giveaway.title,
      prizeValue: giveaway.value,
      prizeType: giveaway.prizeType || 'PHYSICAL',
      wonAt: new Date().toISOString(),
      claimed: false,
      claimStatus: 'unclaimed',
      serverSeed,
      serverSeedHash: CryptoFairEngine.hashSeed(serverSeed),
      clientSeed: communitySeed,
      resultHash: calculation.resultHash,
      winningIndex: calculation.winningIndex
    };

    db.addArchiveWinner(winnerDoc);
    db.updateGiveaway(giveaway.id, {
      status: 'ended',
      statusLabel: 'Giveaway Ended',
      winnerName: winnerDoc.userName,
      winningTicket: winningTicket.ticketId
    });

    if (isMongo()) {
      try {
        await GiveawayWinner.create(winnerDoc);
        await Giveaway.updateOne(
          { id: giveaway.id },
          {
            $set: {
              status: 'ended',
              statusLabel: 'Giveaway Ended',
              winnerName: winnerDoc.userName,
              winningTicket: winningTicket.ticketId
            }
          }
        );
      } catch {}
    }

    db.logAudit({
      action: 'WINNER_DRAWN_PROVABLY_FAIR',
      giveawayId: giveaway.id,
      winnerUserId: winningTicket.userId,
      winningTicket: winningTicket.ticketId,
      resultHash: calculation.resultHash
    });

    AuditLogger.info(`Winner drawn for ${giveaway.title}: ${winnerDoc.userName} (${winningTicket.ticketId})`);

    return winnerDoc;
  }
}
