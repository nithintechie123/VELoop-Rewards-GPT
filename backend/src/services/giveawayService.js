import mongoose from 'mongoose';
import { db } from '../data/store.js';
import { Giveaway } from '../models/Giveaway.js';
import { GiveawayWinner } from '../models/GiveawayWinner.js';
import { CryptoFairEngine } from '../utils/cryptoFair.js';
import { AuditLogger } from '../utils/logger.js';
import { AuditService } from './auditService.js';
import { sanitizePublicGiveaway } from '../utils/sanitizer.js';

const isMongo = () => mongoose.connection.readyState === 1;

export class GiveawayService {
  /**
   * Authoritative Server-Side Lifecycle Engine
   * Evaluates the real-time status of a giveaway based on backend timestamps and lifecycle rules.
   * Possible statuses: UPCOMING, ACTIVE, ENDED, ARCHIVED
   */
  static resolveAuthoritativeStatus(giveaway) {
    if (!giveaway) return null;

    const now = new Date();
    const start = new Date(giveaway.startAt || giveaway.startDate || 0);
    const end = new Date(giveaway.endAt || giveaway.endDate || giveaway.endsAt);
    const rawStatus = (giveaway.status || 'ACTIVE').toUpperCase();

    let resolved = null;

    // 1. Explicit Administrative Archive
    if (rawStatus === 'ARCHIVED') {
      resolved = {
        ...giveaway,
        status: 'ARCHIVED',
        statusLabel: 'Giveaway Archived',
        isUpcoming: false,
        isActive: false,
        isEnded: true
      };
    } else if (rawStatus === 'DRAFT' || rawStatus === 'PAUSED' || rawStatus === 'INACTIVE') {
      resolved = {
        ...giveaway,
        status: rawStatus,
        statusLabel: rawStatus === 'DRAFT' ? 'Draft' : 'Giveaway Paused',
        isUpcoming: false,
        isActive: false,
        isEnded: false
      };
    } else if (rawStatus === 'ENDED' || giveaway.winnerName) {
      // 2. Already drawn or manually concluded
      resolved = {
        ...giveaway,
        status: 'ENDED',
        statusLabel: 'Giveaway Ended',
        isUpcoming: false,
        isActive: false,
        isEnded: true
      };
    } else if (now < start) {
      // 3. Time-based lifecycle resolution (Server is authoritative)
      resolved = {
        ...giveaway,
        status: 'UPCOMING',
        statusLabel: 'Starting Soon',
        isUpcoming: true,
        isActive: false,
        isEnded: false
      };
    } else if (now >= end) {
      resolved = {
        ...giveaway,
        status: 'ENDED',
        statusLabel: 'Giveaway Ended',
        isUpcoming: false,
        isActive: false,
        isEnded: true
      };
    } else {
      resolved = {
        ...giveaway,
        status: 'ACTIVE',
        statusLabel: 'Giveaway Live',
        isUpcoming: false,
        isActive: true,
        isEnded: false
      };
    }

    return sanitizePublicGiveaway(resolved);
  }

  /**
   * Fetch all active & scheduled giveaways with authoritative status resolution
   */
  static async getAllGiveaways(filters = {}) {
    let hero = null;
    let list = [];

    if (isMongo()) {
      try {
        hero = await Giveaway.findOne({ isHero: true }).lean();
        const query = { isHero: { $ne: true } };
        if (filters.category && filters.category !== 'all') {
          query.category = new RegExp(filters.category, 'i');
        }
        if (filters.status) {
          query.status = new RegExp(`^${filters.status}$`, 'i');
        }
        list = await Giveaway.find(query).sort({ position: 1, createdAt: -1 }).lean();
      } catch {}
    }

    if (!hero) {
      hero = db.getHeroGiveaway();
    }
    if (list.length === 0) {
      list = db.getGiveaways();
      if (filters.category && filters.category !== 'all') {
        const cat = filters.category.toLowerCase();
        list = list.filter(g => g.category?.toLowerCase() === cat);
      }
      if (filters.status) {
        const s = filters.status.toUpperCase();
        list = list.filter(g => (g.status || '').toUpperCase() === s);
      }
    }

    const resolvedHero = hero ? this.resolveAuthoritativeStatus(hero) : null;
    const resolvedList = list.map(g => this.resolveAuthoritativeStatus(g));

    return {
      heroGiveaway: resolvedHero,
      giveaways: resolvedList,
      total: (resolvedHero ? 1 : 0) + resolvedList.length
    };
  }

  /**
   * Fetch a single giveaway by ID or slug with authoritative status
   */
  static async getGiveawayById(idOrSlug) {
    if (!idOrSlug) return null;
    let giveaway = null;
    if (isMongo()) {
      try {
        giveaway = await Giveaway.findOne({
          $or: [{ id: idOrSlug }, { slug: idOrSlug }]
        }).lean();
      } catch {}
    }

    if (!giveaway) {
      giveaway = db.getGiveawayById(idOrSlug);
    }
    return giveaway ? this.resolveAuthoritativeStatus(giveaway) : null;
  }

