import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Trophy, Gift, ShieldCheck, Ticket, Zap, Lock, Unlock, Coins, Star } from 'lucide-react';
import styles from './GiveawayLoader.module.css';

/**
 * Requirement 53: Premium Loader Animation Suite
 * 8 Core Themed Animations:
 * 1. Gift box opening animation (3D lid lift & interior radiant burst)
 * 2. Reward particles (Orbital stardust & glowing particle motes)
 * 3. Rotating ticket (Continuous 3D metallic Y-axis rotation)
 * 4. Coin movement (Floating, bouncing VELoop gold coins with orbital arc)
 * 5. Prize card reveal (Holographic mini card flip with specular glare)
 * 6. Trophy pulse (Celebratory champion gold trophy with radiant shockwaves)
 * 7. Loading progress ring (Radial SVG circle with animated gradient stroke)
 * 8. Subtle sparkle animation (Multi-point twinkling stars with micro-scale pulse)
 */

const REWARD_MODES = [
  { id: 'gift', type: 'GIFT_BOX', label: 'GIFT VAULT', color: '#f59e0b' },
  { id: 'ticket', type: 'ROTATING_TICKET', label: 'VIP TICKET', color: '#10b981' },
  { id: 'card', type: 'PRIZE_REVEAL', label: 'PRIZE REVEAL', color: '#06b6d4' },
  { id: 'trophy', type: 'TROPHY_PULSE', label: 'CHAMPION TROPHY', color: '#ec4899' },
  { id: 'coin', type: 'COIN_MOVE', label: 'VE REWARD', color: '#fbbf24' }
];
const REWARD_ICONS = REWARD_MODES;

/**
 * Requirement 54: Rotating Loader Text Messages (Comfortable Pacing)
 * Rotates smoothly between friendly, experiential giveaway messages:
 * - "Preparing today's rewards..."
 * - "Checking active giveaways..."
 * - "Loading available prizes..."
 * - "Bringing your rewards closer..."
 * Paced at 2.8s per message to ensure effortless readability without rapid flickering.
 */
const LOADING_STATUSES = [
  { icon: Gift, text: "Preparing today's rewards...", color: '#f59e0b' },
  { icon: Ticket, text: "Checking active giveaways...", color: '#10b981' },
  { icon: Sparkles, text: "Loading available prizes...", color: '#06b6d4' },
  { icon: Trophy, text: "Bringing your rewards closer...", color: '#ec4899' },
  { icon: ShieldCheck, text: "Connecting to Secure Giveaway Ledger...", color: '#8b5cf6' }
];

// 8 Particle Coordinates for Floating Stardust
const PARTICLES = [
  { id: 1, x: -55, y: -45, size: 4, delay: 0, color: '#10b981' },
  { id: 2, x: 60, y: -35, size: 5, delay: 0.4, color: '#f59e0b' },
  { id: 3, x: -65, y: 35, size: 3, delay: 0.8, color: '#06b6d4' },
  { id: 4, x: 50, y: 50, size: 4, delay: 1.2, color: '#8b5cf6' },
  { id: 5, x: 0, y: -65, size: 5, delay: 0.6, color: '#fbbf24' },
  { id: 6, x: -40, y: 0, size: 3, delay: 1.0, color: '#ec4899' },
  { id: 7, x: 45, y: -10, size: 4, delay: 0.2, color: '#10b981' },
  { id: 8, x: 0, y: 65, size: 3, delay: 1.4, color: '#f59e0b' }
];

