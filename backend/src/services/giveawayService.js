import mongoose from 'mongoose';
import { db } from '../data/store.js';
import { Giveaway } from '../models/Giveaway.js';
import { CryptoFairEngine } from '../utils/cryptoFair.js';
import { AuditLogger } from '../utils/logger.js';

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

    // 1. Explicit Administrative Archive
    if (rawStatus === 'ARCHIVED') {
      return {
        ...giveaway,
        status: 'ARCHIVED',
        statusLabel: 'Giveaway Archived',
        isUpcoming: false,
        isActive: false,
        isEnded: true
      };
    }

    // 2. Already drawn or manually concluded
    if (rawStatus === 'ENDED' || giveaway.winnerName) {
      return {
        ...giveaway,
        status: 'ENDED',
        statusLabel: 'Giveaway Ended',
        isUpcoming: false,
        isActive: false,
        isEnded: true
      };
    }

    // 3. Time-based lifecycle resolution (Server is authoritative)
    if (now < start) {
      return {
        ...giveaway,
        status: 'UPCOMING',
        statusLabel: 'Starting Soon',
        isUpcoming: true,
        isActive: false,
        isEnded: false
      };
    }

    if (now >= end) {
      return {
        ...giveaway,
        status: 'ENDED',
        statusLabel: 'Giveaway Ended',
        isUpcoming: false,
        isActive: false,
        isEnded: true
      };
    }

    return {
      ...giveaway,
      status: 'ACTIVE',
      statusLabel: 'Giveaway Live',
      isUpcoming: false,
      isActive: true,
      isEnded: false
    };
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
   * Zero-Trust Server-Side Validation: Ensures giveaway exists, is ACTIVE, and within entry limits
   */
  static validateGiveawayEligibility(giveaway) {
    if (!giveaway) {
      return { eligible: false, error: 'GIVEAWAY_NOT_FOUND', message: 'Giveaway does not exist' };
    }

    const resolved = this.resolveAuthoritativeStatus(giveaway);

    if (resolved.status !== 'ACTIVE') {
      return {
        eligible: false,
        error: 'GIVEAWAY_INACTIVE',
        message: `Giveaway is currently ${resolved.status}. Participation is only permitted when status is ACTIVE.`
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
}
