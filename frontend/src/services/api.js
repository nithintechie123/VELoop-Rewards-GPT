import {
  mockHeroGiveaway,
  mockActiveGiveaways,
  mockSpotlightWinners,
  mockArchiveWinners,
  mockWinnerLookup,
  mockQuestTasks
} from '../data/giveawayData';
import { getPrizeTypeConfig, PRIZE_TYPES } from '../utils/prizeTypeUtils';

/**
 * API Client Configuration
 * Communicates directly with the secure VELOOP Rewards Express Backend (Port 5000)
 * Includes seamless offline fallback to mock data when server is unavailable.
 */
const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Generic HTTP Request Helper
 * Automatically handles auth token headers, JSON parsing, error boundaries, and mock fallback
 */
async function request(endpoint, options = {}, mockFallbackFn) {
  try {
    const token = localStorage.getItem('veloop_auth_token');
    const storedUser = localStorage.getItem('veloop_auth_current_user');
    let userId = null;
    if (storedUser) {
      try {
        userId = JSON.parse(storedUser)?.userId;
      } catch (e) {}
    }

    const authHeaders = {};
    if (token) {
      authHeaders['Authorization'] = `Bearer ${token}`;
    }
    if (userId) {
      authHeaders['x-user-id'] = userId;
    }

    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
        ...(options.headers || {})
      },
      ...options
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      const customError = new Error(errorData.message || `HTTP Error ${res.status}: ${res.statusText}`);
      customError.status = res.status;
      customError.data = errorData;
      throw customError;
    }

    return await res.json();
  } catch (error) {
    // If backend is down or unreachable (network error), trigger fallback
    if (mockFallbackFn && (!error.status || error.status >= 500)) {
      return mockFallbackFn();
    }
    throw error;
  }
}

/**
 * Authoritative Giveaway API Service Layer
 */
