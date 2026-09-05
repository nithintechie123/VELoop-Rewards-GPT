import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Sparkles, Zap, Users, ExternalLink, Trophy, Clock, CheckCircle2 } from 'lucide-react';
import Countdown from '../Countdown/Countdown';
import styles from './GiveawayHero.module.css';

/**
 * Requirement 46: Giveaway State Animation
 * When the giveaway becomes active:
 * - Countdown appears with smooth animated entrance
 * - CTA becomes active with glow
 * - Status badge changes with live radar pulse
 * When it ends:
 * - Countdown transitions to ended state
 * - CTA updates to 'View Winners' and scrolls/activates Winners tab
 */

export default function GiveawayHero({
  giveaway,
  userEntryCount = 0,
  isLoggedIn = true,
  onEnter,
  onOpenFairModal,
  onNavigateToWinners,
  onOpenReveal
}) {
  if (!giveaway) return null;

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const progressPercent = Math.min(
    100,
    Math.round((giveaway.totalTicketsEntered / giveaway.poolCap) * 100)
  );

  const handleMouseMove = (e) => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  };

  const winnerLabel = giveaway.winnerLabel || (giveaway.winnerCount ? `${giveaway.winnerCount} Winner${giveaway.winnerCount > 1 ? 's' : ''}` : '1 Winner');
  const entryRequirement = giveaway.joiningRequirement || (giveaway.entryFee ? `${giveaway.entryFee} ${giveaway.entryFeeUnit || 'VEs'}` : '250 VEs');
  const isEnded = giveaway.status === 'ended';
  const isUpcoming = giveaway.status === 'upcoming';
  const isActive = giveaway.status === 'active' || (!isEnded && !isUpcoming);

  const handleViewWinnersClick = () => {
    if (onNavigateToWinners) {
      onNavigateToWinners();
    } else {
      const el = document.getElementById('winners-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className={styles.heroSection}>
      <div className="container-custom">
        <motion.div
          className={styles.heroCard}
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => {
            setIsHovered(false);
            setMousePos({ x: 0, y: 0 });
          }}
          style={{
            transform: isHovered
              ? `perspective(1000px) rotateY(${mousePos.x * 3}deg) rotateX(${-mousePos.y * 3}deg)`
              : 'perspective(1000px) rotateY(0deg) rotateX(0deg)',
            transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.5s ease-out'
          }}
        >
          {/* Top Animated Gradient Border */}
          <div className={styles.accentBorder}></div>

          {/* Interactive Background Spotlight Glow */}
          <div
            className={styles.dynamicGlow}
            style={{
              left: `${(mousePos.x + 0.5) * 100}%`,
              top: `${(mousePos.y + 0.5) * 100}%`,
              opacity: isHovered ? 0.35 : 0.15
            }}
          />

          <div className={styles.contentCol}>
            {/* Badges Strip with Dynamic Status Transition */}
            <motion.div
              className={styles.badgeRow}
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15, duration: 0.4 }}
            >
              <span className={styles.grandPrizeBadge}>
                <Sparkles size={13} className={styles.sparkleIcon} /> 🎁 EXCLUSIVE GIVEAWAY
              </span>

              {/* Requirement 46: Status Badge Dynamic Animation */}
              <AnimatePresence mode="wait">
                {isActive && (
                  <motion.span
                    key="badge-active"
                    className={styles.activeStatusBadge}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <span className={styles.pulseLiveDot}></span>
                    LIVE NOW
                  </motion.span>
                )}

                {isEnded && (
                  <motion.span
                    key="badge-ended"
                    className={styles.endedStatusBadge}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <Trophy size={12} />
                    DRAW COMPLETED
                  </motion.span>
                )}

                {isUpcoming && (
                  <motion.span
                    key="badge-upcoming"
                    className={styles.upcomingStatusBadge}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <Clock size={12} />
                    OPENS SOON
                  </motion.span>
                )}
              </AnimatePresence>

              <span className="badge-pill-custom badge-gold-custom">
                <Trophy size={13} /> {winnerLabel}
              </span>

              {userEntryCount > 0 && (
                <span className="badge-pill-custom badge-active-custom">
                  <CheckCircle2 size={13} /> You're Participating ✓
                </span>
              )}

              <span className="badge-pill-custom badge-cyan-custom">
                <ShieldCheck size={13} /> {giveaway.sponsor}
              </span>
            </motion.div>

            {/* Title & Description */}
            <motion.h1
              className={styles.title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.45 }}
            >
              {giveaway.title}
            </motion.h1>

            <p className={styles.subtitle}>
              Complete eligible activities, collect daily entries, and get a chance to win certified flagship rewards. 100% free daily participation tier guaranteed.
            </p>

            {/* Value & Stats Strip */}
            <div className={styles.statsStrip}>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>ESTIMATED VALUE</span>
                <span className={`${styles.statVal} ${styles.goldText}`}>
                  ₹{giveaway.valueUSD.toLocaleString('en-IN')}
                </span>
              </div>
              <div className={styles.statDivider}></div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>YOUR ENTRIES</span>
                <motion.span
                  key={userEntryCount}
                  className={`${styles.statVal} ${styles.emeraldText}`}
                  initial={{ scale: 1.3 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                >
                  {userEntryCount}
                </motion.span>
              </div>
              <div className={styles.statDivider}></div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>DRAW VERIFICATION</span>
                <button className={styles.fairLink} onClick={onOpenFairModal}>
                  SHA-256 <ExternalLink size={12} />
                </button>
              </div>
            </div>

            {/* Requirement 46: Countdown Appears when Active & Transitions when Ended */}
            <div className={styles.countdownBox}>
              <AnimatePresence mode="wait">
                {isEnded ? (
                  <motion.div
                    key="ended-banner"
                    className={styles.endedBannerWrap}
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.35 }}
                  >
                    <div className={styles.endedBannerIcon}>
                      <Trophy size={26} />
                    </div>
                    <div className={styles.endedBannerText}>
                      <div className={styles.endedHeadingRow}>
                        <h4 className={styles.endedTitle}>Giveaway Concluded • Winner Announced</h4>
                        <span className={styles.verifiedDrawPill}>
                          <CheckCircle2 size={12} /> SHA-256 Verified
                        </span>
                      </div>
                      <p className={styles.endedSubtitle}>
                        Official winner: <strong className={styles.highlightWinner}>{giveaway.winnerName || 'VE****82'}</strong> with Ticket <code>#VEL-82194-IN</code>.
                      </p>
                    </div>
                  </motion.div>
                ) : isUpcoming ? (
                  <motion.div
                    key="upcoming-banner"
                    className={styles.upcomingBannerWrap}
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.35 }}
                  >
                    <div className={styles.upcomingIconCircle}>
                      <Clock size={24} className={styles.iconCyan} />
                    </div>
                    <div className={styles.upcomingBannerText}>
                      <div className={styles.upcomingHeaderRow}>
                        <span className={styles.upcomingTag}>Next Giveaway</span>
                        <span className={styles.upcomingStartsLabel}>Starts In</span>
                        <strong className={styles.upcomingDaysVal}>{giveaway.startsIn || '3 Days'}</strong>
                      </div>
                      <p className={styles.upcomingSubtitle}>
                        Get ready for another chance to win. Pre-register for early bird bonus tickets.
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="active-countdown"
                    initial={{ opacity: 0, scale: 0.96, y: 8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96, y: -8 }}
                    transition={{ duration: 0.35 }}
                  >
                    <Countdown targetDate={giveaway.endsAt} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Pool Progress Gauge */}
            <div className={styles.poolProgress}>
              <div className={styles.poolMeta}>
                <span className={styles.poolLabel}>
                  <Users size={13} /> Community Pool Progress ({progressPercent}%)
                </span>
                <span className={styles.poolNumbers}>
                  <strong>{giveaway.totalTicketsEntered.toLocaleString()}</strong> / {giveaway.poolCap.toLocaleString()} Tickets
                </span>
              </div>
              <div className={styles.track}>
                <motion.div
                  className={styles.fill}
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                />
              </div>
            </div>

            {/* Requirement 46 & 47: CTA Actions with Winner Reveal Trigger */}
            <div className={styles.actionRow}>
              <AnimatePresence mode="wait">
                {isEnded ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <motion.button
                      key="btn-ended"
                      className={styles.viewWinnersBtn}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      whileHover={{ scale: 1.03, y: -2 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={handleViewWinnersClick}
                    >
                      <Trophy size={18} />
                      <span>View Winners 🏆</span>
                    </motion.button>

                    {onOpenReveal && (
                      <motion.button
                        key="btn-reveal"
                        className="btn-outline-custom"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.03, y: -1 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={onOpenReveal}
                      >
                        <Sparkles size={16} style={{ color: '#fbbf24' }} />
                        <span>Watch Winner Reveal 🎬</span>
                      </motion.button>
                    )}
                  </div>
                ) : isUpcoming ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <motion.button
                      key="btn-upcoming-explore"
                      className="btn-primary-glow"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      whileHover={{ scale: 1.03, y: -2 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => {
                        soundFx.playClick();
                        const el = document.getElementById('active-giveaways') || document.querySelector('#featured-giveaways');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                      aria-label="Explore Rewards"
                    >
                      <Sparkles size={18} />
                      <span>Explore Rewards</span>
                    </motion.button>

                    <motion.button
                      key="btn-upcoming-notify"
                      className="btn-outline-custom"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ scale: 1.02, y: -1 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => {
                        soundFx.playSuccess();
                        alert(`🔔 Launch Alert Registered! We'll notify you the moment the ${giveaway.title} begins.`);
                      }}
                      aria-label={`Notify me for ${giveaway.title}`}
                    >
                      <span>Notify Me 🔔</span>
                    </motion.button>
                  </div>
                ) : (
                  <motion.button
                    key="btn-active"
                    className="btn-primary-glow"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => onEnter(giveaway.id)}
                  >
                    <Zap size={18} />
                    <span>
                      {!isLoggedIn
                        ? 'Login / Signup to Participate →'
                        : userEntryCount > 0
                        ? 'Earn More Entries →'
                        : `Join for ${entryRequirement} →`}
                    </span>
                  </motion.button>
                )}
              </AnimatePresence>

              <motion.button
                className="btn-outline-custom"
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.97 }}
                onClick={onOpenFairModal}
              >
                <ShieldCheck size={16} /> Provably Fair Audit
              </motion.button>
            </div>
          </div>

          {/* Media Column - Rich Layered Reward Illustration */}
          <div className={styles.mediaCol}>
            <div className={styles.imageContainer}>
              <motion.img
                src={giveaway.image}
                alt={giveaway.title}
                className={styles.heroImg}
                decoding="async"
                whileHover={{ scale: 1.04 }}
                transition={{ duration: 0.4 }}
              />

              {/* Floating Golden VIP Ticket Pill */}
              <motion.div
                className={styles.floatingTicketPill}
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
              >
                <span className={styles.ticketStar}>★</span>
                <div>
                  <div className={styles.ticketPillTitle}>VIP TICKET #VEL-84920</div>
                  <div className={styles.ticketPillSub}>Verified Entry Active</div>
                </div>
              </motion.div>

              {/* Floating Loyalty Coins Chip */}
              <motion.div
                className={styles.floatingCoinsPill}
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
              >
                <span className={styles.coinEmoji}>💰</span>
                <div>
                  <div className={styles.coinsPillTitle}>+1,000 VELoop Coins</div>
                  <div className={styles.coinsPillSub}>Free Daily Bonus</div>
                </div>
              </motion.div>

              {/* Floating Guarantee Badge */}
              <motion.div
                className={styles.floatingTag}
                animate={{ y: [0, -7, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <div className={styles.floatingIcon}>🏆</div>
                <div>
                  <div className={styles.floatingTitle}>100% Free Entry Tier</div>
                  <div className={styles.floatingSubtitle}>Insured Worldwide Shipping</div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
