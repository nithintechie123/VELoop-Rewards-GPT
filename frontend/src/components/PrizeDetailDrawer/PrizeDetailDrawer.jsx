import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Trophy,
  Sparkles,
  ShieldCheck,
  Zap,
  Clock,
  CheckCircle2,
  TrendingUp,
  Percent,
  Calendar,
  Layers,
  Package
} from 'lucide-react';
import { soundFx } from '../../utils/soundFx';
import { getPrizeTypeConfig } from '../../utils/prizeTypeUtils';
import styles from './PrizeDetailDrawer.module.css';

/**
 * Requirement 78: Creative Freedom - Prize Detail Drawer
 * Features:
 * - High-res product showcase with interactive glare
 * - Technical specifications & retail value breakdown
 * - Live Entry Progress Bar (Tickets claimed vs pool capacity)
 * - "Your Chance of Winning" probability indicator & tier placement
 * - 4-Step Giveaway Timeline milestone stepper
 * - Integrated Participation & Quest CTA
 */
export default function PrizeDetailDrawer({
  isOpen,
  onClose,
  prize,
  userEntryCount = 0,
  totalPoolTickets = 18450,
  poolCapacity = 25000,
  onEnter,
  onOpenRules,
  onOpenFairModal
}) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'specs' | 'timeline' | 'odds'

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !prize) return null;

  const entryRequirement = prize.joiningRequirement || (prize.entryFee ? `${prize.entryFee} ${prize.entryFeeUnit || 'VEs'}` : '250 VEs');
  const prizeConfig = getPrizeTypeConfig(prize);
  const totalTickets = prize.totalTickets || totalPoolTickets || 14200;
  const userTickets = userEntryCount;
  const capacity = prize.poolCap || poolCapacity || 25000;
  const fillPercent = Math.min(100, Math.round((totalTickets / capacity) * 100));

  // Probability calculations
  const oddsFraction = userTickets > 0 ? (totalTickets > 0 ? (userTickets / totalTickets) * 100 : 0) : 0;
  const formattedOdds = oddsFraction > 0 ? oddsFraction.toFixed(3) : '0.000';
  const oneInN = oddsFraction > 0 ? Math.round(totalTickets / userTickets) : totalTickets;

  return (
    <AnimatePresence>
      <div className={styles.backdrop} onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="drawer-prize-title">
        <motion.div
          className={styles.drawer}
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 26, stiffness: 280 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Bar */}
          <div className={styles.header}>
            <div className={styles.headerLeft}>
              <span className={`${styles.tierBadge} ${styles[`tier_${prize.accentTheme || 'purple'}`]}`}>
                <Trophy size={13} /> {prize.prizeTier || prize.tier || 'Featured Prize'}
              </span>
              <span className={styles.winnerCountBadge}>
                {prize.winnerLabel || (prize.winnerCount ? `${prize.winnerCount} Winner${prize.winnerCount > 1 ? 's' : ''}` : '1 Winner')}
              </span>
            </div>
            <button className={styles.closeBtn} onClick={onClose} aria-label="Close prize details drawer">
              <X size={20} />
            </button>
          </div>

          {/* Drawer Body Scrollable */}
          <div className={styles.body}>
            {/* Prize Hero Showcase */}
            <div className={styles.showcaseWrap}>
              <div className={styles.imageBox}>
                <img src={prize.image} alt={prize.title} className={styles.prizeImg} loading="lazy" decoding="async" />
                <div className={styles.imageGlow}></div>
              </div>

              <div className={styles.titleInfo}>
                <h2 className={styles.prizeTitle} id="drawer-prize-title">{prize.title}</h2>
                <div className={styles.valRow}>
                  <span className={styles.retailVal}>
                    Retail Value: <strong>₹{(prize.valueUSD || 44900).toLocaleString('en-IN')}</strong>
                  </span>
                  <span className={styles.freePill}>
                    <ShieldCheck size={13} className={styles.iconEmerald} /> 100% Free Entry Tier
                  </span>
                </div>
                <p className={styles.descText}>{prize.description || prize.subtitle}</p>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className={styles.tabNav}>
              <button
                className={`${styles.tabBtn} ${activeTab === 'overview' ? styles.tabBtnActive : ''}`}
                onClick={() => { soundFx.playClick(); setActiveTab('overview'); }}
              >
                <Layers size={14} /> Overview
              </button>
              <button
                className={`${styles.tabBtn} ${activeTab === 'odds' ? styles.tabBtnActive : ''}`}
                onClick={() => { soundFx.playClick(); setActiveTab('odds'); }}
              >
                <Percent size={14} /> Your Chance ({formattedOdds}%)
              </button>
              <button
                className={`${styles.tabBtn} ${activeTab === 'timeline' ? styles.tabBtnActive : ''}`}
                onClick={() => { soundFx.playClick(); setActiveTab('timeline'); }}
              >
                <Calendar size={14} /> Timeline
              </button>
            </div>

            {/* Tab 1: Overview */}
            {activeTab === 'overview' && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={styles.tabContent}>
                {/* Live Entry Pool Progress Gauge */}
                <div className={styles.progressCard}>
                  <div className={styles.progressHeader}>
                    <div>
                      <span className={styles.progressLabel}>ENTRY POOL CAPACITY</span>
                      <strong className={styles.progressStat}>{totalTickets.toLocaleString()} / {capacity.toLocaleString()} Tickets</strong>
                    </div>
                    <span className={styles.progressPercentBadge}>{fillPercent}% Filled</span>
                  </div>
                  <div className={styles.progressBarTrack}>
                    <motion.div
                      className={styles.progressBarFill}
                      initial={{ width: 0 }}
                      animate={{ width: `${fillPercent}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                    />
                  </div>
                  <div className={styles.progressFootnote}>
                    <span>Pool closes when countdown expires.</span>
                    <span className={styles.activeUsersPill}><Zap size={11} /> High Activity</span>
                  </div>
                </div>

                {/* Fulfillment Specification Matrix */}
                <div className={styles.specGrid}>
                  <div className={styles.specItem}>
                    <span className={styles.specLabel}>FULFILLMENT TYPE</span>
                    <strong className={styles.specVal}>{prizeConfig.badgeText}</strong>
                  </div>
                  <div className={styles.specItem}>
                    <span className={styles.specLabel}>ESTIMATED DELIVERY</span>
                    <strong className={styles.specVal}>{prizeConfig.deliveryEstimate}</strong>
                  </div>
                  <div className={styles.specItem}>
                    <span className={styles.specLabel}>DRAW VERIFICATION</span>
                    <strong className={styles.specVal}>SHA-256 Provably Fair</strong>
                  </div>
                  <div className={styles.specItem}>
                    <span className={styles.specLabel}>SHIPPING INSURANCE</span>
                    <strong className={styles.specVal}>100% Insured Transit</strong>
                  </div>
                </div>

                {/* Hardware Highlights */}
                <div className={styles.featureBox}>
                  <h4 className={styles.featureHeading}>📦 Included in Reward Package</h4>
                  <ul className={styles.featureList}>
                    <li>Brand New Factory-Sealed Box with Official Manufacturer Warranty</li>
                    <li>All standard accessories, power adapters & magnetic charging cables</li>
                    <li>Complimentary 1-Year VIP VELoop Care & Replacement Protection</li>
                    <li>Direct express doorstep delivery via FedEx / Blue Dart Air</li>
                  </ul>
                </div>
              </motion.div>
            )}

            {/* Tab 2: Your Chance Calculator */}
            {activeTab === 'odds' && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={styles.tabContent}>
                <div className={styles.oddsCard}>
                  <div className={styles.oddsHeader}>
                    <div className={styles.oddsIconCircle}>
                      <TrendingUp size={24} className={styles.iconGold} />
                    </div>
                    <div>
                      <h4 className={styles.oddsTitle}>Personalized Odds Engine</h4>
                      <p className={styles.oddsSub}>Cryptographic calculation based on your active ticket stake.</p>
                    </div>
                  </div>

                  <div className={styles.oddsMetricsGrid}>
                    <div className={styles.oddsMetric}>
                      <span className={styles.oddsMetricLabel}>YOUR ACTIVE TICKETS</span>
                      <strong className={styles.oddsMetricVal}>{userTickets} 🎟️</strong>
                    </div>
                    <div className={styles.oddsMetric}>
                      <span className={styles.oddsMetricLabel}>WINNING PROBABILITY</span>
                      <strong className={styles.oddsMetricHighlight}>{formattedOdds}%</strong>
                    </div>
                    <div className={styles.oddsMetric}>
                      <span className={styles.oddsMetricLabel}>RATIO ODDS</span>
                      <strong className={styles.oddsMetricVal}>{userTickets > 0 ? `1 in ${oneInN}` : 'Join to calculate'}</strong>
                    </div>
                    <div className={styles.oddsMetric}>
                      <span className={styles.oddsMetricLabel}>TIER ADVANTAGE</span>
                      <strong className={styles.oddsMetricVal}>{userTickets >= 5 ? 'Top 10% Contender 🌟' : userTickets > 0 ? 'Standard Stake' : 'Unranked'}</strong>
                    </div>
                  </div>

                  <div className={styles.boostNotice}>
                    <Sparkles size={16} className={styles.iconGold} />
                    <div>
                      <strong>Want to 3X Your Winning Odds?</strong>
                      <p>Complete daily bonus quests to earn extra tickets and improve your probability ratio.</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Tab 3: Giveaway Timeline */}
            {activeTab === 'timeline' && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={styles.tabContent}>
                <div className={styles.timelineList}>
                  <div className={`${styles.timelineItem} ${styles.timelineItemDone}`}>
                    <div className={styles.timelineIcon}><CheckCircle2 size={16} /></div>
                    <div className={styles.timelineBody}>
                      <div className={styles.timelineHeader}>
                        <h5>Phase 1: Pool Open & Free Entry</h5>
                        <span className={styles.timelineDate}>Aug 1, 2026</span>
                      </div>
                      <p>Public registration opened with 100% free baseline tickets for all community members.</p>
                    </div>
                  </div>

                  <div className={`${styles.timelineItem} ${styles.timelineItemActive}`}>
                    <div className={styles.timelineIcon}><Zap size={16} /></div>
                    <div className={styles.timelineBody}>
                      <div className={styles.timelineHeader}>
                        <h5>Phase 2: Quest Multipliers Active</h5>
                        <span className={styles.timelineDate}>Active Now</span>
                      </div>
                      <p>Community bonus quests and streak multipliers are live to earn extra tickets.</p>
                    </div>
                  </div>

                  <div className={styles.timelineItem}>
                    <div className={styles.timelineIcon}><Clock size={16} /></div>
                    <div className={styles.timelineBody}>
                      <div className={styles.timelineHeader}>
                        <h5>Phase 3: Countdown Expiration & Pool Lock</h5>
                        <span className={styles.timelineDate}>Aug 10, 2026 • 23:59 IST</span>
                      </div>
                      <p>All ticket submissions freeze permanently. Server seed hash and client entropy are locked.</p>
                    </div>
                  </div>

                  <div className={styles.timelineItem}>
                    <div className={styles.timelineIcon}><Trophy size={16} /></div>
                    <div className={styles.timelineBody}>
                      <div className={styles.timelineHeader}>
                        <h5>Phase 4: Cryptographic SHA-256 Draw</h5>
                        <span className={styles.timelineDate}>Immediately Following Lock</span>
                      </div>
                      <p>Provably fair algorithm selects verified winning tickets; winner portal activates instantly.</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Drawer Footer CTA */}
          <div className={styles.footer}>
            <div className={styles.footerLeft}>
              <span className={styles.footerUserStatus}>
                {userTickets > 0 ? (
                  <><strong>{userTickets} Tickets</strong> registered in this draw</>
                ) : (
                  <>No tickets yet • Free entry open</>
                )}
              </span>
            </div>
            <div className={styles.footerActions}>
              <button
                className="btn-outline-custom"
                onClick={() => { soundFx.playClick(); if (onOpenFairModal) onOpenFairModal(); }}
                style={{ padding: '0.65rem 1rem', fontSize: '0.85rem' }}
              >
                <ShieldCheck size={14} /> Audit Proof
              </button>
              <button
                className="btn-primary-glow"
                onClick={() => {
                  soundFx.playClick();
                  onClose();
                  if (onEnter) onEnter(prize.id);
                }}
                style={{ padding: '0.65rem 1.4rem', fontSize: '0.9rem' }}
              >
                <Zap size={16} />
                <span>{userTickets > 0 ? 'Earn More Entries →' : `Join for ${entryRequirement}`}</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
