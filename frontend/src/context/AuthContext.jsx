import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';
import { ConfettiManager } from '../utils/confetti';
import { soundFx } from '../utils/soundFx';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => authService.getCurrentUser());
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [authModalConfig, setAuthModalConfig] = useState({ isOpen: false, mode: 'login', redirectUrl: '/' });

  const isLoggedIn = !!currentUser;
  const user = currentUser;

  // Verify JWT token and hydrate live user session directly from MongoDB Atlas on mount
  useEffect(() => {
    async function syncBackendSession() {
      try {
        const liveUser = await authService.fetchMe();
        if (liveUser) {
          setCurrentUser(liveUser);
        } else {
          setCurrentUser(null);
        }
      } catch (e) {
        console.warn('Session hydration error:', e);
      } finally {
        setIsLoadingSession(false);
      }
    }
    syncBackendSession();
  }, []);

  // Real Login handler with MongoDB Atlas verification
  const login = useCallback(async (email, password, rememberMe = true) => {
    try {
      const loggedUser = await authService.login(email, password, rememberMe);
      setCurrentUser(loggedUser);
      soundFx.playSuccess();
      return { success: true, user: loggedUser };
    } catch (err) {
      soundFx.playError?.() || soundFx.playClick();
      return { success: false, error: err.message, notFound: !!err.notFound, status: err.status };
    }
  }, []);

  // Real Registration handler with MongoDB Atlas creation & welcome bonus
  const register = useCallback(async ({ fullName, email, password, rememberMe = true }) => {
    try {
      const newUser = await authService.register({ fullName, email, password, rememberMe });
      setCurrentUser(newUser);
      soundFx.playWin();
      ConfettiManager.burst(window.innerWidth / 2, window.innerHeight / 2, 80);
      return { success: true, user: newUser };
    } catch (err) {
      soundFx.playError?.() || soundFx.playClick();
      return { success: false, error: err.message };
    }
  }, []);

  // Instant Demo Login (for reviewer convenience)
  const loginWithDemo = useCallback((demoUser = {}) => {
    const userToSet = {
      userId: demoUser.userId || 'VE10025',
      id: demoUser.userId || 'VE10025',
      fullName: demoUser.name || demoUser.fullName || 'Alex Thorne',
      name: demoUser.name || demoUser.fullName || 'Alex Thorne',
      email: demoUser.email || 'alex.thorne@example.com',
      veloopCoins: demoUser.coins ?? 1250,
      coins: demoUser.coins ?? 1250,
      sveCoins: demoUser.sveCoins ?? 500,
      tokens: demoUser.tokens ?? 1000,
      activeTickets: demoUser.activeTickets ?? 24,
      userEntries: demoUser.userEntries || { 'GW-2026-08': { tickets: 24 } }
    };
    authService.setCurrentUser(userToSet, true, 'demo-token-jwt-veloop');
    try {
      localStorage.setItem('veloop_user_state', JSON.stringify({
        ...userToSet,
        isLoggedIn: true
      }));
      localStorage.setItem('veloop_current_user_id', userToSet.userId);
    } catch (e) {}
    setCurrentUser(userToSet);
    soundFx.playSuccess();
    ConfettiManager.burst(window.innerWidth / 2, window.innerHeight / 2, 70);
    return userToSet;
  }, []);

  // Real Logout handler
  const logout = useCallback(async () => {
    await authService.logout();
    try {
      localStorage.removeItem('veloop_auth_current_user');
      localStorage.removeItem('veloop_auth_token');
      localStorage.removeItem('veloop_user_state');
    } catch (e) {}
    setCurrentUser(null);
    soundFx.playClick();
  }, []);

  // Update live user fields (e.g. shipping address, local balance cache)
  const updateUser = useCallback(async (updatedFields) => {
    if (!currentUser) return null;
    const updated = await authService.updateCurrentUser(updatedFields);
    setCurrentUser(updated);
    return updated;
  }, [currentUser]);

  // Daily bonus claim
  const claimDailyBonus = useCallback(() => {
    if (!currentUser) return;
    const bonusVEs = 200;
    const bonusTokens = 500;
    const updated = {
      ...currentUser,
      veloopCoins: (currentUser.veloopCoins || 0) + bonusVEs,
      tokens: (currentUser.tokens || 0) + bonusTokens,
      coins: (currentUser.coins || 0) + bonusVEs
    };
    authService.updateCurrentUser(updated);
    setCurrentUser(updated);
    soundFx.playWin();
    ConfettiManager.burst(window.innerWidth / 2, window.innerHeight / 3, 50);
    return updated;
  }, [currentUser]);

  // Open interactive Auth Modal
  const openAuthModal = useCallback((mode = 'login', redirectUrl = '/') => {
    setAuthModalConfig({ isOpen: true, mode, redirectUrl });
    soundFx.playClick();
  }, []);

  // Close Auth Modal
  const closeAuthModal = useCallback(() => {
    setAuthModalConfig(prev => ({ ...prev, isOpen: false }));
  }, []);

  const value = {
    user,
    currentUser,
    isLoggedIn,
    isLoadingSession,
    authModalConfig,
    login,
    register,
    loginWithDemo,
    logout,
    updateUser,
    claimDailyBonus,
    openAuthModal,
    closeAuthModal,
    demoProfiles: []
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
