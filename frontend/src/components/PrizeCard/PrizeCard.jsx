import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Users, Ticket, Info, Sparkles, Trophy, ArrowRight } from 'lucide-react';
import Countdown from '../Countdown/Countdown';
import { soundFx } from '../../utils/soundFx';
import styles from './PrizeCard.module.css';

/**
 * Requirement 48: Interactive Reward Cards
 * Interactive responses for:
 * - Hover (subtle elevation, border glow, image movement, shadow expansion)
 * - Focus (accessible outline, focused elevation, keyboard trigger)
 * - Click (tactile scale feedback, sound FX)
 * - Join (primary entry trigger)
 * - View Details (modal trigger via image, title, or info button)
 */

export default function PrizeCard({ giveaway, userEntryCount = 0, onEnter, onViewDetails }) {
  if (!giveaway) return null;

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y });
  };

  const handleCardKeyDown = (e) => {
    if (e.key === 'Enter') {
      soundFx.playClick();
      if (onViewDetails) onViewDetails(giveaway);
    }
  };

  const handleJoinClick = (e) => {
    e.stopPropagation();
    soundFx.playClick();
    if (onEnter) onEnter(giveaway.slug || giveaway.id, giveaway);
  };

  const handleDetailsClick = (e) => {
    e.stopPropagation();
    soundFx.playClick();
    if (onViewDetails) onViewDetails(giveaway);
  };

  const winnerLabel = giveaway.winnerLabel || (giveaway.winnerCount ? `${giveaway.winnerCount} Winner${giveaway.winnerCount > 1 ? 's' : ''}` : '1 Winner');

  return (
    <motion.div
      className={styles.card}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -6, transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] } }}
      whileTap={{ scale: 0.99 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onKeyDown={handleCardKeyDown}
      tabIndex={0}
      role="article"
      aria-label={`${giveaway.title} - Retail Value ₹${giveaway.valueUSD.toLocaleString('en-IN')} - ${winnerLabel}. Press Enter to view full details.`}
    >
      {/* Dynamic Cursor Spotlight Glow */}
      {isHovered && (
        <div
          className={styles.cardSpotlight}
          style={{ left: `${mousePos.x}px`, top: `${mousePos.y}px` }}
        />
      )}

      {/* Card Media Wrapper (Clickable for View Details) */}
      <div
        className={`${styles.mediaWrap} ${styles[`theme_${giveaway.accentTheme || 'emerald'}`]}`}
        onClick={handleDetailsClick}
        title={`View full details for ${giveaway.title}`}
      >
        <motion.img
          src={giveaway.image}
          alt={giveaway.title}
          className={styles.mediaImg}
          loading="lazy"
          decoding="async"
          animate={{ scale: isHovered ? 1.05 : 1, y: isHovered ? -3 : 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
        />
        <div className={styles.mediaOverlay}></div>

        {/* Top Badges */}
        <div className={styles.topBadges}>
          {giveaway.prizeTier ? (
            <span className={`${styles.prizeTierBadge} ${styles[`tier_${giveaway.accentTheme || 'purple'}`]}`}>
              {giveaway.prizeTier}
            </span>
          ) : null}

          <span className={styles.winnerCountBadge}>
            <Trophy size={11} className={styles.trophyIcon} />
            {winnerLabel}
          </span>

          <span className={styles.valueTag}>
            ₹{giveaway.valueUSD.toLocaleString('en-IN')}
          </span>
        </div>

        {/* User Active Tickets Indicator */}
        <div className={styles.userStatusRow}>
          {userEntryCount > 0 ? (
            <motion.span
              className={styles.ticketPillActive}
              initial={{ scale: 0.85 }}
              animate={{ scale: 1 }}
            >
              <Ticket size={12} /> You're Participating ✓ (Your Entries: {userEntryCount})
            </motion.span>
          ) : (
            <span className={styles.ticketPillEmpty}>
              <Sparkles size={12} /> Free Entry Open
            </span>
          )}

          <span className={styles.categoryTag}>{giveaway.category}</span>
        </div>
      </div>

      {/* Card Content Body */}
      <div className={styles.body}>
        <div className={styles.titleGroup}>
          <h3 className={styles.cardTitle} onClick={handleDetailsClick}>
            {giveaway.title}
          </h3>
          <p className={styles.cardDesc}>{giveaway.subtitle || giveaway.desc}</p>
        </div>

        {/* Meta Stats Row (Time Remaining & Entries) */}
        <div className={styles.metaRow}>
          {giveaway.status === 'ended' ? (
            <>
              <div className={styles.metaBox}>
                <span className={styles.metaLabel}>STATUS</span>
                <span className={styles.endedStatusText}>🏆 Ended</span>
              </div>
              <div className={styles.metaBoxRight}>
                <span className={styles.metaLabel}>VERIFIED WINNER</span>
                <span className={styles.metaValWinner}>{giveaway.winnerName || 'Winner Declared'}</span>
              </div>
            </>
          ) : giveaway.status === 'upcoming' ? (
            <>
              <div className={styles.metaBox}>
                <span className={styles.metaLabel}>STARTS IN</span>
                <span className={styles.upcomingStatusText}>⏳ {giveaway.startsIn || '3 Days'}</span>
              </div>
              <div className={styles.metaBoxRight}>
                <span className={styles.metaLabel}>PRE-REGISTERED</span>
                <span className={styles.metaVal}>
                  <Users size={13} className={styles.iconMuted} />
                  {(giveaway.totalParticipants || 450).toLocaleString()} Users
                </span>
              </div>
            </>
          ) : (
            <>
              <div className={styles.metaBox}>
                <span className={styles.metaLabel}>REMAINING TIME</span>
                <Countdown targetDate={giveaway.endsAt} compact={true} />
              </div>

              <div className={styles.metaBoxRight}>
                <span className={styles.metaLabel}>{userEntryCount > 0 ? 'YOUR ENTRIES' : 'PARTICIPANTS'}</span>
                <span className={styles.metaVal}>
                  {userEntryCount > 0 ? (
                    <strong style={{ color: '#34d399' }}>{userEntryCount} Entries</strong>
                  ) : (
                    <>
                      <Users size={13} className={styles.iconMuted} />
                      {(giveaway.totalParticipants || 1200).toLocaleString()} Users
                    </>
                  )}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Entry Requirement Tag */}
        <div className={styles.requirementRow}>
          <span className={styles.requirementText}>
            <Sparkles size={12} className={styles.sparkleIcon} />
            {giveaway.status === 'upcoming'
              ? 'VIP Pre-Registration Open (Zero Cost)'
              : userEntryCount > 0
              ? `You're Participating ✓ (${userEntryCount} Active Tickets)`
              : '1 Free Entry Daily • No Purchase Necessary'}
          </span>
        </div>

        {/* Interactive Action Buttons */}
        <div className={styles.actionsRow}>
          {giveaway.status === 'ended' ? (
            <motion.button
              className={`${styles.joinBtn} ${styles.btn_ended}`}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDetailsClick}
              aria-label={`View winners for ${giveaway.title}`}
            >
              <Trophy size={16} />
              <span>View Winners 🏆</span>
            </motion.button>
          ) : giveaway.status === 'upcoming' ? (
            <motion.button
              className={`${styles.joinBtn} ${styles.btn_upcoming}`}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                soundFx.playClick();
                alert(`🔔 Notification Activated for ${giveaway.title}! We'll alert you when the pool opens.`);
              }}
              aria-label={`Notify me for ${giveaway.title}`}
            >
              <Sparkles size={16} />
              <span>Notify Me 🔔</span>
            </motion.button>
          ) : !giveaway.isLoggedIn && giveaway.isLoggedIn === false ? (
            <motion.button
              className={`${styles.joinBtn} ${styles.btn_login}`}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleJoinClick}
              aria-label={`Login or signup to participate in ${giveaway.title}`}
            >
              <span>Login / Signup to Participate →</span>
            </motion.button>
          ) : userEntryCount > 0 ? (
            <motion.button
              className={`${styles.joinBtn} ${styles.btn_participating}`}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleJoinClick}
              aria-label={`Earn more entries for ${giveaway.title}`}
            >
              <Zap size={16} />
              <span>Earn More Entries →</span>
            </motion.button>
          ) : (
            <motion.button
              className={`${styles.joinBtn} ${styles[`btn_${giveaway.accentTheme || 'purple'}`]}`}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleJoinClick}
              aria-label={`Join giveaway ${giveaway.title}`}
            >
              <Zap size={16} />
              <span>Join Now →</span>
            </motion.button>
          )}

          {/* View Details Info Action Button */}
          <motion.button
            className={styles.infoBtn}
            whileHover={{ scale: 1.08, rotate: 4 }}
            whileTap={{ scale: 0.92 }}
            onClick={handleDetailsClick}
            title="View full specs, rules and verified transparency"
            aria-label={`View full details and rules for ${giveaway.title}`}
          >
            <Info size={18} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
