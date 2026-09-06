import React from 'react';
import { motion } from 'framer-motion';
import { Gift, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';
import { soundFx } from '../../utils/soundFx';
import { ConfettiManager } from '../../utils/confetti';
import styles from './PreFooterCTA.module.css';

export default function PreFooterCTA({ onClaimFreeEntry, onOpenFairVerifier, onOpenRules }) {
  const handleClaim = () => {
    soundFx.playFanfare();
    ConfettiManager.burst(window.innerWidth / 2, window.innerHeight / 2, 100);
    if (onClaimFreeEntry) onClaimFreeEntry();
  };

  const handleVerify = () => {
    soundFx.playClick();
    if (onOpenFairVerifier) onOpenFairVerifier();
  };

  return (
    <section className={styles.ctaSection} aria-label="Join Sweepstakes Call to Action">
      <div className="container-custom">
        <motion.div
          className={styles.ctaCard}
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          {/* Ambient Glows */}
          <div className={styles.glowLeft}></div>
          <div className={styles.glowRight}></div>

          <div className={styles.content}>
            <div className={styles.badgeRow}>
              <span className={styles.badge}>
                <Sparkles size={13} className={styles.iconGold} />
                100% FREE PARTICIPATION GUARANTEED
              </span>
              <span className={styles.badgeSec}>
                <ShieldCheck size={13} className={styles.iconEmerald} />
                NO PURCHASE NECESSARY
              </span>
            </div>

            <h2 className={styles.heading}>
              Ready to Win Your <span className={styles.gradientText}>Dream Reward?</span>
            </h2>

            <p className={styles.subtext}>
              Join over <strong>8,500+</strong> active participants in our certified sweepstakes draws.
              Collect free daily tickets, boost your odds with loyalty quests, and get verified rewards delivered directly to your doorstep.
            </p>

            <div className={styles.actions}>
              <motion.button
                className={`${styles.primaryBtn} btn-primary-glow`}
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleClaim}
              >
                <Gift size={18} />
                <span>Claim Today's Free Entry</span>
                <ArrowRight size={16} />
              </motion.button>

              <motion.button
                className={styles.secondaryBtn}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleVerify}
              >
                <ShieldCheck size={16} className={styles.iconCyan} />
                <span>Provably Fair Verifier</span>
              </motion.button>
            </div>

            <div className={styles.footerNote}>
              <span>✓ Insured Air Express Delivery</span>
              <span>•</span>
              <span>✓ Official Manufacturer Warranties</span>
              <span>•</span>
              <span>✓ SHA-256 Public Verification</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
