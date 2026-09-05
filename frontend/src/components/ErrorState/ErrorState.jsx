import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, RefreshCw, ShieldAlert, ArrowRight } from 'lucide-react';
import { soundFx } from '../../utils/soundFx';
import styles from './ErrorState.module.css';

/**
 * Requirement 66: Error State
 * Example:
 * We couldn't load the giveaway information.
 * [Try Again]
 * Do not show raw JavaScript/API errors.
 */

export default function ErrorState({
  title = "We couldn't load the giveaway information.",
  subtitle = "Something went wrong while connecting to the prize vault. Please check your network or try again.",
  onRetry,
  onReset
}) {
  const handleRetry = () => {
    soundFx.playClick();
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  return (
    <section className={styles.errorSection} aria-label="Error loading giveaway">
      <div className="container-custom">
        <motion.div
          className={styles.errorCard}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4, type: 'spring', damping: 22 }}
        >
          <div className={styles.ambientAura}></div>

          <div className={styles.iconRing}>
            <AlertCircle size={44} className={styles.errorIcon} />
          </div>

          <div className={styles.badgeWrap}>
            <span className={styles.errorBadge}>
              <ShieldAlert size={13} /> CONNECTION ERROR
            </span>
          </div>

          <h2 className={styles.errorTitle}>{title}</h2>
          <p className={styles.errorSubtitle}>{subtitle}</p>

          <div className={styles.actionRow}>
            <motion.button
              className={`${styles.retryBtn} btn-primary-glow`}
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.96 }}
              onClick={handleRetry}
              aria-label="Try loading giveaway information again"
            >
              <RefreshCw size={17} />
              <span>Try Again</span>
            </motion.button>

            {onReset && (
              <motion.button
                className={styles.resetBtn}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                onClick={onReset}
              >
                <span>Reset Demo Environment</span>
              </motion.button>
            )}
          </div>

          <span className={styles.friendlyNote}>
            🛡️ Your participation entries and loyalty coins remain safely verified on the blockchain.
          </span>
        </motion.div>
      </div>
    </section>
  );
}
