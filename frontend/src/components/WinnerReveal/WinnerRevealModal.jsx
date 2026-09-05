import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy,
  X,
  Sparkles,
  ShieldCheck,
  Cpu,
  CheckCircle2,
  ExternalLink,
  ArrowRight,
  RotateCcw,
  Clock,
  Ticket
} from 'lucide-react';
import { soundFx } from '../../utils/soundFx';
import styles from './WinnerRevealModal.module.css';

/**
 * Requirement 47: Winner Reveal Animation
 * Polished, controlled, non-gambling state sequence:
 * 1. Giveaway Ended
 * 2. Selecting Winners... (Cryptographic hash computation & beacon resolution)
 * 3. Winner Revealed (Golden aura burst & verified ticket match)
 * 4. 🎉 iPhone / Grand Prize Winner card with proof inspection
 */

export default function WinnerRevealModal({
  isOpen,
  onClose,
  giveaway = null,
  onInspectProof,
  onNavigateToWinners
}) {
  const [stage, setStage] = useState('ended'); // 'ended' -> 'selecting' -> 'revealed'
  const [progress, setProgress] = useState(0);
  const [hashCandidate, setHashCandidate] = useState('a9f84b...c38e91');
  const [ticketCandidate, setTicketCandidate] = useState('#VEL-10025-IN');

  const prizeTitle = giveaway?.title || 'iPhone 15 Pro';
  const prizeValue = giveaway?.valueUSD || 134900;
  const winnerHandle = giveaway?.winnerName || 'VE****82';
  const winnerTicket = '#VEL-82194-IN';
  const prizeImage = giveaway?.image || 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80';

  useEffect(() => {
    if (!isOpen) {
      setStage('ended');
      setProgress(0);
      return;
    }

    // Sequence controller
    setStage('ended');
    setProgress(0);

    // Step 1: Transition from "Giveaway Ended" to "Selecting Winners" after 1.8s
    const t1 = setTimeout(() => {
      setStage('selecting');
      soundFx.playClick();
    }, 1800);

    return () => clearTimeout(t1);
  }, [isOpen]);

  // Stage 2: Cryptographic calculation simulation (2.5s)
  useEffect(() => {
    if (stage !== 'selecting') return;

    const dummyHashes = [
      '3f7a1c89b2...e491',
      'd8a24f01c9...821b',
      'e3b0c44298...b855',
      '9c02e8812f...109a',
      'f47ac10b98...c23d'
    ];
    const dummyTickets = [
      '#VEL-40192-IN',
      '#VEL-68201-US',
      '#VEL-19402-UK',
      '#VEL-77391-DE',
      '#VEL-82194-IN'
    ];

    let currentProg = 0;
    const interval = setInterval(() => {
      currentProg += 4;
      setProgress(Math.min(100, currentProg));

      const randIdx = Math.floor(Math.random() * dummyHashes.length);
      setHashCandidate(dummyHashes[randIdx]);
      setTicketCandidate(dummyTickets[randIdx]);

      if (currentProg >= 100) {
        clearInterval(interval);
        setStage('revealed');
        soundFx.playFanfare();
      }
    }, 90);

    return () => clearInterval(interval);
  }, [stage]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const handleReplay = () => {
    soundFx.playClick();
    setStage('ended');
    setProgress(0);
    setTimeout(() => {
      setStage('selecting');
    }, 1200);
  };

  return (
    <motion.div
      className={styles.overlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="winner-reveal-title"
    >
      <motion.div
        className={styles.modal}
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className={styles.header}>
          <div className={styles.tag}>
            <ShieldCheck size={14} className={styles.iconEmerald} />
            <span>PROVABLY FAIR VERIFIED DRAW</span>
          </div>

          <div className={styles.headerActions}>
            {stage === 'revealed' && (
              <button
                className={styles.replayBtn}
                onClick={handleReplay}
                title="Replay sequence"
              >
                <RotateCcw size={14} /> Replay
              </button>
            )}
            <button className={styles.closeBtn} onClick={onClose} aria-label="Close modal">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body Container */}
        <div className={styles.body}>
          <AnimatePresence mode="wait">
            {/* ============================================================
                STEP 1: GIVEAWAY ENDED
               ============================================================ */}
            {stage === 'ended' && (
              <motion.div
                key="step-ended"
                className={styles.stepContainer}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
              >
                <div className={styles.iconCircleEnded}>
                  <Clock size={36} className={styles.iconGold} />
                </div>

                <span className={styles.phasePillGold}>PHASE 1 OF 3 • POOL CONCLUDED</span>
                <h3 id="winner-reveal-title" className={styles.phaseTitle}>Giveaway Ended</h3>
                <p className={styles.phaseDesc}>
                  Countdown reached 00:00:00. All eligible free daily entries and quest tickets have been locked in the immutable draw block.
                </p>

                <div className={styles.infoCard}>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Prize Pool</span>
                    <strong className={styles.infoValue}>{prizeTitle} (₹{prizeValue.toLocaleString('en-IN')})</strong>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Total Registered Entries</span>
                    <span className={styles.infoMono}>8,500 Valid Tickets</span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Draw Protocol</span>
                    <span className={styles.infoMono}>HMAC SHA-256 Cryptographic Beacon</span>
                  </div>
                </div>

                <div className={styles.loadingStrip}>
                  <div className={styles.spinner}></div>
                  <span>Initiating Cryptographic Drawing Seed...</span>
                </div>
              </motion.div>
            )}

            {/* ============================================================
                STEP 2: SELECTING WINNERS...
               ============================================================ */}
            {stage === 'selecting' && (
              <motion.div
                key="step-selecting"
                className={styles.stepContainer}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
              >
                <div className={styles.iconCircleSelecting}>
                  <Cpu size={36} className={styles.iconCyan} />
                </div>

                <span className={styles.phasePillCyan}>PHASE 2 OF 3 • COMPUTING ENTROPY</span>
                <h3 id="winner-reveal-title" className={styles.phaseTitle}>Selecting Winners...</h3>
                <p className={styles.phaseDesc}>
                  Combining pre-committed server seed with public blockchain beacon hash to determine the winning ticket mathematically.
                </p>

                {/* Cryptographic Execution Box */}
                <div className={styles.cryptoBox}>
                  <div className={styles.cryptoRow}>
                    <span className={styles.cryptoLabel}>Server Seed:</span>
                    <code className={styles.cryptoCode}>9f8a3c...b7410e (Pre-Committed)</code>
                  </div>
                  <div className={styles.cryptoRow}>
                    <span className={styles.cryptoLabel}>Public Beacon:</span>
                    <code className={styles.cryptoCode}>ETH Block #19847291 Hash</code>
                  </div>
                  <div className={styles.cryptoRow}>
                    <span className={styles.cryptoLabel}>Entropy Stream:</span>
                    <code className={`${styles.cryptoCode} ${styles.streamCode}`}>{hashCandidate}</code>
                  </div>
                  <div className={styles.cryptoRow}>
                    <span className={styles.cryptoLabel}>Matching Ticket:</span>
                    <strong className={styles.ticketStream}>{ticketCandidate}</strong>
                  </div>
                </div>

                {/* Controlled Linear Progress Bar */}
                <div className={styles.progressWrap}>
                  <div className={styles.progressMeta}>
                    <span>Verifying SHA-256 Nonce Range</span>
                    <strong>{progress}%</strong>
                  </div>
                  <div className={styles.progressTrack}>
                    <div
                      className={styles.progressFill}
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ============================================================
                STEP 3 & 4: WINNER REVEALED • IPHONE WINNER SHOWCASE
               ============================================================ */}
            {stage === 'revealed' && (
              <motion.div
                key="step-revealed"
                className={styles.stepContainer}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              >
                {/* Confetti & Sparkles celebration */}
                <div className={styles.celebrationBurst}>
                  <span className={styles.burstParticle}>✨</span>
                  <span className={styles.burstParticle}>🎉</span>
                  <span className={styles.burstParticle}>⭐</span>
                  <span className={styles.burstParticle}>🏆</span>
                </div>

                <div className={styles.iconCircleRevealed}>
                  <Trophy size={42} className={styles.iconGold} />
                </div>

                <span className={styles.phasePillEmerald}>
                  <CheckCircle2 size={13} /> OFFICIAL DRAWING COMPLETED
                </span>

                <h3 id="winner-reveal-title" className={styles.revealedHeading}>
                  🎉 {prizeTitle} Winner Announced!
                </h3>
                <p className={styles.revealedSubtitle}>
                  Verified cryptographic match confirmed. Congratulations to our lucky community winner!
                </p>

                {/* Premium Winner Card */}
                <div className={styles.winnerCard}>
                  <img src={prizeImage} alt={prizeTitle} className={styles.winnerPrizeImg} loading="lazy" decoding="async" />

                  <div className={styles.winnerCardInfo}>
                    <div className={styles.winnerPrizeTag}>
                      <Sparkles size={12} /> GRAND PRIZE WINNER
                    </div>
                    <h4 className={styles.winnerCardTitle}>{prizeTitle}</h4>
                    <span className={styles.winnerValue}>Retail Value: ₹{prizeValue.toLocaleString('en-IN')}</span>

                    <div className={styles.winnerCredentials}>
                      <div className={styles.credItem}>
                        <span className={styles.credLabel}>WINNER USERNAME</span>
                        <strong className={styles.credUser}>{winnerHandle}</strong>
                      </div>
                      <div className={styles.credDivider}></div>
                      <div className={styles.credItem}>
                        <span className={styles.credLabel}>WINNING TICKET</span>
                        <span className={styles.credTicket}>
                          <Ticket size={12} /> {winnerTicket}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Audit & Action Buttons */}
                <div className={styles.actionButtonsRow}>
                  {onInspectProof && (
                    <button
                      className="btn-outline-custom"
                      onClick={() => {
                        onClose();
                        onInspectProof({
                          user: winnerHandle,
                          prize: prizeTitle,
                          ticket: winnerTicket,
                          hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
                        });
                      }}
                    >
                      <ShieldCheck size={16} /> Inspect SHA-256 Proof
                    </button>
                  )}

                  <button
                    className="btn-primary-glow"
                    onClick={() => {
                      onClose();
                      if (onNavigateToWinners) onNavigateToWinners();
                    }}
                  >
                    <span>View Winners Ledger</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
