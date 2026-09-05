/**
 * Authentication Service (Local Storage Persistent Store)
 * Manages user accounts, credentials, session tokens, and default profiles.
 */

const USERS_STORAGE_KEY = 'veloop_auth_users';
const CURRENT_USER_KEY = 'veloop_auth_current_user';
const REMEMBER_ME_KEY = 'veloop_auth_remember_me';

// Default Demo Accounts
const DEFAULT_DEMO_USERS = [
  {
    id: 'usr_alex_01',
    userId: 'VE10025',
    email: 'alex.thorne@veloop.io',
    password: 'password123',
    fullName: 'Alex Thorne',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    tier: 'Diamond VIP',
    coins: 1450,
    veloopCoins: 850,
    sveCoins: 1200,
    tokens: 4500,
    activeTickets: 8,
    userEntries: {
      'gw-iphone-titanium': 2,
      'gw-smartwatch-titanium': 1,
      'gw-audio-airpods': 3,
      'gw-gift-card-2000': 1,
      'gw-gift-card-20': 1
    },
    shippingAddress: {
      fullName: 'Alex Thorne',
      phone: '+91 98765 43210',
      addressLine1: 'Flat 402, Skyline Luxury Towers',
      addressLine2: 'Indiranagar 100ft Road',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560038'
    },
    joinedDate: '2026-01-15'
  },
  {
    id: 'usr_sarah_02',
    userId: 'VE10042',
    email: 'sarah.lin@veloop.io',
    password: 'password123',
    fullName: 'Sarah Lin',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    tier: 'Gold Member',
    coins: 650,
    veloopCoins: 500,
    sveCoins: 600,
    tokens: 2000,
    activeTickets: 2,
    userEntries: {
      'gw-gift-card-500': 1,
      'gw-audio-airpods': 1
    },
    shippingAddress: {
      fullName: 'Sarah Lin',
      phone: '+91 91234 56789',
      addressLine1: '32 Park Street, Apex Residency',
      addressLine2: 'Bandra West',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400050'
    },
    joinedDate: '2026-03-01'
  }
];

export const authService = {
  // Get all registered users
  getUsers() {
    try {
      const stored = localStorage.getItem(USERS_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to load users from localStorage:', e);
    }
    // Initialize default demo accounts
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(DEFAULT_DEMO_USERS));
    return DEFAULT_DEMO_USERS;
  },

  // Save users array
  saveUsers(users) {
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    } catch (e) {
      console.error('Failed to save users:', e);
    }
  },

  // Get currently active session user
  getCurrentUser() {
    try {
      const stored = localStorage.getItem(CURRENT_USER_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to parse current user session:', e);
    }
    // Default to the primary demo user if not explicitly logged out
    const defaultUser = DEFAULT_DEMO_USERS[0];
    return defaultUser;
  },

  // Set current user
  setCurrentUser(user, rememberMe = true) {
    try {
      if (user) {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
        localStorage.setItem(REMEMBER_ME_KEY, rememberMe ? 'true' : 'false');
      } else {
        localStorage.removeItem(CURRENT_USER_KEY);
      }
    } catch (e) {
      console.error('Failed to set current user:', e);
    }
  },

  // Authenticate user
  login(email, password, rememberMe = true) {
    const users = this.getUsers();
    const cleanEmail = email.trim().toLowerCase();
    const user = users.find(u => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      throw new Error('No account found with this email address.');
    }

    if (user.password && user.password !== password) {
      throw new Error('Incorrect password. Please try again.');
    }

    this.setCurrentUser(user, rememberMe);
    return user;
  },

  // Register new user with welcome bonus
  register({ fullName, email, password, rememberMe = true }) {
    const users = this.getUsers();
    const cleanEmail = email.trim().toLowerCase();

    if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
      throw new Error('An account with this email address already exists.');
    }

    const newUser = {
      id: `usr_${Date.now()}`,
      userId: `VE${Math.floor(10000 + Math.random() * 90000)}`,
      email: cleanEmail,
      password: password,
      fullName: fullName.trim(),
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(fullName)}`,
      tier: 'Silver Member',
      coins: 1000,
      veloopCoins: 500, // Welcome bonus
      sveCoins: 500,   // Welcome bonus
      tokens: 2000,    // Welcome bonus
      activeTickets: 0,
      userEntries: {},
      shippingAddress: {
        fullName: fullName.trim(),
        phone: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        pincode: ''
      },
      joinedDate: new Date().toISOString().split('T')[0]
    };

    const updatedUsers = [...users, newUser];
    this.saveUsers(updatedUsers);
    this.setCurrentUser(newUser, rememberMe);
    return newUser;
  },

  // Update current user profile / balances
  updateCurrentUser(updatedFields) {
    const current = this.getCurrentUser();
    if (!current) return null;

    const updatedUser = { ...current, ...updatedFields };
    const users = this.getUsers();
    const updatedUsers = users.map(u => u.id === current.id ? updatedUser : u);

    this.saveUsers(updatedUsers);
    this.setCurrentUser(updatedUser);
    return updatedUser;
  },

  // Logout
  logout() {
    try {
      localStorage.removeItem(CURRENT_USER_KEY);
    } catch (e) {
      console.error('Failed to logout:', e);
    }
  },

  // Demo user profiles
  getDemoProfiles() {
    return DEFAULT_DEMO_USERS;
  }
};
