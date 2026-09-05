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
 * Allows dynamic configuration via Vite environment variables (e.g., VITE_API_BASE_URL)
 * Supports seamless fallback to mock data when backend is not actively connected.
 */
const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Generic HTTP Request Helper
 * Automatically handles JSON parsing, error boundaries, and mock fallback
 */
async function request(endpoint, options = {}, mockFallbackFn) {
  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      ...options
    });

    if (!res.ok) {
      throw new Error(`HTTP Error ${res.status}: ${res.statusText}`);
    }

    return await res.json();
  } catch (error) {
    // In dev / mock mode, invoke fallback provider
    if (mockFallbackFn) {
      return mockFallbackFn();
    }
    throw error;
  }
}

/**
 * Standard Giveaway API Service Layer
 * Fully decoupled architecture designed to consume:
 * - GET  /giveaways/current
 * - GET  /giveaways/:id
 * - GET  /giveaways/:id/winners
 * - GET  /giveaways/previous
 * - GET  /giveaways/my-status
 * - POST /giveaways/:id/join
 * - POST /giveaways/:id/claim
 */
export const apiService = {
  /**
   * 1. GET /giveaways/current
   * Retrieves the current flagship and active giveaways with real-time pools & countdowns
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

  /**
   * Helper alias for hero giveaway
   */
  async getHeroGiveaway() {
    const data = await this.getCurrentGiveaways();
    return data?.hero || mockHeroGiveaway;
  },

  /**
   * Helper alias for active giveaways list
   */
  async getGiveaways() {
    const data = await this.getCurrentGiveaways();
    return data?.active || mockActiveGiveaways;
  },

  /**
   * 2. GET /giveaways/:id
   * Retrieves a single giveaway by its unique identifier
   */
  async getGiveawayById(id) {
    return request(`/giveaways/${id}`, { method: 'GET' }, () => {
      if (mockHeroGiveaway.id === id) return mockHeroGiveaway;
      return mockActiveGiveaways.find(g => g.id === id) || mockHeroGiveaway;
    });
  },

  /**
   * 3. GET /giveaways/:id/winners
   * Retrieves spotlight and verified winners for a specific giveaway or recent draws
   */
  async getGiveawayWinners(giveawayId = 'current') {
    return request(`/giveaways/${giveawayId}/winners`, { method: 'GET' }, () => {
      return {
        spotlight: mockSpotlightWinners,
        totalWinnersAnnounced: mockSpotlightWinners.length + mockArchiveWinners.length,
        isFairVerified: true
      };
    });
  },

  async getSpotlightWinners() {
    const data = await this.getGiveawayWinners();
    return data?.spotlight || mockSpotlightWinners;
  },

  /**
   * 4. GET /giveaways/previous
   * Retrieves historical completed giveaways and archived winner records
   */
  async getPreviousGiveaways(search = '', filterCategory = 'all') {
    return request(`/giveaways/previous?search=${encodeURIComponent(search)}&category=${encodeURIComponent(filterCategory)}`, { method: 'GET' }, () => {
      let results = [...mockArchiveWinners];
      if (search.trim()) {
        const q = search.toLowerCase();
        results = results.filter(item =>
          item.user.toLowerCase().includes(q) ||
          item.prize.toLowerCase().includes(q) ||
          item.ticket.toLowerCase().includes(q) ||
          item.giveawayName.toLowerCase().includes(q)
        );
      }
      if (filterCategory && filterCategory !== 'all') {
        results = results.filter(item =>
          item.category?.toLowerCase() === filterCategory.toLowerCase()
        );
      }
      return results;
    });
  },

  async getArchiveWinners(search = '', filterCategory = 'all') {
    return this.getPreviousGiveaways(search, filterCategory);
  },

  /**
   * 5. GET /giveaways/my-status
   * Retrieves the current user's authenticated tickets, coin balance, and winning eligibility
   */
  async getMyStatus(userId = 'VE10025') {
    return request(`/giveaways/my-status?userId=${encodeURIComponent(userId)}`, { method: 'GET' }, () => {
      const winningRecord = mockWinnerLookup.find(w => w.userId === userId) || null;
      return {
        userId,
        isLoggedIn: true,
        coins: 1450,
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
   * 6. POST /giveaways/:id/join
   * Submits a free ticket entry, coin booster entry, or promo code entry
   */
  async joinGiveaway(giveawayId, payload = {}) {
    const { ticketCount = 1, entryType = 'free', promoCode = null } = payload;
    return request(`/giveaways/${giveawayId}/join`, {
      method: 'POST',
      body: JSON.stringify({ giveawayId, ticketCount, entryType, promoCode })
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

  // Alias helper for UI components
  async enterGiveaway(giveawayId, ticketCount, entryType) {
    return this.joinGiveaway(giveawayId, { ticketCount, entryType });
  },

  /**
   * 7. POST /giveaways/:id/claim (Requirement 69)
   * Submits physical or digital winner claim details for verification & fulfillment
   */
  async claimGiveawayPrize(giveawayId, claimPayload = {}) {
    return request(`/giveaways/${giveawayId}/claim`, {
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

  // Alias helper for UI components
  async submitClaim(claimPayload) {
    return this.claimGiveawayPrize(claimPayload.giveawayId || 'current-draw', claimPayload);
  }
};
