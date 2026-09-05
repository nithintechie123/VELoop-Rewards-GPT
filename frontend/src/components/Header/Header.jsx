import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Gift,
  Coins,
  Ticket,
  Volume2,
  VolumeX,
  Sparkles,
  Award,
  Sun,
  Moon,
  LogIn,
  UserPlus,
  User,
  ArrowLeft,
  ChevronDown,
  LogOut,
  Zap,
  Users,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { soundFx } from '../../utils/soundFx';
import styles from './Header.module.css';

/**
 * Requirement 55: Visitor State & Logged-In Header
 * Requirement 82: Individual Page Navigation & Clear Back Return
 * Profile Dropdown with user details, balance breakdown, bonus claim, demo switcher, and logout.
 */

export default function Header({
  userState,
  isDetailPage = false,
  theme = 'dark',
  onToggleTheme,
  onToggleSound,
  onOpenClaim,
  onOpenRules,
  onLoginClick
}) {
  const { user, isLoggedIn, logout, switchDemoUser, demoProfiles, claimDailyBonus, openAuthModal } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Effective user values
  const effectiveUser = user || (userState?.isLoggedIn !== false ? userState : null);
  const isVisitor = !isLoggedIn && userState?.isLoggedIn === false;

  const totalCoins = effectiveUser?.coins || effectiveUser?.veloopCoins || 0;
  const activeTicketsCount = effectiveUser?.activeTickets || 0;

  return (
    <header className={styles.header}>
      <div className="container-custom">
        <div className={styles.navRow}>
          {/* Brand Logo & Home Link */}
          <Link to="/" className={styles.brand} title="Return to VELoop Rewards Giveaway Home" onClick={() => soundFx.playClick()}>
            <div className={styles.logoBadge}>
              <Gift size={22} className={styles.giftIcon} />
            </div>
            <div className={styles.brandText}>
              <span className={styles.brandTitle}>
                VELOOP <span>REWARDS</span>
              </span>
              <span className={styles.brandTagline}>Official Prize Vault & Loyalty Hub</span>
            </div>
          </Link>

          {/* Navigation Links or Detail Page Return */}
          {isDetailPage ? (
            <div className={styles.detailNavWrap}>
              <Link to="/" className={styles.homeReturnBtn} aria-label="Return to Giveaway Home" onClick={() => soundFx.playClick()}>
                <ArrowLeft size={16} className={styles.homeReturnIcon} />
                <span className={styles.desktopNavLabel}>Giveaway Home</span>
                <span className={styles.mobileNavLabel}>Giveaway</span>
              </Link>
            </div>
          ) : (
            <nav className={styles.navLinks}>
              <a href="#active-giveaways" className={styles.navLink}>Giveaways</a>
              <a href="#how-it-works" className={styles.navLink}>How It Works</a>
              <a href="#winners-section" className={styles.navLink}>Winners & Proof</a>
              <button onClick={onOpenRules} className={styles.navLinkBtn}>
                <Award size={15} /> Official Rules
              </button>
            </nav>
          )}

          {/* User Rewards Pill & Actions */}
          <div className={styles.userActions}>
            {/* Theme Toggle (Light / Dark) */}
            <motion.button
              className={styles.themeBtn}
              whileTap={{ scale: 0.9, rotate: 30 }}
              onClick={onToggleTheme}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle light/dark theme"
            >
              {theme === 'dark' ? (
                <Sun size={18} className={styles.sunIcon} />
              ) : (
                <Moon size={18} className={styles.moonIcon} />
              )}
            </motion.button>

            {/* If Visitor (Logged-Out) */}
            {isVisitor ? (
              <div className={styles.authBtnGroup}>
                <button
                  className={styles.loginPillBtn}
                  onClick={() => {
                    soundFx.playClick();
                    if (onLoginClick) onLoginClick();
                    else openAuthModal('login');
                  }}
                >
                  <LogIn size={15} /> Login
                </button>
                <button
                  className={styles.registerPillBtn}
                  onClick={() => {
                    soundFx.playClick();
                    if (onLoginClick) onLoginClick();
                    else openAuthModal('signup');
                  }}
                >
                  <UserPlus size={15} /> Register Free
                </button>
              </div>
            ) : (
              <>
                {/* Coins Counter */}
                <div className={`${styles.statPill} ${styles.coinsPill}`} title="Your VELoop Coins Balance">
                  <Coins size={16} className={styles.coinIcon} />
                  <span className={styles.statVal}>{totalCoins.toLocaleString()}</span>
                  <span className={styles.statUnit}>Coins</span>
                </div>

                {/* Active Tickets Counter */}
                <div className={`${styles.statPill} ${styles.ticketsPill}`} title="Total Active Giveaway Tickets">
                  <Ticket size={16} className={styles.ticketIcon} />
                  <span className={styles.statVal}>{activeTicketsCount}</span>
                  <span className={styles.statUnit}>Tickets</span>
                </div>

                {/* Sound Toggle */}
                <button
                  className={styles.soundBtn}
                  onClick={onToggleSound}
                  title={userState?.soundEnabled ? 'Mute Sound FX' : 'Enable Sound FX'}
                  aria-label="Toggle sound effects"
                >
                  {userState?.soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                </button>

                {/* User Profile Dropdown Button */}
                <div className={styles.profileMenuWrapper} ref={dropdownRef}>
                  <motion.button
                    className={`${styles.userProfileBtn} ${isProfileOpen ? styles.userProfileBtnActive : ''}`}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => {
                      soundFx.playClick();
                      setIsProfileOpen(!isProfileOpen);
                    }}
                    aria-label="User profile and wallet menu"
                  >
                    <img
                      src={effectiveUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                      alt={effectiveUser?.fullName || 'User'}
                      className={styles.userAvatar}
                    />
                    <span className={styles.userNameLabel}>{effectiveUser?.fullName?.split(' ')[0] || 'Member'}</span>
                    <ChevronDown size={14} className={`${styles.chevronIcon} ${isProfileOpen ? styles.chevronOpen : ''}`} />
                  </motion.button>

                  {/* Profile Dropdown Menu */}
                  <AnimatePresence>
                    {isProfileOpen && (
                      <motion.div
                        className={styles.profileDropdown}
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ duration: 0.18 }}
                      >
                        {/* Dropdown User Head */}
                        <div className={styles.dropdownHead}>
                          <img
                            src={effectiveUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                            alt={effectiveUser?.fullName || 'User'}
                            className={styles.dropdownAvatar}
                          />
                          <div className={styles.dropdownUserInfo}>
                            <span className={styles.dropdownName}>{effectiveUser?.fullName || 'Alex Thorne'}</span>
                            <span className={styles.dropdownEmail}>{effectiveUser?.email || 'member@veloop.io'}</span>
                            <span className={styles.dropdownTierBadge}>
                              <ShieldCheck size={11} /> {effectiveUser?.tier || 'Diamond VIP'}
                            </span>
                          </div>
                        </div>

                        {/* Balance Details Breakdown */}
                        <div className={styles.dropdownBalanceGrid}>
                          <div className={styles.balanceItem}>
                            <span className={styles.balanceLabel}>VE Coins</span>
                            <span className={styles.balanceVal}>{(effectiveUser?.veloopCoins ?? 850).toLocaleString()}</span>
                          </div>
                          <div className={styles.balanceItem}>
                            <span className={styles.balanceLabel}>SVE Coins</span>
                            <span className={styles.balanceVal}>{(effectiveUser?.sveCoins ?? 1200).toLocaleString()}</span>
                          </div>
                          <div className={styles.balanceItem}>
                            <span className={styles.balanceLabel}>Tokens</span>
                            <span className={styles.balanceVal}>{(effectiveUser?.tokens ?? 4500).toLocaleString()}</span>
                          </div>
                          <div className={styles.balanceItem}>
                            <span className={styles.balanceLabel}>Active Tickets</span>
                            <span className={styles.balanceVal} style={{ color: '#34d399' }}>{activeTicketsCount}</span>
                          </div>
                        </div>

                        {/* Claim Bonus Action */}
                        <button
                          className={styles.bonusBtn}
                          onClick={() => {
                            claimDailyBonus();
                            setIsProfileOpen(false);
                          }}
                        >
                          <Zap size={15} /> Claim +200 VEs Daily Bonus
                        </button>

                        {/* Quick Demo Profile Switchers */}
                        <div className={styles.dropdownActions}>
                          <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700, padding: '0 0.5rem' }}>
                            Switch Demo Profile:
                          </span>
                          {demoProfiles.map((p) => (
                            <button
                              key={p.id}
                              className={styles.dropdownItem}
                              onClick={() => {
                                switchDemoUser(p);
                                setIsProfileOpen(false);
                              }}
                            >
                              <Users size={14} />
                              <span>{p.fullName} ({p.tier.split(' ')[0]})</span>
                            </button>
                          ))}

                          <button
                            className={`${styles.dropdownItem} ${styles.logoutItem}`}
                            onClick={() => {
                              logout();
                              setIsProfileOpen(false);
                            }}
                          >
                            <LogOut size={14} />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
