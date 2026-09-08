import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Zap,
  Users,
  Ticket,
  Info,
  Sparkles,
  Trophy,
  Star,
  CheckCircle2,
  Clock,
  Gift,
  ArrowRight
} from 'lucide-react';
import Countdown from '../Countdown/Countdown';
import { soundFx } from '../../utils/soundFx';
import styles from './PrizeCard.module.css';

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
  const entryRequirement = giveaway.joiningRequirement || (giveaway.entryFee ? `${giveaway.entryFee} ${giveaway.entryFeeUnit || 'VEs'}` : '250 VEs');
  const isFreeDaily = giveaway.allowsFreeDaily || giveaway.entryFee === 0 || !userEntryCount;

  // Calculate ticket progress percentage
  const totalEntered = giveaway.totalTicketsEntered || giveaway.totalTickets || 14200;
  const poolCap = giveaway.poolCap || 25000;
  const progressPct = Math.min(100, Math.round((totalEntered / poolCap) * 100));

  return (
    <motion.div
      className={styles.card}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -8, transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] } }}
      whileTap={{ scale: 0.985 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onKeyDown={handleCardKeyDown}
      tabIndex={0}
      role="article"
      aria-label={`${giveaway.title} - Retail Value ₹${(giveaway.valueUSD || 0).toLocaleString('en-IN')} - ${winnerLabel}. Press Enter to view full details.`}
    >
      {/* Dynamic Cursor Spotlight Effect */}
      {isHovered && (
        <div
          className={styles.cardSpotlight}
          style={{ left: `${mousePos.x}px`, top: `${mousePos.y}px` }}
        />
      )}

      {/* Card Header & Media Stage */}
      <div
        className={styles.mediaStage}
        onClick={handleDetailsClick}
        title={`View full details for ${giveaway.title}`}
      >
        {/* Ambient Pedestal Glow */}
        <div className={styles.pedestalGlow}></div>
        <div className={styles.pedestalRing}></div>

        {/* Floating Product Image with 3D Pop */}
        <motion.div
          className={styles.imgContainer}
          animate={{
            y: isHovered ? -6 : 0,
            scale: isHovered ? 1.06 : 1
          }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <img
            src={giveaway.image || '/assets/images/giveaway_ticket_gold.png'}
            alt={giveaway.title}
            className={styles.mediaImg}
            loading="lazy"
            decoding="async"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = '/assets/images/giveaway_ticket_gold.png';
            }}
          />
        </motion.div>

        {/* Floating Top Pill Badges */}
        <div className={styles.topBadgesRow}>
          {giveaway.prizeTier ? (
            <span className={styles.tierPill}>
              <Star size={11} className={styles.iconGold} />
              {giveaway.prizeTier}
            </span>
          ) : (
            <span className={styles.categoryPill}>{giveaway.category || 'Featured'}</span>
          )}

          <span className={styles.winnerBadge}>
            <Trophy size={11} className={styles.iconGold} />
            {winnerLabel}
          </span>
        </div>

        {/* Value Banner Ribbon Tag */}
        <div className={styles.valueTag}>
          <span className={styles.valueLabel}>VALUE</span>
          <span className={styles.valueAmount}>
            ₹{(giveaway.valueUSD || 0).toLocaleString('en-IN')}
          </span>
        </div>

        {/* Live / Status Indicator Pill */}
        <div className={styles.statusPillWrap}>
          {userEntryCount > 0 ? (
            <span className={styles.enteredStatusPill}>
              <CheckCircle2 size={12} /> Participating ({userEntryCount} Tickets)
            </span>
          ) : giveaway.status === 'ended' ? (
            <span className={styles.endedStatusPill}>
              <Trophy size={11} /> Draw Concluded
            </span>
          ) : giveaway.status === 'upcoming' ? (
            <span className={styles.upcomingStatusPill}>
              <Clock size={11} /> Starts in {giveaway.startsIn || '3 Days'}
            </span>
          ) : (
            <span className={styles.liveStatusPill}>
              <span className={styles.pulseDot}></span> LIVE POOL
            </span>
          )}
        </div>
      </div>

      {/* Card Content Body */}
      <div className={styles.body}>
        <div className={styles.titleGroup}>
          <div className={styles.categorySubhead}>
            <span>{giveaway.category}</span>
            <span className={styles.bulletDot}>•</span>
            <span className={styles.verifiedText}>SHA-256 Verified</span>
          </div>
          <h3 className={styles.cardTitle} onClick={handleDetailsClick}>
            {giveaway.title}
          </h3>
          <p className={styles.cardDesc}>
            {giveaway.subtitle || giveaway.description || 'Certified authentic rewards guaranteed.'}
          </p>
        </div>

        {/* Pool Participation Progress Bar */}
        <div className={styles.poolProgressSection}>
          <div className={styles.progressLabelRow}>
            <span className={styles.progressLabel}>
              <Users size={12} className={styles.iconMuted} />
              Pool Claimed: <strong>{totalEntered.toLocaleString()}</strong> tickets
            </span>
            <span className={styles.progressPctText}>{progressPct}%</span>
          </div>
          <div className={styles.progressTrack}>
            <div
              className={styles.progressFill}
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Remaining Time & Requirement Box */}
        <div className={styles.statsCardBox}>
          <div className={styles.statCol}>
            <span className={styles.statLabel}>
              <Clock size={11} /> TIME LEFT
            </span>
            {giveaway.status === 'ended' ? (
              <span className={styles.statEndedText}>Ended</span>
            ) : giveaway.status === 'upcoming' ? (
              <span className={styles.statUpcomingText}>{giveaway.startsIn || '3 Days'}</span>
            ) : (
              <div className={styles.timerWrap}>
                <Countdown targetDate={giveaway.endsAt || giveaway.endAt} compact={true} />
              </div>
            )}
          </div>

          <div className={styles.statDivider}></div>

          <div className={styles.statCol}>
            <span className={styles.statLabel}>ENTRY FEE</span>
            <div className={styles.entryFeeVal}>
              <Sparkles size={12} className={styles.iconGold} />
              <span>{isFreeDaily && !userEntryCount ? '1 Free Daily' : entryRequirement}</span>
            </div>
          </div>
        </div>

        {/* Primary Action Button Row */}
        <div className={styles.actionsRow}>
          {giveaway.status === 'ended' ? (
            <motion.button
              className={`${styles.primaryBtn} ${styles.btnEnded}`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              onClick={handleDetailsClick}
            >
              <Trophy size={16} />
              <span>View Winners & Proof</span>
            </motion.button>
          ) : giveaway.status === 'upcoming' ? (
            <motion.button
              className={`${styles.primaryBtn} ${styles.btnUpcoming}`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => {
                soundFx.playClick();
                alert(`🔔 Notification Activated for ${giveaway.title}! We'll alert you when the pool opens.`);
              }}
            >
              <Sparkles size={16} />
              <span>Notify Me 🔔</span>
            </motion.button>
          ) : !giveaway.isLoggedIn && giveaway.isLoggedIn === false ? (
            <motion.button
              className={`${styles.primaryBtn} ${styles.btnLogin}`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              onClick={handleJoinClick}
            >
              <Zap size={16} />
              <span>Login to Join Draw</span>
              <ArrowRight size={15} />
            </motion.button>
          ) : userEntryCount > 0 ? (
            <motion.button
              className={`${styles.primaryBtn} ${styles.btnParticipating}`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              onClick={handleJoinClick}
            >
              <Zap size={16} />
              <span>Boost Your Odds →</span>
            </motion.button>
          ) : (
            <motion.button
              className={`${styles.primaryBtn} ${styles.btnEnter}`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              onClick={handleJoinClick}
            >
              <Gift size={16} />
              <span>{isFreeDaily ? 'Claim Free Entry 🎁' : `Enter for ${entryRequirement} →`}</span>
            </motion.button>
          )}

          {/* Quick Info / Detail Modal Button */}
          <motion.button
            className={styles.infoActionBtn}
            whileHover={{ scale: 1.08, rotate: 6 }}
            whileTap={{ scale: 0.92 }}
            onClick={handleDetailsClick}
            title="Inspect rules, specifications and provably fair seed commitment"
            aria-label={`View rules for ${giveaway.title}`}
          >
            <Info size={17} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
