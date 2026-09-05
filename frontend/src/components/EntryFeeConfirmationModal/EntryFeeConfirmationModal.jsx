import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Sparkles,
  Coins,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Zap,
  Ticket,
  Flame,
  Check
} from 'lucide-react';
import { soundFx } from '../../utils/soundFx';
import { ConfettiManager } from '../../utils/confetti';
import { validateUserCurrencyBalance } from '../../utils/prizeTypeUtils';
import styles from './EntryFeeConfirmationModal.module.css';

/**
 * Requirement 94, 95, & 96: Entry Fee Confirmation & Successful Join State
 * After confirmation, transitions into a premium success state:
 * - 🎉 You're In!
 * - Your participation for the [Prize Name] giveaway has been successfully recorded.
 * - Entry Fee: [250 VEs / 500 SVEs / 2,000 Tokens]
 * - Good luck! 🍀
 * - [ View Giveaway ] button with celebration particles
 */
export default function EntryFeeConfirmationModal({
  isOpen,
  onClose,
  giveaway,
  userState,
  onConfirmJoin
}) {
  const [isSuccess, setIsSuccess] = useState(false);
  const [ticketCode, setTicketCode] = useState(null);

  useEffect(() => {
    if (!isOpen) {
      setIsSuccess(false);
      setTicketCode(null);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !giveaway) return null;

  // Dynamic Currency Validation & Breakdown
  const validation = validateUserCurrencyBalance(userState, giveaway);
  const { feeUnit, feeAmount, currentBalance, hasEnoughBalance, difference } = validation;
  const balanceAfter = Math.max(0, currentBalance - feeAmount);

  // Currency specific theme attributes
  const isSVEs = feeUnit === 'SVEs';
  const isTokens = feeUnit === 'Tokens';
  const currencyColor = isSVEs ? '#34d399' : isTokens ? '#38bdf8' : '#fbbf24';
  const currencyBadgeBg = isSVEs ? 'rgba(16, 185, 129, 0.15)' : isTokens ? 'rgba(56, 189, 248, 0.15)' : 'rgba(245, 158, 11, 0.15)';
  const currencyBorder = isSVEs ? 'rgba(16, 185, 129, 0.35)' : isTokens ? 'rgba(56, 189, 248, 0.35)' : 'rgba(245, 158, 11, 0.35)';

  const handleConfirm = () => {
    if (!hasEnoughBalance) {
      soundFx.playClick();
      return;
    }

    const generatedCode = `#VEL-${Math.floor(10000 + Math.random() * 90000)}-US`;
    setTicketCode(generatedCode);
    setIsSuccess(true);

    soundFx.playCoin();
    setTimeout(() => {
      soundFx.playCelebration();
      ConfettiManager.burst(window.innerWidth / 2, window.innerHeight / 2, 90);
    }, 120);

    onConfirmJoin({
      giveawayId: giveaway.id,
      feeAmount,
      feeUnit,
      newBalance: balanceAfter,
      ticketCode: generatedCode
    });
  };

  const prizeDisplayName = giveaway.title.replace(/^Win an?\s+/i, '');

  return (
    <AnimatePresence>
      <motion.div
        className={styles.overlay}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby={isSuccess ? "success-modal-title" : "confirm-modal-title"}
      >
        <motion.div
          className={`${styles.modal} ${isSuccess ? styles.modalSuccess : ''}`}
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          onClick={(e) => e.stopPropagation()}
        >
          {isSuccess ? (
            /* Requirement 96: Premium Successful Join State */
            <motion.div
              className={styles.successContainer}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35 }}
            >
              {/* Close Button */}
              <div className={styles.successCloseRow}>
                <motion.button
                  className={styles.closeBtn}
                  whileHover={{ rotate: 90, scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    soundFx.playClick();
                    onClose();
                  }}
                  aria-label="Close modal"
                >
                  <X size={18} />
                </motion.button>
              </div>

              {/* Animated Success Badge with Ripple */}
              <div className={styles.successAnimationWrap}>
                <div className={styles.rippleCircle}></div>
                <div className={styles.rippleCircle2}></div>
                <motion.div
                  className={styles.successIconCircle}
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', damping: 15, stiffness: 300, delay: 0.1 }}
                >
                  <Check size={38} className={styles.successCheckIcon} />
                </motion.div>
              </div>

              {/* Success Heading */}
              <h3 className={styles.successTitle} id="success-modal-title">
                🎉 You're In!
              </h3>

              {/* Participation Message */}
              <p className={styles.successMessage}>
                Your participation for the <strong className={styles.highlightPrize}>{prizeDisplayName} giveaway</strong> has been successfully recorded.
              </p>

              {/* Entry Fee & Ticket Details Card */}
              <div className={styles.successDetailCard}>
                <div className={styles.successDetailRow}>
                  <span className={styles.successDetailLabel}>Entry Fee:</span>
                  <strong className={styles.successFeeVal} style={{ color: currencyColor }}>
                    {feeAmount.toLocaleString()} {feeUnit}
                  </strong>
                </div>

                {ticketCode && (
                  <div className={styles.successDetailRow}>
                    <span className={styles.successDetailLabel}>Ticket ID:</span>
                    <span className={styles.ticketBadge}>
                      <Ticket size={13} /> {ticketCode}
                    </span>
                  </div>
                )}
              </div>

              {/* Good Luck Note */}
              <div className={styles.goodLuckRow}>
                <Sparkles size={16} className={styles.iconGold} />
                <span>Good luck! 🍀</span>
              </div>

              {/* Action Button: View Giveaway */}
              <button
                className={styles.viewGiveawayBtn}
                onClick={() => {
                  soundFx.playClick();
                  onClose();
                }}
              >
                <span>View Giveaway</span>
                <ArrowRight size={16} />
              </button>
            </motion.div>
          ) : (
            /* Confirmation Form View (Requirement 94 & 95) */
            <>
              {/* Header */}
              <div className={styles.header}>
                <div className={styles.headerTitleWrap}>
                  <div className={styles.headerIconBox}>
                    <Ticket size={20} className={styles.iconGold} />
                  </div>
                  <div>
                    <h3 className={styles.title} id="confirm-modal-title">
                      Confirm Participation
                    </h3>
                    <p className={styles.subtitle}>Review transaction details before entering</p>
                  </div>
                </div>
                <motion.button
                  className={styles.closeBtn}
                  whileHover={{ rotate: 90, scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    soundFx.playClick();
                    onClose();
                  }}
                  aria-label="Close modal"
                >
                  <X size={18} />
                </motion.button>
              </div>

              {/* Prize Spotlight Row */}
              <div className={styles.prizeRow}>
                {giveaway.image && (
                  <img
                    src={giveaway.image}
                    alt={giveaway.title}
                    className={styles.prizeThumb}
                  />
                )}
                <div className={styles.prizeMeta}>
                  <span className={styles.prizeEmojiTag}>🎁 REWARD ITEM</span>
                  <h4 className={styles.prizeName}>{giveaway.title}</h4>
                  <span className={styles.prizeValueTag}>
                    Retail MSRP: ₹{(giveaway.valueUSD || 44900).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Requirement 95: Currency Indicator Tag */}
              <div
                className={styles.currencyIndicatorTag}
                style={{
                  background: currencyBadgeBg,
                  borderColor: currencyBorder,
                  color: currencyColor
                }}
              >
                {isSVEs ? <Sparkles size={14} /> : isTokens ? <Flame size={14} /> : <Coins size={14} />}
                <span>
                  Required Currency: <strong>{feeUnit} ({isSVEs ? 'Super VELoop Coins' : isTokens ? 'Reward Tokens' : 'VELoop Coins'})</strong>
                </span>
              </div>

              {/* Balance & Fee Breakdown Table */}
              <div className={styles.breakdownCard}>
                <div className={styles.breakdownRow}>
                  <span className={styles.rowLabel}>Entry Fee</span>
                  <strong className={styles.rowFeeHighlight} style={{ color: currencyColor }}>
                    {feeAmount.toLocaleString()} {feeUnit}
                  </strong>
                </div>

                <div className={styles.breakdownDivider}></div>

                <div className={styles.breakdownRow}>
                  <span className={styles.rowLabel}>Your Balance</span>
                  <strong className={styles.rowBalance}>
                    {currentBalance.toLocaleString()} {feeUnit}
                  </strong>
                </div>

                <div className={styles.breakdownDivider}></div>

                <div className={styles.breakdownRow}>
                  <span className={styles.rowLabel}>Balance After Joining</span>
                  <strong className={`${styles.rowBalanceAfter} ${!hasEnoughBalance ? styles.insufficient : ''}`}>
                    {hasEnoughBalance ? `${balanceAfter.toLocaleString()} ${feeUnit}` : 'Insufficient Balance'}
                  </strong>
                </div>
              </div>

              {/* Warning notice if insufficient balance */}
              {!hasEnoughBalance && (
                <div className={styles.warningBox}>
                  <AlertTriangle size={18} className={styles.iconWarning} />
                  <div>
                    <strong>Insufficient {feeUnit}</strong>
                    <p>You need {difference.toLocaleString()} more {feeUnit} to participate.</p>
                  </div>
                </div>
              )}

              {/* Terms Acknowledgment Text */}
              <div className={styles.termsNotice}>
                <ShieldCheck size={16} className={styles.iconEmerald} />
                <p>
                  By continuing, you confirm that you have reviewed the giveaway rules and terms.
                </p>
              </div>

              {/* Modal Actions */}
              <div className={styles.actionRow}>
                <button
                  className={styles.cancelBtn}
                  onClick={() => {
                    soundFx.playClick();
                    onClose();
                  }}
                >
                  Cancel
                </button>

                <button
                  className={`${styles.confirmBtn} ${!hasEnoughBalance ? styles.disabledBtn : ''}`}
                  onClick={handleConfirm}
                  disabled={!hasEnoughBalance}
                >
                  <Zap size={16} />
                  <span>Confirm & Join</span>
                </button>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

