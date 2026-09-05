import React from 'react';
import { motion } from 'framer-motion';
import { Eye, ShieldCheck, Scale, Award, CheckCircle2, FileText } from 'lucide-react';
import styles from './TrustSection.module.css';

/**
 * Requirement 43: Dedicated Trust Section
 * - 100% Transparent: Giveaway rules are clearly displayed.
 * - Secure: User information is handled responsibly.
 * - Fair Participation: Participation rules are clearly explained.
 * - Reward Transparency: Prize information is clearly displayed.
 */
export default function TrustSection({ onOpenRules, onOpenFairVerifier }) {
  const trustPoints = [
    {
      id: 'transparency',
      icon: <Eye size={24} className={styles.iconGold} />,
      title: '100% Transparent',
      desc: 'Giveaway rules are clearly displayed.',
      badge: 'Certified Rules',
      accentColor: 'gold'
    },
    {
      id: 'security',
      icon: <ShieldCheck size={24} className={styles.iconEmerald} />,
      title: 'Secure',
      desc: 'User information is handled responsibly.',
      badge: 'Privacy Shield',
      accentColor: 'emerald'
    },
    {
      id: 'fairness',
      icon: <Scale size={24} className={styles.iconCyan} />,
      title: 'Fair Participation',
      desc: 'Participation rules are clearly explained.',
      badge: 'Equal Odds',
      accentColor: 'cyan'
    },
    {
      id: 'rewards',
      icon: <Award size={24} className={styles.iconPurple} />,
      title: 'Reward Transparency',
      desc: 'Prize information is clearly displayed.',
      badge: 'Verified Values',
      accentColor: 'purple'
    }
  ];

  return (
    <section className={styles.trustSection} aria-label="Trust, Security and Transparency Pillars">
      <div className="container-custom">
        <motion.div
          className={styles.trustBanner}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5 }}
        >
          {/* Section Header */}
          <div className={styles.bannerHeader}>
            <span className={styles.tag}>
              <CheckCircle2 size={13} /> VELOOP REWARDS INTEGRITY STANDARD
            </span>
            <h3 className={styles.title}>Trust & Transparency First</h3>
            <p className={styles.desc}>
              Every sweepstakes pool is governed by open rules, responsible data privacy practices, and verified reward disclosures.
            </p>
          </div>

          {/* 4 Trust Pillars Grid (Requirement 43) */}
          <div className={styles.grid}>
            {trustPoints.map((point) => (
              <motion.div
                key={point.id}
                className={styles.itemCard}
                whileHover={{ y: -3, transition: { duration: 0.2 } }}
              >
                <div className={`${styles.iconWrap} ${styles[`wrap_${point.accentColor}`]}`}>
                  {point.icon}
                </div>

                <div className={styles.info}>
                  <div className={styles.cardHeaderRow}>
                    <h4 className={styles.cardTitle}>{point.title}</h4>
                    <span className={`${styles.pointBadge} ${styles[`badge_${point.accentColor}`]}`}>
                      {point.badge}
                    </span>
                  </div>
                  <p className={styles.cardDesc}>{point.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Trust Actions & Compliance Strip */}
          <div className={styles.complianceFooter}>
            <div className={styles.compliancePills}>
              <span>✓ Official Manufacturer Warranties</span>
              <span>•</span>
              <span>✓ Insured Air Express Transit</span>
              <span>•</span>
              <span>✓ Cryptographic Hash Verification</span>
            </div>

            {onOpenRules && (
              <button className={styles.rulesBtn} onClick={onOpenRules}>
                <FileText size={14} />
                <span>View Full Sweepstakes Rules</span>
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