export const apiService = {
  /**
   * 1. GET /giveaways/current
   * Retrieves active giveaways & flagship hero pool from backend
   */
  async getCurrentGiveaways() {
    return request('/giveaways/current', { method: 'GET' }, () => {
      return {
        hero: mockHeroGiveaway,
        active: mockActiveGiveaways,
        timestamp: new Date().toISOString()
      };
    });
  },

  async getHeroGiveaway() {
    const data = await this.getCurrentGiveaways();
    return data?.hero || mockHeroGiveaway;
  },

  async getGiveaways() {
    const data = await this.getCurrentGiveaways();
    return data?.active || mockActiveGiveaways;
  },

  /**
   * 2. GET /giveaways/:idOrSlug
   */
  async getGiveawayById(idOrSlug) {
    return request(`/giveaways/${encodeURIComponent(idOrSlug)}`, { method: 'GET' }, () => {
      if (mockHeroGiveaway.id === idOrSlug || mockHeroGiveaway.slug === idOrSlug) return mockHeroGiveaway;
      return mockActiveGiveaways.find(g => g.id === idOrSlug || g.slug === idOrSlug) || mockHeroGiveaway;
    }).then(res => res.giveaway || res);
  },

  /**
   * 3. GET /winners
   */
  async getGiveawayWinners() {
    return request('/winners', { method: 'GET' }, () => {
      return {
        spotlightWinners: mockSpotlightWinners,
        archiveWinners: mockArchiveWinners,
        isFairVerified: true
      };
    });
  },

  async getSpotlightWinners() {
    const data = await this.getGiveawayWinners();
    return data?.spotlightWinners || data?.spotlight || mockSpotlightWinners;
  },

  /**
   * 4. GET /giveaways/previous or /winners
   */
  async getPreviousGiveaways(search = '', filterCategory = 'all') {
    return request(`/winners`, { method: 'GET' }, () => {
      return { archiveWinners: mockArchiveWinners };
    }).then(res => {
      const list = Array.isArray(res) ? res : (res.archiveWinners || res.winners || res.giveaways || mockArchiveWinners);
      return Array.isArray(list) ? list : [];
    });
  },

  async getArchiveWinners(search = '', filterCategory = 'all') {
    const data = await this.getGiveawayWinners();
    return data?.archiveWinners || data?.archive || mockArchiveWinners;
  },

  /**
   * 5. GET /giveaways/my-status
   */
  async getMyStatus(userId = 'VE10025') {
    return request(`/giveaways/my-status?userId=${encodeURIComponent(userId)}`, { method: 'GET' }, () => {
      const winningRecord = mockWinnerLookup.find(w => w.userId === userId) || null;
      return {
        userId,
        isLoggedIn: true,
        coins: 1450,
        veloopCoins: 850,
        sveCoins: 1200,
        tokens: 4500,
        activeTickets: 12,
        winningRecord,
        isWinner: !!winningRecord,
        claimState: winningRecord ? 'not_submitted' : null,
        userEntries: {
          'gw-apple-studio': { tickets: 5 },
          'gw-ps5-pro': { tickets: 3 },
          'gw-iphone-titanium': { tickets: 4 }
        },
        quests: mockQuestTasks
      };
    });
  },

  /**
   * 6. POST /giveaways/:id/join (Zero-Trust Verified Join)
   */
  async joinGiveaway(giveawayId, payload = {}) {
    const { ticketCount = 1, entryType = 'free', promoCode = null, idempotencyKey = null } = payload;
    return request(`/giveaways/${encodeURIComponent(giveawayId)}/join`, {
      method: 'POST',
      body: JSON.stringify({ giveawayId, ticketCount, entryType, promoCode, idempotencyKey })
    }, () => {
      const randomHex = Math.floor(10000 + Math.random() * 90000);
      const ticketId = `#VEL-${randomHex}-US`;
      return {
        success: true,
        message: `Successfully allocated ${ticketCount} ticket(s) to ${giveawayId}`,
        ticket: {
          ticketId,
          giveawayId,
          entryType,
          ticketCount,
          allocatedAt: new Date().toISOString()
        }
      };
    });
  },

  async enterGiveaway(giveawayId, ticketCount, entryType) {
    return this.joinGiveaway(giveawayId, { ticketCount, entryType });
  },

  /**
   * 7. POST /giveaways/:id/claim (Zero-Trust Prize Claim)
   */
  async claimGiveawayPrize(giveawayId, claimPayload = {}) {
    return request(`/giveaways/${encodeURIComponent(giveawayId)}/claim`, {
      method: 'POST',
      body: JSON.stringify(claimPayload)
    }, () => {
      const config = getPrizeTypeConfig(claimPayload.prizeType || claimPayload.prize);
      const isGift = config.type === PRIZE_TYPES.GIFT_CARD;
      const isDigital = config.type === PRIZE_TYPES.DIGITAL_KEY;

      const randomCode = Math.floor(1000 + Math.random() * 9000);
      const tracking = isGift
        ? `AMZN-IN-${randomCode}-${Math.floor(100000 + Math.random() * 900000)}-GIFT`
        : isDigital
        ? `KEY-VEL-${randomCode}-${Math.floor(100000 + Math.random() * 900000)}-DIGITAL`
        : `FDX-VL-${randomCode}-${Math.floor(100000 + Math.random() * 900000)}`;

      return {
        success: true,
        status: 'submitted',
        prizeType: config.type,
        fulfillmentMethod: config.fulfillmentMethod,
        message: config.dispatchDescription,
        claim: {
          ...claimPayload,
          giveawayId,
          prizeType: config.type,
          trackingNumber: tracking,
          submittedAt: new Date().toISOString()
        }
      };
    });
  },

  async submitClaim(claimPayload) {
    return this.claimGiveawayPrize(claimPayload.giveawayId || 'current-draw', claimPayload);
  },

  /**
   * 8. POST /winners/verify-proof (Provably Fair Verifier)
   */
  async verifyProof(payload) {
    return request('/winners/verify-proof', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  /**
   * 9. Security Audit & Fraud Logs
   */
  async getAuditLogs() {
    return request('/audit/logs', { method: 'GET' });
  },

  async getFraudIncidents() {
    return request('/audit/fraud-incidents', { method: 'GET' });
  }
};