  /**
   * Zero-Trust Server-Side Validation: Ensures giveaway exists, is ACTIVE, and within entry limits (Requirement 19)
   */
  static validateGiveawayEligibility(giveaway) {
    if (!giveaway) {
      return { eligible: false, error: 'GIVEAWAY_NOT_FOUND', message: 'Giveaway does not exist' };
    }

    const now = new Date();
    const start = new Date(giveaway.startAt || giveaway.startDate || 0);
    const end = new Date(giveaway.endAt || giveaway.endDate || giveaway.endsAt);
    const rawStatus = (giveaway.status || 'ACTIVE').toUpperCase();

    // 1. Authoritative Server Time Check: startAt <= now <= endAt (Requirement 19)
    // If now > endAt, immediately reject with GIVEAWAY_ENDED even if client shows active button
    if (now > end || rawStatus === 'ENDED' || rawStatus === 'ARCHIVED') {
      return {
        eligible: false,
        error: 'GIVEAWAY_ENDED',
        message: 'This giveaway has ended. New participations are not accepted.',
        details: { serverTime: now.toISOString(), endAt: end.toISOString() }
      };
    }

    if (now < start || rawStatus === 'UPCOMING') {
      return {
        eligible: false,
        error: 'GIVEAWAY_UPCOMING',
        message: 'This giveaway has not started yet.',
        details: { serverTime: now.toISOString(), startAt: start.toISOString() }
      };
    }

    const resolved = this.resolveAuthoritativeStatus(giveaway);

    if (resolved.status !== 'ACTIVE') {
      const isEnded = resolved.status === 'ENDED' || resolved.status === 'ARCHIVED';
      return {
        eligible: false,
        error: isEnded ? 'GIVEAWAY_ENDED' : 'GIVEAWAY_NOT_ACTIVE',
        message: isEnded ? 'This giveaway has ended.' : `Giveaway is currently ${resolved.status}. Participation is only permitted when status is ACTIVE.`
      };
    }

    const currentTickets = Number(giveaway.totalTicketsEntered || giveaway.totalTickets || 0);
    const poolCap = Number(giveaway.poolCap || 999999);
    if (currentTickets >= poolCap) {
      return { eligible: false, error: 'POOL_CAP_REACHED', message: 'This giveaway ticket pool has reached maximum capacity' };
    }

    return { eligible: true, giveaway: resolved };
  }

  /**
   * Create a new giveaway with provably fair cryptographic seeds and status
   */
  static async createGiveaway(data) {
    const serverSeed = CryptoFairEngine.generateServerSeed();
    const serverSeedHash = CryptoFairEngine.hashSeed(serverSeed);

    const giveawayDoc = {
      id: data.id || `gw-${Date.now()}`,
      slug: data.slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      isHero: Boolean(data.isHero),
      prizeTier: data.prizeTier || 'Tier 1',
      title: data.title,
      name: data.title,
      description: data.description || '',
      subtitle: data.subtitle || '',
      type: data.type || 'physical',
      prizeType: data.prizeType || 'PHYSICAL',
      claimType: data.claimType || 'shipping_address',
      category: data.category || 'Tech',
      badge: data.badge || '',
      image: data.image,
      value: data.value || '₹0',
      valueUSD: Number(data.valueUSD || 0),
      winnerCount: Number(data.winnerCount || 1),
      winnerLabel: `${data.winnerCount || 1} Winner${(data.winnerCount || 1) > 1 ? 's' : ''}`,
      totalTicketsEntered: 0,
      totalTickets: 0,
      poolCap: Number(data.poolCap || 10000),
      entryFee: Number(data.entryFee ?? 250),
      entryFeeUnit: data.entryFeeUnit || 'VEs',
      joiningRequirement: `${data.entryFee ?? 250} ${data.entryFeeUnit || 'VEs'}`,
      status: (data.status || 'ACTIVE').toUpperCase(),
      statusLabel: data.status === 'UPCOMING' ? 'Starting Soon' : 'Giveaway Live',
      startAt: data.startAt || new Date(),
      endAt: data.endAt || data.endsAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      endsAt: data.endAt || data.endsAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      endDate: data.endAt || data.endsAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      startDate: data.startAt || new Date(),
      rules: data.rules || {
        terms: ['Open to verified VELOOP members 18+.', 'SHA-256 Provably fair draw.'],
        minAge: 18,
        prohibitedRegions: [],
        maxEntriesPerUser: 100
      },
      eligibility: data.eligibility || {
        minTier: 'Member',
        requireVerification: false,
        allowedCountries: ['IN', 'US', 'GB', 'GLOBAL'],
        minBalanceRequired: 0
      },
      prizes: data.prizes || [
        {
          id: `p-${Date.now()}`,
          title: data.title,
          tier: '1st Prize',
          type: data.prizeType || 'PHYSICAL',
          value: data.value || '₹0',
          image: data.image,
          quantity: 1
        }
      ],
      participationSettings: data.participationSettings || {
        entryFee: Number(data.entryFee ?? 250),
        entryFeeUnit: data.entryFeeUnit || 'VEs',
        allowsFreeDaily: true,
        maxTicketsPerBatch: 50,
        poolCap: Number(data.poolCap || 10000),
        currentTickets: 0
      },
      serverSeed,
      serverSeedHash,
      clientSeed: 'VELOOP_COMMUNITY_PUBLIC_SEED'
    };

    if (isMongo()) {
      try {
        await Giveaway.create(giveawayDoc);
      } catch {}
    }

    db.state.giveaways.push(giveawayDoc);
    db.save();

    AuditLogger.info(`Created giveaway: ${giveawayDoc.id} (${giveawayDoc.title}) [Status: ${giveawayDoc.status}]`);
    return this.resolveAuthoritativeStatus(giveawayDoc);
  }

