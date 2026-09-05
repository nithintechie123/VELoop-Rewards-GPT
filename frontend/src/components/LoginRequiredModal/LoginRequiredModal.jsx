import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, LogIn, UserPlus, X, Sparkles, ShieldAlert } from 'lucide-react';
import { soundFx } from '../../utils/soundFx';
import styles from './LoginRequiredModal.module.css';

/**
 * Requirement 98: Login Requirement Modal
 * If a visitor is not logged in and clicks the join button:
 * - Login Required
 * - Please login to your VELOOP Rewards account before participating in this giveaway.
 * - [ Login ]
 * - [ Create Account ]
 * - Redirects to /login page with return path
 */
export default function LoginRequiredModal({
  isOpen,
  onClose,
  giveawayTitle
}) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentPath = encodeURIComponent(location.pathname);

  const handleGoToLogin = (mode = 'login') => {
    soundFx.playClick();
    onClose();
    navigate(`/login?mode=${mode}&redirect=${currentPath}`);
  };

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
        aria-labelledby="login-req-title"
      >
        <motion.div
          className={styles.modal}
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
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

          {/* Lock Icon Spotlight */}
          <div className={styles.iconCircleWrap}>
            <div className={styles.iconPulseRing}></div>
            <div className={styles.iconBox}>
              <Lock size={32} className={styles.iconGold} />
            </div>
          </div>

          {/* Heading */}
          <div className={styles.textCenterWrap}>
            <div className={styles.authBadgeRow}>
              <span className={styles.authBadge}>
                <ShieldAlert size={12} /> AUTHENTICATION REQUIRED
              </span>
            </div>
            <h3 className={styles.title} id="login-req-title">
              Login Required
            </h3>
            <p className={styles.description}>
              Please login to your <strong>VELOOP Rewards</strong> account before participating in {giveawayTitle ? `the ${giveawayTitle} giveaway.` : 'this giveaway.'}
            </p>
          </div>

          {/* Security Notice */}
          <div className={styles.securityNotice}>
            <Sparkles size={16} className={styles.iconEmerald} />
            <p>
              Verified member accounts receive <strong>100% Free Daily Baseline Entries</strong> and live cryptographic draw receipts.
            </p>
          </div>

          {/* Action Buttons */}
          <div className={styles.actionRow}>
            <button
              className={styles.loginBtn}
              onClick={() => handleGoToLogin('login')}
            >
              <LogIn size={18} />
              <span>Login</span>
            </button>

            <button
              className={styles.signupBtn}
              onClick={() => handleGoToLogin('signup')}
            >
              <UserPlus size={18} />
              <span>Create Account</span>
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
