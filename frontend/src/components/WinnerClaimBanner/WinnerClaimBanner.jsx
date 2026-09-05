import React from 'react';
import { motion } from 'framer-motion';
import {
  Trophy,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Clock,
  CheckCircle2,
  Hourglass,
  PackageCheck,
  AlertTriangle,
  Gift,
  Compass
} from 'lucide-react';
import { soundFx } from '../../utils/soundFx';
import { ConfettiManager } from '../../utils/confetti';
import { getPrizeTypeConfig } from '../../utils/prizeTypeUtils';
import styles from './WinnerClaimBanner.module.css';

export default function WinnerClaimBanner({
  isLoggedIn = true,
  currentUserId = 'VE10025',
  winningRecord, // matched winner object or null
  claimState = 'not_submitted', // 'not_submitted' | 'submitted' | 'processing' | 'completed' | 'expired'
  onClaimPrize,
  onViewWinners,
  onExploreGiveaways
}) {
  if (!isLoggedIn) return null;

  const isWinner = !!winningRecord;

  // Handler for claim button click
  const handleClaimClick = () => {
    soundFx.playFanfare();
    ConfettiManager.burst(window.innerWidth / 2, window.innerHeight / 2, 120);
    if (onClaimPrize) {
      onClaimPrize(winningRecord?.prize || 'Apple Watch Series 9');
    }
  };

  const handleViewWinnersClick = () => {
    soundFx.playClick();
    if (onViewWinners) {
      onViewWinners();
    } else {
      const el = document.getElementById('winners-section') || document.querySelector('#featured-giveaways');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleExploreClick = () => {
    soundFx.playClick();
    if (onExploreNextGiveaway) {
      onExploreNextGiveaway();
    } else {
      const el = document.getElementById('active-giveaways') || document.querySelector('#featured-giveaways');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  /* =========================================================================
     NON-WINNER EXPERIENCE (Requirements 33 & 58)
     Show:
     Thanks for participating!
     Winners have been announced.
     [View Winners]
     Better luck next time!
     ========================================================================= */
  if (!isWinner) {
    return (
      <section className={styles.claimSection} aria-label="Participant Status & Non-Winner Notice">
        <div className="container-custom">
          <motion.div
            className={styles.nonWinnerCard}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className={styles.nonWinnerGlow}></div>
            <div className={styles.nonWinnerContent}>
              <div className={styles.nonWinnerLeft}>
                <div className={styles.nonWinnerBadge}>
                  <Compass size={13} className={styles.iconCyan} />
                  <span>MEMBER ID: {currentUserId} • PARTICIPATING</span>
                </div>
                <h3 className={styles.nonWinnerTitle}>Thanks for participating!</h3>
                <p className={styles.nonWinnerSub}>
                  Winners have been announced. Better luck next time!
                </p>
                <p className={styles.nonWinnerNote}>
                  Keep participating in active & upcoming giveaways to earn bonus loyalty tickets and reward multipliers.
                </p>
              </div>

              <div className={styles.nonWinnerRight}>
                <motion.button
                  className={`${styles.viewWinnersActionBtn} btn-primary-glow`}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleViewWinnersClick}
                  aria-label="View announced winners"
                >
                  <Trophy size={16} />
                  <span>View Winners</span>
                </motion.button>

                <motion.button
                  className={styles.exploreSecondaryBtn}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleExploreClick}
                  aria-label="Explore upcoming giveaways"
                >
                  <span>Explore Giveaways →</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    );
  }

  /* =========================================================================
     WINNER-SPECIFIC CLAIM AREA (Requirements 26, 32, 34, 69)
     currentUserId === winner.userId matched!
     ========================================================================= */
  const prizeConfig = getPrizeTypeConfig(winningRecord);
  const prizeTitle = winningRecord.prize || winningRecord.title || 'Apple Watch Series 9';
  const prizeVal = winningRecord.value || '₹44,900';
  const ticketCode = winningRecord.ticket || '#VEL-10025-IN';

  return (
    <section className={styles.claimSection} aria-label="Winner Celebration and Claim Area">
      <div className="container-custom">
        <motion.div
          className={`${styles.claimCard} ${styles[`state_${claimState}`] || ''}`}
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, type: 'spring', damping: 22 }}
        >
          <div className={styles.ambientGlow}></div>

          <div className={styles.contentWrap}>
            {/* Left Column: Winner Details & Dynamic State Messaging */}
            <div className={styles.leftCol}>
              <div className={styles.badgeRow}>
                <span className={styles.congratsBadge}>
                  <Sparkles size={13} className={styles.sparkleIcon} />
                  MATCHED USER: {currentUserId} ✓
                </span>
                <span className={styles.ticketBadge}>
                  <ShieldCheck size={13} /> Winning Ticket {ticketCode}
                </span>

                {/* State Tag */}
                {claimState === 'submitted' && (
                  <span className={styles.stateTagSuccess}>
                    <CheckCircle2 size={12} /> Claim Submitted ✓
                  </span>
                )}
                {claimState === 'processing' && (
                  <span className={styles.stateTagWarning}>
                    <Hourglass size={12} /> Processing Verification
                  </span>
                )}
                {claimState === 'completed' && (
                  <span className={styles.stateTagCompleted}>
                    <PackageCheck size={12} /> Prize Delivered ✓
                  </span>
                )}
                {claimState === 'expired' && (
                  <span className={styles.stateTagExpired}>
                    <AlertTriangle size={12} /> Expired
                  </span>
                )}
              </div>

              {/* Dynamic Heading based on Claim State */}
              <h2 className={styles.heading}>
                {claimState === 'not_submitted' && '🎉 Congratulations! You won:'}
                {claimState === 'submitted' && 'Claim Submitted Successfully!'}
                {claimState === 'processing' && 'Fulfillment in Progress'}
                {claimState === 'completed' && 'Prize Delivered!'}
                {claimState === 'expired' && 'Claim Window Expired'}
              </h2>

              <div className={styles.prizeTitle}>
                {prizeTitle} <span className={styles.prizeValueHighlight}>({prizeVal})</span>
              </div>

              {/* Requirement 32: Distinct Claim State Text Messages */}
              {claimState === 'not_submitted' && (
                <p className={styles.desc}>
                  Your ticket matched the SHA-256 provably fair drawing for retail value <strong>{prizeVal}</strong>.
                  Submit your recipient details now to start fulfillment.
                </p>
              )}

              {claimState === 'submitted' && (
                <div className={styles.stateMessageBox}>
                  <CheckCircle2 size={16} className={styles.iconEmerald} />
                  <div>
                    <strong>Claim Submitted ✓</strong>
                    <p>Our team will process your prize. Dispatch notification will be sent shortly.</p>
                  </div>
                </div>
              )}

              {claimState === 'processing' && (
                <div className={styles.stateMessageBox}>
                  <Hourglass size={16} className={styles.iconGold} />
                  <div>
                    <strong>Prize Verification In Progress</strong>
                    <p>Security validation & inventory dispatch allocation is currently active.</p>
                  </div>
                </div>
              )}

              {claimState === 'completed' && (
                <div className={styles.stateMessageBox}>
                  <PackageCheck size={16} className={styles.iconEmerald} />
                  <div>
                    <strong>Prize Delivered ✓</strong>
                    <p>Fulfillment completed. Thank you for participating in VELoop Rewards!</p>
                  </div>
                </div>
              )}

              {claimState === 'expired' && (
                <div className={`${styles.stateMessageBox} ${styles.stateExpiredBox}`}>
                  <AlertTriangle size={16} className={styles.iconRed} />
                  <div>
                    <strong>Claim Window Expired</strong>
                    <p>The standard 7-day claim window has elapsed. Please contact VIP support.</p>
                  </div>
                </div>
              )}

              {claimState === 'not_submitted' && (
                <div className={styles.deadlineRow}>
                  <Clock size={14} className={styles.clockIcon} />
                  <span>Claim within: <strong>7 days</strong> • {prizeConfig.deliveryEstimate} ({prizeConfig.badgeText})</span>
                </div>
              )}
            </div>

            {/* Right Column: Dynamic Action State */}
            <div className={styles.rightCol}>
              <div className={styles.giftIconWrap}>
                <div className={styles.iconCircle}>
                  <Trophy size={36} className={styles.trophyGlow} />
                </div>
              </div>

              {/* Action Button based on Claim State */}
              {claimState === 'not_submitted' && (
                <motion.button
                  className={styles.claimBtn}
                  whileHover={{ scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={handleClaimClick}
                >
                  <span>{isGiftCard ? 'Claim Gift Card' : 'Claim Your Prize'}</span>
                  <ArrowRight size={18} />
                </motion.button>
              )}

              {claimState === 'submitted' && (
                <div className={styles.statusPillLarge}>
                  <CheckCircle2 size={16} />
                  <span>Claim Submitted ✓</span>
                </div>
              )}

              {claimState === 'processing' && (
                <div className={`${styles.statusPillLarge} ${styles.statusProcessing}`}>
                  <Hourglass size={16} className={styles.spinnerIcon} />
                  <span>Verification In Progress</span>
                </div>
              )}

              {claimState === 'completed' && (
                <div className={`${styles.statusPillLarge} ${styles.statusCompleted}`}>
                  <PackageCheck size={16} />
                  <span>Prize Delivered ✓</span>
                </div>
              )}

              {claimState === 'expired' && (
                <div className={`${styles.statusPillLarge} ${styles.statusExpired}`}>
                  <AlertTriangle size={16} />
                  <span>Claim Window Expired</span>
                </div>
              )}

              <span className={styles.secureText}>
                <ShieldCheck size={12} /> SSL Encrypted & Verified Fulfillment
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