  /**
   * Retrieves strictly eligible tickets for winner selection (Requirement 28)
   * Excludes flagged, rejected, blocked, or revoked tickets so suspicious participations
   * NEVER generate winner eligibility or additional entries.
   */
  static getEligibleDrawTickets(giveawayId) {
    const rawTickets = db.getTicketsByGiveaway(giveawayId) || [];
    return rawTickets.filter(t => {
      // 1. Ticket status must be confirmed
      if (t.status !== 'confirmed') return false;
      // 2. Ticket must not have a flagged review or fraud marker
      if (t.flaggedForReview || t.isFlagged || t.isRevoked) return false;
      // 3. User account must not be suspended/blocked
      const user = db.getUserById(t.userId);
      if (user && (user.status === 'suspended' || user.status === 'blocked')) return false;
      return true;
    });
  }

  /**
   * Executes a Provably Fair cryptographic draw for a giveaway (Requirement 28)
   * Only legitimate, confirmed tickets participate in winner selection.
   */
  static async executeDraw(giveawayId, clientSeedOverride = null) {
    return await db.withLock(async () => {
      const giveaway = await this.getGiveawayById(giveawayId);
      if (!giveaway) {
        throw new Error(`Giveaway ${giveawayId} not found`);
      }

      // Requirement 32: One Winner Enforcement (winnerCount limit)
      // If multiple requests/processes attempt to assign an iPhone winner, only the configured number of winners is created.
      const configuredWinnerCount = Number(giveaway.winnerCount || giveaway.prizes?.[0]?.quantity || 1);
      const existingWinners = db.getArchiveWinners().filter(w => w.giveawayId === giveaway.id);

      if (giveaway.winnerSelected || existingWinners.length >= configuredWinnerCount) {
        const canonicalWinner = giveaway.winner || existingWinners[0];
        AuditLogger.info(`Winner limit reached (${existingWinners.length}/${configuredWinnerCount}) for giveaway ${giveaway.id}: returning canonical winner`);
        return {
          success: true,
          alreadyFinalized: true,
          winnerLimitEnforced: true,
          configuredWinnerCount,
          giveawayId: giveaway.id,
          winner: canonicalWinner,
          winners: existingWinners,
          proof: canonicalWinner?.proof,
          eligibleTicketCount: canonicalWinner?.proof?.totalEligibleTickets || 1
        };
      }

      const eligibleTickets = this.getEligibleDrawTickets(giveaway.id);
      if (eligibleTickets.length === 0) {
        return {
          success: false,
          giveawayId: giveaway.id,
          message: 'No eligible tickets available for draw (all entries either non-existent or flagged/blocked)',
          eligibleTicketCount: 0,
          winners: []
        };
      }

      const serverSeed = giveaway.serverSeed || CryptoFairEngine.generateServerSeed();
      const clientSeed = clientSeedOverride || giveaway.clientSeed || 'VELOOP_PUBLIC_COMMUNITY_SEED';

      // Requirement 33: Multiple Winners Selection via Provably Fair Multiple Indices
      const multiResult = CryptoFairEngine.calculateMultipleWinningIndices(
        serverSeed,
        clientSeed,
        configuredWinnerCount,
        eligibleTickets.length
      );

      const winnerRecords = [];
      const selectedAtISO = new Date().toISOString();

      for (let i = 0; i < multiResult.selectedIndices.length; i++) {
        const winningIndex = multiResult.selectedIndices[i];
        const proof = multiResult.proofs[i];
        const winningTicket = eligibleTickets[winningIndex];
        const winningUser = db.getUserById(winningTicket.userId);
        const prizeObj = giveaway.prizes?.[i] || giveaway.prizes?.[0] || { id: `prize_${giveaway.id}_${i + 1}`, title: giveaway.title, value: giveaway.value };
        const prizeId = prizeObj.id || giveaway.prizeId || `prize_${giveaway.id}_${i + 1}`;

        const winnerRecord = {
          id: `win_${giveaway.id}_${i + 1}_${Date.now()}`,
          giveawayId: giveaway.id,
          giveawayTitle: giveaway.title,
          giveawayName: giveaway.title,
          prizeId,
          prizeTitle: prizeObj.title || giveaway.title,
          prizeValue: prizeObj.value || giveaway.value || '₹0',
          prizeType: prizeObj.type || giveaway.prizeType || 'PHYSICAL',
          prize: prizeObj,
          userId: winningTicket.userId,
          winnerUserId: winningTicket.userId,
          userName: winningUser?.name || winningTicket.userName || 'Anonymous Member',
          winnerName: winningUser?.name || winningTicket.userName || 'Anonymous Member',
          userAvatar: winningUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
          userLocation: winningUser?.location || 'Bengaluru, India',
          winningTicketId: winningTicket.ticketId || winningTicket.id,
          ticketNumber: winningTicket.ticketId || winningTicket.id,
          selectionMethod: 'PROVABLY_FAIR_SHA256',
          selectedAt: selectedAtISO,
          wonAt: selectedAtISO,
          status: 'CONFIRMED',
          claimed: false,
          claimStatus: 'unclaimed',
          serverSeed,
          serverSeedHash: giveaway.serverSeedHash || CryptoFairEngine.hashSeed(serverSeed),
          clientSeed,
          resultHash: proof.resultHash,
          winningIndex,
          proof: {
            serverSeedHashed: proof.serverSeedHashed,
            serverSeedUnmasked: proof.serverSeedUnmasked,
            clientSeed: proof.clientSeed,
            nonce: proof.nonce,
            winningIndex,
            totalEligibleTickets: eligibleTickets.length,
            resultHash: proof.resultHash
          },
          drawnAt: selectedAtISO
        };

        winnerRecords.push(winnerRecord);
        db.addArchiveWinner(winnerRecord);
        db.updateWinnerRecord(winnerRecord.winnerUserId, winnerRecord);

        if (isMongo()) {
          try {
            await GiveawayWinner.create(winnerRecord);
          } catch (mongoErr) {
            AuditLogger.warn(`MongoDB GiveawayWinner create note: ${mongoErr.message}`);
          }
        }

        await AuditService.logWinnerSelected({
          giveawayId: giveaway.id,
          giveawayTitle: giveaway.title,
          winningTicketId: winnerRecord.winningTicketId,
          winnerUserId: winnerRecord.winnerUserId,
          winnerName: winnerRecord.winnerName,
          prize: winnerRecord.prize,
          proof: winnerRecord.proof,
          clientSeed,
          serverSeedHash: giveaway.serverSeedHash
        });

        AuditLogger.info(`[Winner ${i + 1}/${multiResult.selectedIndices.length}] Winner selected for ${giveaway.title}: ${winnerRecord.winnerName} (Ticket: ${winnerRecord.winningTicketId})`);
      }

      const primaryWinner = winnerRecords[0];
      const combinedWinnerNames = winnerRecords.map(w => w.winnerName).join(', ');

      giveaway.status = 'ENDED';
      giveaway.winnerSelected = true;
      giveaway.winner = primaryWinner;
      giveaway.winners = winnerRecords;
      giveaway.winnerName = combinedWinnerNames;
      giveaway.winningTicket = primaryWinner.ticketNumber;

      db.updateGiveaway(giveaway.id, {
        status: 'ENDED',
        winnerSelected: true,
        winner: primaryWinner,
        winners: winnerRecords,
        winnerName: combinedWinnerNames,
        winningTicket: primaryWinner.ticketNumber
      });

      if (isMongo()) {
        try {
          await Giveaway.updateOne(
            { id: giveaway.id },
            {
              $set: {
                status: 'ENDED',
                winnerSelected: true,
                winner: primaryWinner,
                winners: winnerRecords,
                winnerName: combinedWinnerNames,
                winningTicket: primaryWinner.ticketNumber
              }
            }
          );
        } catch {}
      }

      return {
        success: true,
        giveawayId: giveaway.id,
        configuredWinnerCount,
        winnerCount: winnerRecords.length,
        winner: primaryWinner,
        winners: winnerRecords,
        proofs: multiResult.proofs,
        proof: primaryWinner.proof,
        eligibleTicketCount: eligibleTickets.length
      };
    });
  }
}
