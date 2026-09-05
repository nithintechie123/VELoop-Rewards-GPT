import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';
import { ConfettiManager } from '../utils/confetti';
import { soundFx } from '../utils/soundFx';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => authService.getCurrentUser());
  const [isVisitorMode, setIsVisitorMode] = useState(false); // Can be toggled to simulate logged-out visitor
  const [authModalConfig, setAuthModalConfig] = useState({ isOpen: false, mode: 'login', redirectUrl: '/' });

  // Synced user state object
  const user = isVisitorMode ? null : currentUser;
  const isLoggedIn = !!user;

  // Login handler
  const login = useCallback(async (email, password, rememberMe = true) => {
    try {
      const loggedUser = authService.login(email, password, rememberMe);
      setCurrentUser(loggedUser);
      setIsVisitorMode(false);
      soundFx.playSuccess();
      return { success: true, user: loggedUser };
    } catch (err) {
      soundFx.playError?.() || soundFx.playClick();
      return { success: false, error: err.message };
    }
  }, []);

  // Register handler
  const register = useCallback(async ({ fullName, email, password, rememberMe = true }) => {
    try {
      const newUser = authService.register({ fullName, email, password, rememberMe });
      setCurrentUser(newUser);
      setIsVisitorMode(false);
      soundFx.playWin();
      ConfettiManager.burst(window.innerWidth / 2, window.innerHeight / 2, 80);
      return { success: true, user: newUser };
    } catch (err) {
      soundFx.playError?.() || soundFx.playClick();
      return { success: false, error: err.message };
    }
  }, []);

  // Logout handler
  const logout = useCallback(() => {
    authService.logout();
    setCurrentUser(null);
    setIsVisitorMode(true);
    soundFx.playClick();
  }, []);

  // Switch to specific demo user
  const switchDemoUser = useCallback((demoUser) => {
    if (!demoUser) {
      // Toggle visitor mode
      setIsVisitorMode(true);
      setCurrentUser(null);
    } else {
      setIsVisitorMode(false);
      authService.setCurrentUser(demoUser);
      setCurrentUser(demoUser);
    }
    soundFx.playClick();
  }, []);

  // Toggle visitor simulation mode
  const toggleVisitorMode = useCallback(() => {
    setIsVisitorMode(prev => {
      const next = !prev;
      if (!next && !currentUser) {
        const defaultUser = authService.getDemoProfiles()[0];
        authService.setCurrentUser(defaultUser);
        setCurrentUser(defaultUser);
      }
      return next;
    });
    soundFx.playClick();
  }, [currentUser]);

  // Update user balances or entries
  const updateUser = useCallback((updatedFields) => {
    if (!currentUser) return null;
    const updated = authService.updateCurrentUser(updatedFields);
    setCurrentUser(updated);
    return updated;
  }, [currentUser]);

  // Quick Daily / Top-up Bonus claim
  const claimDailyBonus = useCallback(() => {
    if (!currentUser) return;
    const bonusVEs = 200;
    const bonusTokens = 500;
    const updated = authService.updateCurrentUser({
      veloopCoins: (currentUser.veloopCoins || 0) + bonusVEs,
      tokens: (currentUser.tokens || 0) + bonusTokens,
      coins: (currentUser.coins || 0) + bonusVEs
    });
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
    isLoggedIn,
    isVisitorMode,
    demoProfiles: authService.getDemoProfiles(),
    authModalConfig,
    login,
    register,
    logout,
    switchDemoUser,
    toggleVisitorMode,
    updateUser,
    claimDailyBonus,
    openAuthModal,
    closeAuthModal
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
