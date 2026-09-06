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
      fraudIncidents: []
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

  // --- Transactions ---
  addTransaction(tx) {
    this.state.transactions.push(tx);
    this.save();
    return tx;
  }

  getTransactionsByUser(userId) {
    return this.state.transactions.filter(t => t.userId === userId);
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
    return null;
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
}

export const db = new DataStore();
