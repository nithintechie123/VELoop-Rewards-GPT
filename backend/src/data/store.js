import fs from 'fs';
import path from 'path';
import { initialSeedData } from './initialSeedData.js';
import { AuditLogger } from '../utils/logger.js';

class DataStore {
  constructor() {
    this.dbPath = path.resolve('backend/src/data/database.json');
    this.state = {
      users: [],
      heroGiveaway: null,
      giveaways: [],
      tickets: [],
      transactions: [],
      claims: [],
      spotlightWinners: [],
      archiveWinners: [],
      winnerLookup: [],
      auditLogs: [],
      fraudIncidents: [],
      idempotencyRecords: [],
      deviceRegistry: [],
      failedAttempts: []
    };

    // Concurrency lock for atomic transactions
    this.lockQueue = Promise.resolve();
    this.init();
  }

  init() {
    try {
      if (fs.existsSync(this.dbPath)) {
        const raw = fs.readFileSync(this.dbPath, 'utf8');
        const parsed = JSON.parse(raw);
        this.state = { ...this.state, ...parsed };

        // Synchronize all giveaways if list was partial or missing items
        if (!this.state.giveaways || this.state.giveaways.length < initialSeedData.giveaways.length) {
          this.state.heroGiveaway = JSON.parse(JSON.stringify(initialSeedData.heroGiveaway));
          this.state.giveaways = JSON.parse(JSON.stringify(initialSeedData.giveaways));
          this.save();
        }

        AuditLogger.info('Persistent Database loaded successfully from disk.');
      } else {
        this.seed();
      }
    } catch (err) {
      AuditLogger.warn('Could not read existing database.json, re-seeding default records:', { error: err.message });
      this.seed();
    }
  }

  seed() {
    this.state = {
      users: JSON.parse(JSON.stringify(initialSeedData.users)),
      heroGiveaway: JSON.parse(JSON.stringify(initialSeedData.heroGiveaway)),
      giveaways: JSON.parse(JSON.stringify(initialSeedData.giveaways)),
      tickets: [],
      transactions: [],
      claims: [],
      spotlightWinners: JSON.parse(JSON.stringify(initialSeedData.spotlightWinners)),
      archiveWinners: JSON.parse(JSON.stringify(initialSeedData.archiveWinners)),
      winnerLookup: JSON.parse(JSON.stringify(initialSeedData.winnerLookup)),
      auditLogs: [],
      fraudIncidents: []
    };
    this.save();
    AuditLogger.info('Database seeded with baseline mock users and verified giveaways.');
  }

  save() {
    try {
      const dir = path.dirname(this.dbPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.dbPath, JSON.stringify(this.state, null, 2), 'utf8');
    } catch (err) {
      AuditLogger.error('Failed to persist database state to disk:', { error: err.message });
    }
  }

  /**
   * Executes an asynchronous operation safely within a sequential mutex lock
   */
  async withLock(operation) {
    const nextLock = this.lockQueue.then(async () => {
      try {
        const result = await operation();
        this.save();
        return result;
      } catch (err) {
        throw err;
      }
    });
    this.lockQueue = nextLock.catch(() => {});
    return nextLock;
  }

  // --- User Methods ---
  getUserById(idOrUserId) {
    if (!idOrUserId) return null;
    return this.state.users.find(u => u.id === idOrUserId || u.userId === idOrUserId || u._id === idOrUserId) || null;
  }

  getUserByEmail(email) {
    if (!email) return null;
    const clean = email.trim().toLowerCase();
    return this.state.users.find(u => u.email.toLowerCase() === clean) || null;
  }

  addUser(user) {
    this.state.users.push(user);
    this.save();
    return user;
  }

  updateUser(idOrUserId, fields) {
    const idx = this.state.users.findIndex(u => u.id === idOrUserId || u.userId === idOrUserId || u._id === idOrUserId);
    if (idx === -1) return null;
    this.state.users[idx] = { ...this.state.users[idx], ...fields };
    this.save();
    return this.state.users[idx];
  }

  // --- Giveaway Methods ---
  getHeroGiveaway() {
    return this.state.heroGiveaway;
  }

  getGiveaways() {
    return this.state.giveaways;
  }

