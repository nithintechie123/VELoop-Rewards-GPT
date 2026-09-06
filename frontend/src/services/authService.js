/**
 * Real Authentication Service
 * Communicates directly with the VELOOP Rewards Express Backend & MongoDB Atlas.
 * Stores JWT Bearer tokens and live user session credentials.
 */

const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:5000/api';
const CURRENT_USER_KEY = 'veloop_auth_current_user';
const TOKEN_KEY = 'veloop_auth_token';
const REFRESH_TOKEN_KEY = 'veloop_auth_refresh_token';
const REMEMBER_ME_KEY = 'veloop_auth_remember_me';

export const authService = {
  API_BASE_URL,

  // Get currently active session user from localStorage (null if unauthenticated)
  getCurrentUser() {
    try {
      const stored = localStorage.getItem(CURRENT_USER_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to parse current user session:', e);
    }
    return null;
  },

  // Set current user session & JWT token
  setCurrentUser(user, rememberMe = true, token = null, refreshToken = null) {
    try {
      if (user) {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
        localStorage.setItem(REMEMBER_ME_KEY, rememberMe ? 'true' : 'false');
        if (token) {
          localStorage.setItem(TOKEN_KEY, token);
        }
        if (refreshToken) {
          localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
        }
      } else {
        localStorage.removeItem(CURRENT_USER_KEY);
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
      }
    } catch (e) {
      console.error('Failed to set current user:', e);
    }
  },

  // Authenticate user with MongoDB Atlas via backend API
  async login(email, password, rememberMe = true) {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim(), password })
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const err = new Error(data.message || 'Login failed. Please check your credentials.');
      err.status = res.status;
      err.error = data.error;
      err.notFound = data.notFound || data.error === 'USER_NOT_FOUND' || res.status === 404;
      throw err;
    }

    const liveUser = data.user || data;
    const token = data.accessToken || data.token;
    const refreshToken = data.refreshToken;

    this.setCurrentUser(liveUser, rememberMe, token, refreshToken);
    return liveUser;
  },

  // Register new real user in MongoDB Atlas via backend API
  async register({ fullName, email, password, rememberMe = true }) {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: fullName.trim(),
        name: fullName.trim(),
        email: email.trim().toLowerCase(),
        password
      })
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.message || 'Registration failed. Please try again.');
    }

    const liveUser = data.user || data;
    const token = data.accessToken || data.token;
    const refreshToken = data.refreshToken;

    this.setCurrentUser(liveUser, rememberMe, token, refreshToken);
    return liveUser;
  },

  // Fetch current live profile from MongoDB Atlas using JWT Bearer token
  async fetchMe() {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return null;

    try {
      const res = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        const data = await res.json();
        const liveUser = data.user || data;
        this.setCurrentUser(liveUser, true, token);
        return liveUser;
      } else if (res.status === 401) {
        // Token expired - attempt refresh or logout
        this.logout();
        return null;
      }
    } catch (e) {
      console.warn('Live session sync failed:', e);
    }
    return this.getCurrentUser();
  },

  // Update current user profile / shipping address in backend
  async updateCurrentUser(updatedFields) {
    const current = this.getCurrentUser();
    if (!current) return null;

    const token = localStorage.getItem(TOKEN_KEY);
    const updatedUser = { ...current, ...updatedFields };
    this.setCurrentUser(updatedUser);

    if (token) {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/profile`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(updatedFields)
        });
        if (res.ok) {
          const data = await res.json();
          const serverUser = data.user || data;
          this.setCurrentUser(serverUser, true, token);
          return serverUser;
        }
      } catch (e) {
        console.warn('Async profile update warning:', e);
      }
    }

    return updatedUser;
  },

  // Logout session
  async logout() {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      if (token) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        }).catch(() => {});
      }
    } finally {
      localStorage.removeItem(CURRENT_USER_KEY);
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(REMEMBER_ME_KEY);
    }
  },

  // Helper for demo profiles (empty array now that demo users are removed)
  getDemoProfiles() {
    return [];
  }
};