export default function GiveawayLoader({ message = 'Unlocking rewards...', fullScreen = false }) {
  const [modeIndex, setModeIndex] = useState(0);
  const [statusIndex, setStatusIndex] = useState(0);
  const [isLidOpen, setIsLidOpen] = useState(false);

  useEffect(() => {
    // Mode transitions (Icons & 3D elements)
    const modeTimer = setInterval(() => {
      setModeIndex((prev) => (prev + 1) % REWARD_MODES.length);
    }, 2800);

    // Message transitions (Paced at a comfortable 2.8s without changing too quickly)
    const statusTimer = setInterval(() => {
      setStatusIndex((prev) => (prev + 1) % LOADING_STATUSES.length);
      setIsLidOpen((prev) => !prev);
    }, 2800);

    return () => {
      clearInterval(modeTimer);
      clearInterval(statusTimer);
    };
  }, []);

  const activeMode = REWARD_MODES[modeIndex];
  const currentStatus = LOADING_STATUSES[statusIndex];
  const StatusIcon = currentStatus.icon;

  return (
    <div className={`${styles.loaderContainer} ${fullScreen ? styles.fullScreen : ''}`} role="status" aria-live="polite">
      {/* Ambient Pulsing Background Glows */}
      <div className={styles.ambientGlowGold}></div>
      <div className={styles.ambientGlowEmerald}></div>

      {/* 2. Reward Particles Floating Orbit */}
      <div className={styles.particleField}>
        {PARTICLES.map((p) => (
          <motion.div
            key={p.id}
            className={styles.rewardParticle}
            style={{
              width: `${p.size}px`,
              height: `${p.size}px`,
              backgroundColor: p.color,
              boxShadow: `0 0 10px ${p.color}`
            }}
            animate={{
              x: [p.x, p.x + (p.id % 2 === 0 ? 12 : -12), p.x],
              y: [p.y, p.y + (p.id % 2 === 0 ? -12 : 12), p.y],
              opacity: [0.3, 1, 0.3],
              scale: [0.8, 1.4, 0.8]
            }}
            transition={{
              duration: 3 + (p.id % 3),
              repeat: Infinity,
              delay: p.delay,
              ease: 'easeInOut'
            }}
          />
        ))}
      </div>

      <div className={styles.loaderCore}>
        {/* 7. Loading Progress Ring + Stage */}
        <div className={styles.stage}>
          {/* Radial SVG Loading Progress Ring */}
          <svg className={styles.progressRingSvg} viewBox="0 0 160 160">
            <defs>
              <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="50%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
            <circle
              className={styles.progressRingBg}
              cx="80"
              cy="80"
              r="72"
            />
            <motion.circle
              className={styles.progressRingCircle}
              cx="80"
              cy="80"
              r="72"
              stroke="url(#ringGrad)"
              strokeDasharray="452.39"
              animate={{
                strokeDashoffset: [452.39, 0, -452.39],
                rotate: [0, 360]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'linear'
              }}
            />
          </svg>

          {/* Outer Orbital Rings */}
          <motion.div
            className={styles.orbitalRingOuter}
            animate={{ rotate: 360 }}
            transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
          />

          {/* 3D Floating Stage Centerpiece */}
          <motion.div
            className={styles.centerpiece}
            animate={{
              y: [-6, 6, -6],
              rotateY: [-6, 6, -6]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          >
            <div className={styles.rewardBox}>
              {/* Dynamic Center Animations (1 through 6) */}
              <div className={styles.iconStage}>
                <AnimatePresence mode="wait">
                  {/* 1. Gift Box Opening Animation */}
                  {activeMode.type === 'GIFT_BOX' && (
                    <motion.div
                      key="anim-gift"
                      className={styles.giftBoxAnimWrap}
                      initial={{ scale: 0.6, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.6, opacity: 0 }}
                      transition={{ duration: 0.35 }}
                    >
                      {/* Box Base */}
                      <div className={styles.giftBoxBase}>
                        <Gift size={32} className={styles.giftIcon} />
                        {/* 1. Opening Lid */}
                        <motion.div
                          className={styles.giftBoxLid}
                          animate={{
                            y: isLidOpen ? -14 : -2,
                            rotateX: isLidOpen ? -35 : 0,
                            rotateZ: isLidOpen ? -8 : 0
                          }}
                          transition={{ duration: 0.6, ease: 'backOut' }}
                        >
                          <div className={styles.lidBow}></div>
                        </motion.div>
                        {/* Radiant Aura Burst when Open */}
                        {isLidOpen && (
                          <motion.div
                            className={styles.giftLidAura}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: [1, 1.8, 1.4], opacity: [0.8, 1, 0.6] }}
                            transition={{ duration: 0.8, repeat: Infinity }}
                          />
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* 3. Rotating Ticket Animation */}
                  {activeMode.type === 'ROTATING_TICKET' && (
                    <motion.div
                      key="anim-ticket"
                      className={styles.ticketAnimWrap}
                      initial={{ scale: 0.6, opacity: 0 }}
                      animate={{
                        scale: 1,
                        opacity: 1,
                        rotateY: [0, 180, 360]
                      }}
                      exit={{ scale: 0.6, opacity: 0 }}
                      transition={{
                        rotateY: { duration: 2.2, repeat: Infinity, ease: 'linear' },
                        scale: { duration: 0.35 },
                        opacity: { duration: 0.35 }
                      }}
                    >
                      <div className={styles.goldenTicket}>
                        <Ticket size={34} className={styles.ticketIcon} />
                        <span className={styles.ticketVipTag}>VIP</span>
                      </div>
                    </motion.div>
                  )}

                  {/* 5. Prize Card Reveal Animation */}
                  {activeMode.type === 'PRIZE_REVEAL' && (
                    <motion.div
                      key="anim-card"
                      className={styles.cardRevealWrap}
                      initial={{ rotateY: 90, opacity: 0 }}
                      animate={{ rotateY: 0, opacity: 1 }}
                      exit={{ rotateY: -90, opacity: 0 }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                    >
                      <div className={styles.miniPrizeCard}>
                        <div className={styles.cardHeaderShine}></div>
                        <Sparkles size={20} className={styles.cardSparkle} />
                        <span className={styles.cardTitleText}>PRIZE</span>
                        <div className={styles.cardTierBadge}>TIER 1</div>
                      </div>
                    </motion.div>
                  )}

                  {/* 6. Trophy Pulse Animation */}
                  {activeMode.type === 'TROPHY_PULSE' && (
                    <motion.div
                      key="anim-trophy"
                      className={styles.trophyPulseWrap}
                      initial={{ scale: 0.7, opacity: 0 }}
                      animate={{ scale: [1, 1.15, 1], opacity: 1 }}
                      exit={{ scale: 0.7, opacity: 0 }}
                      transition={{ scale: { duration: 1.2, repeat: Infinity, ease: 'easeInOut' } }}
                    >
                      <Trophy size={36} className={styles.trophyIcon} />
                      <motion.div
                        className={styles.trophyShockwave}
                        animate={{ scale: [1, 2.2], opacity: [0.8, 0] }}
                        transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut' }}
                      />
                    </motion.div>
                  )}

                  {/* 4. Coin Movement Animation */}
                  {activeMode.type === 'COIN_MOVE' && (
                    <motion.div
                      key="anim-coin"
                      className={styles.coinMoveWrap}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{
                        y: [-4, 4, -4],
                        rotateY: [0, 360],
                        opacity: 1
                      }}
                      exit={{ y: -20, opacity: 0 }}
                      transition={{
                        y: { duration: 1.6, repeat: Infinity, ease: 'easeInOut' },
                        rotateY: { duration: 2, repeat: Infinity, ease: 'linear' }
                      }}
                    >
                      <div className={styles.goldCoin}>
                        <Coins size={32} className={styles.coinIcon} />
                        <span className={styles.coinVeTag}>VEs</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* ┌─────────┐
                  │  REWARD │
                  └─────────┘ Concept Box Plaque */}
              <div className={styles.rewardPlaque}>
                <div className={styles.plaqueCornerTL}>┌</div>
                <div className={styles.plaqueBorderTop}>───────</div>
                <div className={styles.plaqueCornerTR}>┐</div>
                <div className={styles.plaqueText}>REWARD</div>
                <div className={styles.plaqueCornerBL}>└</div>
                <div className={styles.plaqueBorderBottom}>───────</div>
                <div className={styles.plaqueCornerBR}>┘</div>
              </div>

              {/* 8. Subtle Sparkle Animations */}
              <motion.div
                className={styles.sparkleFloatTop}
                animate={{ scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6], rotate: [0, 90, 180] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles size={16} />
              </motion.div>
              <motion.div
                className={styles.sparkleFloatBottom}
                animate={{ scale: [1.3, 0.8, 1.3], opacity: [0.7, 1, 0.7], rotate: [180, 90, 0] }}
                transition={{ duration: 2.4, repeat: Infinity }}
              >
                <Star size={13} className={styles.iconStar} />
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Unlocking rewards... Title Headline */}
        <motion.div
          className={styles.unlockingHeadline}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <h3 className={styles.unlockingText}>{message}</h3>
        </motion.div>

        {/* Concept 5-Dot Wave Sequence: ● ● ● ● ● */}
        <div className={styles.dotWaveRow} aria-label="Loading animation wave">
          {[0, 1, 2, 3, 4].map((dotIndex) => (
            <motion.span
              key={dotIndex}
              className={styles.dotPill}
              animate={{
                scale: [1, 1.6, 1],
                opacity: [0.4, 1, 0.4],
                backgroundColor: ['#10b981', '#f59e0b', '#06b6d4', '#8b5cf6', '#10b981'][dotIndex]
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: dotIndex * 0.18,
                ease: 'easeInOut'
              }}
            >
              ●
            </motion.span>
          ))}
        </div>

        {/* Dynamic Status Pill */}
        <div className={styles.statusPill}>
          <AnimatePresence mode="wait">
            <motion.div
              key={statusIndex}
              className={styles.statusContent}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3 }}
            >
              <StatusIcon size={15} style={{ color: currentStatus.color }} className={styles.pulseIcon} />
              <span className={styles.statusText}>{currentStatus.text}</span>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Holographic Shimmer Progress Bar */}
        <div className={styles.progressTrack}>
          <motion.div
            className={styles.progressFill}
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{
              repeat: Infinity,
              duration: 1.8,
              ease: [0.4, 0, 0.2, 1]
            }}
          />
        </div>

        {/* Subtext */}
        <p className={styles.subtext}>VELOOP REWARDS • Verified Cryptographic Fair Ledger</p>
      </div>
    </div>
  );
}