  getGiveawayById(idOrSlug) {
    if (!idOrSlug) return null;
    const clean = idOrSlug.toLowerCase().trim();
    if (this.state.heroGiveaway && (this.state.heroGiveaway.id.toLowerCase() === clean || this.state.heroGiveaway.slug?.toLowerCase() === clean)) {
      return this.state.heroGiveaway;
    }
    return this.state.giveaways.find(g => g.id.toLowerCase() === clean || g.slug?.toLowerCase() === clean) || null;
  }

  updateGiveaway(id, fields) {
    if (this.state.heroGiveaway && this.state.heroGiveaway.id === id) {
      this.state.heroGiveaway = { ...this.state.heroGiveaway, ...fields };
      this.save();
      return this.state.heroGiveaway;
    }
    const idx = this.state.giveaways.findIndex(g => g.id === id);
    if (idx !== -1) {
      this.state.giveaways[idx] = { ...this.state.giveaways[idx], ...fields };
      this.save();
      return this.state.giveaways[idx];
    }
    return null;
  }

  // --- Ticket & Participation Methods ---
  addTicket(ticket) {
    // Database-level compound unique index: unique(userId, giveawayId)
    const duplicate = this.state.tickets.some(
      t => t.userId === ticket.userId && (t.giveawayId === ticket.giveawayId || (ticket.giveawaySlug && t.giveawayId === ticket.giveawaySlug))
    );
    if (duplicate) {
      const err = new Error('E11000 duplicate key error collection: index: userId_1_giveawayId_1 dup key');
      err.code = 11000;
      err.keyPattern = { userId: 1, giveawayId: 1 };
      throw err;
    }
    this.state.tickets.push(ticket);
    this.save();
    return ticket;
  }

  getTicketsByGiveaway(giveawayId) {
    return this.state.tickets.filter(t => t.giveawayId === giveawayId);
  }

  getTicketsByUser(userId) {
    return this.state.tickets.filter(t => t.userId === userId);
  }

  getTicketsByDevice(deviceHash) {
    if (!deviceHash) return [];
    return this.state.tickets.filter(t => t.deviceHash === deviceHash);
  }

  getTicketByDeviceAndGiveaway(deviceHash, giveawayId) {
    if (!deviceHash || !giveawayId) return null;
    const cleanId = giveawayId.toLowerCase().trim();
    return this.state.tickets.find(
      t => t.deviceHash === deviceHash && 
           (t.giveawayId?.toLowerCase() === cleanId || (t.giveawaySlug && t.giveawaySlug.toLowerCase() === cleanId))
    ) || null;
  }

  // --- Transactions ---
  addTransaction(tx) {
    this.state.transactions.push(tx);
    this.save();
    return tx;
  }

  getTransactionById(txId) {
    return this.state.transactions.find(t => t.id === txId || t.transactionId === txId) || null;
  }

  updateTransaction(txId, fields) {
    const idx = this.state.transactions.findIndex(t => t.id === txId || t.transactionId === txId);
    if (idx !== -1) {
      this.state.transactions[idx] = { ...this.state.transactions[idx], ...fields, updatedAt: new Date().toISOString() };
      this.save();
      return this.state.transactions[idx];
    }
    return null;
  }

  getTransactionsByUser(userId) {
    return this.state.transactions.filter(t => t.userId === userId || t.userDbId === userId);
  }

  // --- Idempotency Records ---
  getIdempotencyRecord(key) {
    if (!key) return null;
    if (!this.state.idempotencyRecords) this.state.idempotencyRecords = [];
    return this.state.idempotencyRecords.find(r => r.key === key) || null;
  }

  saveIdempotencyRecord(key, result) {
    if (!key) return null;
    if (!this.state.idempotencyRecords) this.state.idempotencyRecords = [];
    const record = {
      key,
      result,
      createdAt: new Date().toISOString()
    };
    this.state.idempotencyRecords.push(record);
    if (this.state.idempotencyRecords.length > 5000) {
      this.state.idempotencyRecords.shift();
    }
    this.save();
    return record;
  }

  // --- Claims ---
  addClaim(claim) {
    this.state.claims.push(claim);
    this.save();
    return claim;
  }

