import React from 'react';
import { Gift, Coins, Ticket, Volume2, VolumeX, Sparkles, Award, Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';
import styles from './Header.module.css';

export default function Header({
  userState,
  theme = 'dark',
  onToggleTheme,
  onToggleSound,
  onOpenClaim,
  onOpenRules
}) {
  return (
    <header className={styles.header}>
      <div className="container-custom">
        <div className={styles.navRow}>
          {/* Brand Logo */}
          <div className={styles.brand}>
            <div className={styles.logoBadge}>
              <Gift size={22} className={styles.giftIcon} />
            </div>
            <div className={styles.brandText}>
              <span className={styles.brandTitle}>
                VELOOP <span>REWARDS</span>
              </span>
              <span className={styles.brandTagline}>Official Prize Vault & Loyalty Hub</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className={styles.navLinks}>
            <a href="#active-giveaways" className={styles.navLink}>Giveaways</a>
            <a href="#how-it-works" className={styles.navLink}>How It Works</a>
            <a href="#winners-section" className={styles.navLink}>Winners & Proof</a>
            <button onClick={onOpenRules} className={styles.navLinkBtn}>
              <Award size={15} /> Official Rules
            </button>
          </nav>

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

            {/* Coins Counter */}
            <div className={`${styles.statPill} ${styles.coinsPill}`} title="Your VELoop Coins Balance">
              <Coins size={16} className={styles.coinIcon} />
              <span className={styles.statVal}>{userState.coins.toLocaleString()}</span>
              <span className={styles.statUnit}>Coins</span>
            </div>

            {/* Active Tickets Counter */}
            <div className={`${styles.statPill} ${styles.ticketsPill}`} title="Total Active Giveaway Tickets">
              <Ticket size={16} className={styles.ticketIcon} />
              <span className={styles.statVal}>{userState.activeTickets}</span>
              <span className={styles.statUnit}>Tickets</span>
            </div>

            {/* Sound Toggle */}
            <button
              className={styles.soundBtn}
              onClick={onToggleSound}
              title={userState.soundEnabled ? 'Mute Sound FX' : 'Enable Sound FX'}
              aria-label="Toggle sound effects"
            >
              {userState.soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>

            {/* Claim Portal Trigger Button */}
            <motion.button
              className="btn-gold-glow"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => onOpenClaim()}
            >
              <Sparkles size={16} /> Claim Prize
            </motion.button>
          </div>
        </div>
      </div>
    </header>
  );
}
