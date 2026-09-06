import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, History, Search, ShieldCheck, Sparkles, Radio, Clock, ArrowRight } from 'lucide-react';
import WinnerCard from '../WinnerCard/WinnerCard';
import PreviousWinnerCard from '../PreviousWinnerCard/PreviousWinnerCard';
import Countdown from '../Countdown/Countdown';
import styles from './WinnersTabs.module.css';

/**
 * Requirement 46: Winners Tab State Synchronization
 * When the giveaway ends:
 * - Winners tab becomes automatically active / highlighted with live celebration indicator
 */

export default function WinnersTabs({
  giveaways = [],
  heroGiveaway = null,
  spotlightWinners = [],
  archiveWinners = [],
  onInspectProof,
  onOpenFairModal,
  onEnterGiveaway,
  currentTab = null
}) {
  const isEnded = heroGiveaway?.status === 'ended';
  const [activeTab, setActiveTab] = useState(isEnded ? 'spotlight' : 'current');
  const [archiveSearch, setArchiveSearch] = useState('');

  // Synchronize active tab when giveaway status changes
  useEffect(() => {
    if (isEnded) {
      setActiveTab('spotlight');
    }
  }, [isEnded]);

  useEffect(() => {
    if (currentTab) {
      setActiveTab(currentTab);
    }
  }, [currentTab]);

  const activeGiveaways = [
    ...(heroGiveaway ? [heroGiveaway] : []),
    ...giveaways
  ].filter(g => g.status === 'active' || !g.status);

  const archiveList = Array.isArray(archiveWinners) 
    ? archiveWinners 
    : (archiveWinners?.archiveWinners || archiveWinners?.winners || archiveWinners?.giveaways || []);

  const filteredArchive = archiveList.filter(item => {
    if (!archiveSearch.trim()) return true;
    const q = archiveSearch.toLowerCase();
    const userStr = String(item?.userName || item?.user || '');
    const prizeStr = String(item?.prizeTitle || item?.prize || '');
    const ticketStr = String(item?.ticketNumber || item?.ticket || '');
    return (
      userStr.toLowerCase().includes(q) ||
      prizeStr.toLowerCase().includes(q) ||
      ticketStr.toLowerCase().includes(q)
    );
  });

  return (
    <section className={styles.section} id="winners-section" aria-label="Winners & Live Draw Status">
      <div className="container-custom">
        {/* Section Header */}
        <div className={styles.header}>
          <div className={styles.titleWrap}>
            <span className={styles.tag}>
              <Trophy size={14} /> 100% VERIFIED DRAWINGS
            </span>
            <h2 className={styles.title}>Winners & Live Draw Status</h2>
            <p className={styles.subtitle}>
              Every drawing is immutably recorded with SHA-256 cryptographic verification and tracked fulfillment.
            </p>
          </div>

          {/* Tab Switcher */}
          <div className={styles.tabSwitcher} role="tablist">
            <button
              className={`${styles.tabBtn} ${activeTab === 'current' ? styles.tabActiveLive : ''}`}
              onClick={() => setActiveTab('current')}
              role="tab"
              aria-selected={activeTab === 'current'}
            >
              <span className={styles.liveDot}></span>
              <Radio size={14} /> Current Giveaway ({activeGiveaways.length > 0 ? 'Live' : 'Closed'})
            </button>
            <button
              className={`${styles.tabBtn} ${activeTab === 'spotlight' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('spotlight')}
              role="tab"
              aria-selected={activeTab === 'spotlight'}
            >
              <Sparkles size={14} />
              <span>Past Winners Spotlight</span>
              {isEnded && <span className={styles.newBadge}>NEW WINNER</span>}
            </button>
            <button
              className={`${styles.tabBtn} ${activeTab === 'archive' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('archive')}
              role="tab"
              aria-selected={activeTab === 'archive'}
            >
              <History size={14} />
              <span>Previous Winners ({archiveWinners.length})</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Current Active Giveaway Live Status */}
        {activeTab === 'current' && (
          <div className={styles.currentGiveawayWrap}>
            {/* Live Notice Banner */}
            <div className={styles.liveNoticeCard}>
              <div className={styles.liveNoticeContent}>
                <div className={styles.liveStatusRow}>
                  <span className={styles.liveTagPill}>
                    <span className={styles.pulseRadar}></span>
                    Status: {isEnded ? 'ENDED' : 'LIVE'}
                  </span>
                  <span className={styles.noticeHeading}>Current Giveaway Pool</span>
                </div>
                <h3 className={styles.liveNoticeTitle}>
                  {isEnded ? 'Current cycle drawing completed' : 'Giveaway is still live'}
                </h3>
                <p className={styles.liveNoticeDesc}>
                  {isEnded
                    ? 'Winners have been picked via provably fair RNG and published to the Spotlight and Archive tabs.'
                    : 'Winners will be announced automatically when the countdown timer expires. All drawings use provably fair SHA-256 cryptographic randomness.'}
                </p>
              </div>

              <div className={styles.liveNoticeMeta}>
                <div className={styles.announcementBox}>
                  <span className={styles.announcementLabel}>Winner Announcement</span>
                  <span className={styles.announcementText}>
                    {isEnded ? 'Available Now in Spotlight 🏆' : 'Coming after countdown reaches 00:00:00'}
                  </span>
                </div>
                {isEnded ? (
                  <button
                    className="btn-primary-custom"
                    onClick={() => setActiveTab('spotlight')}
                  >
                    View Declared Winners 🏆
                  </button>
                ) : (
                  <button
                    className="btn-primary-custom"
                    onClick={() => {
                      const el = document.getElementById('active-giveaways');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    Enter Active Giveaway <ArrowRight size={15} />
                  </button>
                )}
              </div>
            </div>

            {/* Current Active Pools Grid */}
            <div className={styles.activePrizesGrid}>
              {activeGiveaways.map((item) => (
                <div key={item.id} className={styles.activePrizeCard}>
                  <div className={styles.activePrizeTop}>
                    <img src={item.image} alt={item.title} className={styles.activePrizeImg} loading="lazy" decoding="async" />
                    <div className={styles.activePrizeInfo}>
                      <div className={styles.activePrizeBadgeRow}>
                        {item.prizeTier && (
                          <span className={styles.activePrizeTier}>{item.prizeTier}</span>
                        )}
                        <span className={styles.activeStatusBadge}>
                          <span className={styles.miniDot}></span> Status: LIVE
                        </span>
                      </div>
                      <h4 className={styles.activePrizeTitle}>{item.title}</h4>
                      <span className={styles.activePrizeVal}>
                        Est. Value: ₹{item.valueUSD.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  <div className={styles.activePrizeFooter}>
                    <div className={styles.activeTimeBox}>
                      <span className={styles.metaSmall}>TIME REMAINING</span>
                      <Countdown targetDate={item.endsAt} compact={true} />
                    </div>
                    <div className={styles.activeDrawStatusBox}>
                      <span className={styles.metaSmall}>WINNER ANNOUNCEMENT</span>
                      <span className={styles.pendingStatusText}>
                        <Clock size={12} /> Pending Draw
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Spotlight Winners */}
        {activeTab === 'spotlight' && (
          <motion.div
            className={styles.spotlightGrid}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            {spotlightWinners.map(winner => (
              <WinnerCard
                key={winner.id}
                winner={winner}
                onInspectProof={onInspectProof}
              />
            ))}
          </motion.div>
        )}

        {/* Tab 3: Previous Winners Archive */}
        {activeTab === 'archive' && (
          <motion.div
            className={styles.archiveWrap}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <div className={styles.archiveToolbar}>
              <div className={styles.searchWrap}>
                <Search size={15} className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Search winner by handle, ticket ID, or prize..."
                  value={archiveSearch}
                  onChange={(e) => setArchiveSearch(e.target.value)}
                  className={styles.searchInput}
                  aria-label="Search previous winners"
                />
              </div>

              <button className="btn-outline-custom" onClick={onOpenFairModal}>
                <ShieldCheck size={16} /> Provably Fair Explainer
              </button>
            </div>

            <PreviousWinnerCard archiveWinners={filteredArchive} />
          </motion.div>
        )}
      </div>
    </section>
  );
}