  getClaimByTicket(ticketId) {
    return this.state.claims.find(c => c.ticketId === ticketId || c.ticket === ticketId);
  }

  getClaimsByUser(userId) {
    return this.state.claims.filter(c => c.userId === userId);
  }

  // --- Winners ---
  getSpotlightWinners() {
    return this.state.spotlightWinners;
  }

  getArchiveWinners() {
    return this.state.archiveWinners;
  }

  addArchiveWinner(winner) {
    const existing = this.state.archiveWinners.find(
      w => w.giveawayId === winner.giveawayId && (
        (w.prizeId && winner.prizeId && w.prizeId === winner.prizeId) ||
        (w.winningTicketId && winner.winningTicketId && w.winningTicketId === winner.winningTicketId) ||
        (w.ticketNumber && winner.ticketNumber && w.ticketNumber === winner.ticketNumber) ||
        (!w.prizeId && !winner.prizeId)
      )
    );
    if (existing) {
      AuditLogger.warn(`Duplicate winner record prevented for giveaway ${winner.giveawayId}`);
      return existing;
    }
    this.state.archiveWinners.unshift(winner);
    this.save();
    return winner;
  }

  getWinnerRecord(userId) {
    return this.state.winnerLookup.find(w => w.userId === userId) || null;
  }

  updateWinnerRecord(userId, fields) {
    const idx = this.state.winnerLookup.findIndex(w => w.userId === userId);
    if (idx !== -1) {
      this.state.winnerLookup[idx] = { ...this.state.winnerLookup[idx], ...fields };
      this.save();
      return this.state.winnerLookup[idx];
    }
    const created = { userId, ...fields };
    this.state.winnerLookup.push(created);
    this.save();
    return created;
  }

  // --- Audit & Fraud Logs ---
  logAudit(event) {
    const entry = {
      id: `audit_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString(),
      ...event
    };
    this.state.auditLogs.unshift(entry);
    if (this.state.auditLogs.length > 2000) {
      this.state.auditLogs.pop();
    }
    this.save();
    return entry;
  }

  logFraudIncident(incident) {
    const entry = {
      id: `fraud_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString(),
      ...incident
    };
    this.state.fraudIncidents.unshift(entry);
    if (this.state.fraudIncidents.length > 1000) {
      this.state.fraudIncidents.pop();
    }
    this.save();
    return entry;
  }

  getAuditLogs(limit = 100) {
    return this.state.auditLogs.slice(0, limit);
  }

  getFraudIncidents(limit = 100) {
    return this.state.fraudIncidents.slice(0, limit);
  }

  // --- Device & Identity Tracking ---
  registerDeviceSession(deviceId, userId, ipAddress, userAgent) {
    if (!deviceId || !userId) return null;
    if (!this.state.deviceRegistry) this.state.deviceRegistry = [];
    const entry = {
      deviceId,
      userId,
      ipAddress,
      userAgent,
      lastSeen: new Date().toISOString()
    };
    const existing = this.state.deviceRegistry.find(d => d.deviceId === deviceId && d.userId === userId);
    if (existing) {
      existing.lastSeen = new Date().toISOString();
      existing.ipAddress = ipAddress;
    } else {
      this.state.deviceRegistry.push(entry);
    }
    this.save();
    return entry;
  }

  getAccountsForDevice(deviceId) {
    if (!deviceId || !this.state.deviceRegistry) return [];
    const accounts = this.state.deviceRegistry.filter(d => d.deviceId === deviceId).map(d => d.userId);
    return Array.from(new Set(accounts));
  }

  recordFailedAttempt(userId, ipAddress, reason) {
    if (!this.state.failedAttempts) this.state.failedAttempts = [];
    this.state.failedAttempts.push({
      userId,
      ipAddress,
      reason,
      timestamp: Date.now()
    });
    if (this.state.failedAttempts.length > 2000) {
      this.state.failedAttempts.shift();
    }
  }

  getFailedAttemptsCount(identifier, windowMs = 300000) {
    if (!this.state.failedAttempts) return 0;
    const cutoff = Date.now() - windowMs;
    return this.state.failedAttempts.filter(
      a => (a.userId === identifier || a.ipAddress === identifier) && a.timestamp >= cutoff
    ).length;
  }
}

export const db = new DataStore();
