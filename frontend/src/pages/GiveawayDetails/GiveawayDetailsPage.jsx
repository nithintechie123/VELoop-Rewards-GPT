import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Trophy,
  ShieldCheck,
  Sparkles,
  Zap,
  Ticket,
  Clock,
  CheckCircle2,
  Share2,
  ExternalLink,
  Users,
  Award,
  Layers,
  ChevronRight,
  TrendingUp,
  Percent,
  Calendar,
  Gift,
  AlertCircle
} from 'lucide-react';
import Header from '../../components/Header/Header';
import Countdown from '../../components/Countdown/Countdown';
import PrizeCard from '../../components/PrizeCard/PrizeCard';
import { soundFx } from '../../utils/soundFx';
import { ConfettiManager } from '../../utils/confetti';
import { getPrizeTypeConfig } from '../../utils/prizeTypeUtils';
import {
  getGiveawayBySlug,
  mockActiveGiveaways,
  mockHeroGiveaway,
  mockQuestTasks
} from '../../data/giveawayData';
import styles from './GiveawayDetailsPage.module.css';

const ParticipationModal = lazy(() => import('../../components/ParticipationModal/ParticipationModal'));
const ProvablyFairModal = lazy(() => import('../../components/ProvablyFairModal/ProvablyFairModal'));
const GiveawayRules = lazy(() => import('../../components/GiveawayRules/GiveawayRules'));

export default function GiveawayDetailsPage() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [giveaway, setGiveaway] = useState(null);
  const [theme, setTheme] = useState(() => localStorage.getItem('veloop_theme') || 'dark');
  const [userState, setUserState] = useState({
    name: 'Alex Thorne',
    userId: 'VE10025',
    isLoggedIn: true,
    veloopCoins: 1450,
    userEntries: {
      'GW-2026-08': { tickets: 8, oddsMultiplier: 1.5 },
      'gw-iphone-titanium': { tickets: 6, oddsMultiplier: 2.0 },
      'gw-smartwatch-titanium': { tickets: 3, oddsMultiplier: 1.0 },
      'gw-audio-airpods': { tickets: 2, oddsMultiplier: 1.0 },
      'gw-gift-card-2000': { tickets: 10, oddsMultiplier: 3.0 },
      'gw-gift-card-500': { tickets: 5, oddsMultiplier: 1.5 },
      'gw-gift-card-20': { tickets: 1, oddsMultiplier: 1.0 },
      'gw-ps5-pro': { tickets: 4, oddsMultiplier: 1.0 }
    }
  });

  const [isParticipationOpen, setIsParticipationOpen] = useState(false);
  const [isFairOpen, setIsFairOpen] = useState(false);
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'specs' | 'odds' | 'rules'
  const [toast, setToast] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const found = getGiveawayBySlug(slug);
    if (found) {
      setGiveaway(found);
    }
  }, [slug]);

  const showToast = (title, desc, type = 'success') => {
    setToast({ title, desc, type });
    setTimeout(() => setToast(null), 4000);
  };

  if (!giveaway) {
    return (
      <div className={styles.notFoundWrap}>
        <AlertCircle size={48} className={styles.iconGold} />
        <h2>Giveaway Not Found</h2>
        <p>The requested giveaway identifier <code>/{slug}</code> is not available.</p>
        <Link to="/" className="btn-primary-glow">
          <ArrowLeft size={16} /> Return to All Giveaways
        </Link>
      </div>
    );
  }

  const prizeConfig = getPrizeTypeConfig(giveaway);
  const userEntryCount = userState.userEntries[giveaway.id]?.tickets || 0;
  const totalTickets = giveaway.totalTickets || 14210;
  const capacity = giveaway.poolCap || 25000;
  const fillPercent = Math.min(100, Math.round((totalTickets / capacity) * 100));

  // Probability calculations
  const oddsFraction = userEntryCount > 0 ? (totalTickets > 0 ? (userEntryCount / totalTickets) * 100 : 0) : 0;
  const formattedOdds = oddsFraction > 0 ? oddsFraction.toFixed(3) : '0.000';
  const oneInN = oddsFraction > 0 ? Math.round(totalTickets / userEntryCount) : totalTickets;

  const handleShare = () => {
    soundFx.playClick();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('🔗 Link Copied!', 'Direct giveaway URL copied to your clipboard.', 'info');
    }
  };

  const handleEnterSuccess = ({ ticketCount, addedTickets }) => {
    soundFx.playCelebration();
    ConfettiManager.burst();
    setUserState(prev => ({
      ...prev,
      userEntries: {
        ...prev.userEntries,
        [giveaway.id]: {
          tickets: ticketCount,
          oddsMultiplier: 2.0
        }
      }
    }));
    showToast('🎉 Entries Confirmed!', `Successfully registered ${addedTickets} tickets in ${giveaway.title}.`, 'success');
  };

  const relatedGiveaways = mockActiveGiveaways
    .filter(g => g.id !== giveaway.id && g.slug !== giveaway.slug)
    .slice(0, 3);

  return (
    <div className={styles.pageWrap}>
      {/* Header */}
      <Header
        isLoggedIn={userState.isLoggedIn}
        userName={userState.name}
        coins={userState.veloopCoins}
        onLogin={() => {}}
        onLogout={() => {}}
        onAddCoins={() => {}}
        onOpenRules={() => setIsRulesOpen(true)}
        theme={theme}
        onToggleTheme={() => {
          const next = theme === 'dark' ? 'light' : 'dark';
          setTheme(next);
          document.documentElement.setAttribute('data-theme', next);
          localStorage.setItem('veloop_theme', next);
        }}
        soundEnabled={true}
        onToggleSound={() => soundFx.toggle()}
      />

      <main className="container-custom" style={{ padding: '2rem 1.5rem 5rem' }}>
        {/* Breadcrumb Navigation */}
        <div className={styles.breadcrumbBar}>
          <Link to="/" className={styles.backLink}>
            <ArrowLeft size={16} /> All Giveaways
          </Link>
          <span className={styles.breadDivider}>/</span>
          <span className={styles.breadCategory}>{giveaway.category || 'Rewards'}</span>
          <span className={styles.breadDivider}>/</span>
          <span className={styles.breadCurrent}>{giveaway.title}</span>
        </div>

        {/* Hero Details Split Grid */}
        <div className={styles.heroGrid}>
          {/* Left Media Showcase */}
          <motion.div
            className={styles.mediaCard}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <div className={styles.mediaContainer}>
              <img
                src={giveaway.image}
                alt={giveaway.title}
                className={styles.mainImg}
                fetchPriority="high"
                decoding="async"
              />
              <div className={styles.mediaAmbientGlow}></div>

              {/* Floating Tier & Guarantee Badges */}
              <div className={styles.badgeOverlay}>
                <span className={`${styles.tierPill} ${styles[`tier_${giveaway.accentTheme || 'purple'}`]}`}>
                  <Trophy size={13} /> {giveaway.prizeTier || giveaway.badge || 'Featured Prize'}
                </span>
                <span className={styles.winnerPill}>
                  {giveaway.winnerLabel || (giveaway.winnerCount ? `${giveaway.winnerCount} Winner${giveaway.winnerCount > 1 ? 's' : ''}` : '1 Winner')}
                </span>
              </div>
            </div>

            {/* Quick Share / Trust Strip */}
            <div className={styles.mediaFooterStrip}>
              <div className={styles.trustItem}>
                <ShieldCheck size={16} className={styles.iconEmerald} />
                <span>100% Free Entry Tier</span>
              </div>
              <div className={styles.trustItem}>
                <Package size={16} className={styles.iconBlue} />
                <span>{prizeConfig.badgeText}</span>
              </div>
              <button className={styles.shareBtn} onClick={handleShare} aria-label="Share giveaway link">
                <Share2 size={15} /> Share
              </button>
            </div>
          </motion.div>

          {/* Right Content & Participation Hub */}
          <motion.div
            className={styles.infoCard}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
          >
            {/* Requirement 81: Individual Giveaway Page Header */}
            <div className={styles.badgeStripRow}>
              <span className={styles.exclusiveBadge}>
                <Sparkles size={13} className={styles.sparkleIcon} /> 🎁 EXCLUSIVE GIVEAWAY
              </span>
              <span className={styles.liveStatusPill}>
                <span className={styles.pulseDot}></span> ● GIVEAWAY LIVE
              </span>
              <span className={styles.valueTag}>
                Retail Value: <strong>₹{(giveaway.valueUSD || 44900).toLocaleString('en-IN')}</strong>
              </span>
            </div>

            <h1 className={styles.heading}>
              Win an {giveaway.title.replace(/^Win an?\s+/i, '')}
            </h1>
            <p className={styles.description}>
              Join this exclusive giveaway for a chance to win an {giveaway.title.replace(/^Win an?\s+/i, '')}. {giveaway.description || giveaway.subtitle}
            </p>

            {/* Requirement 80: High-Visibility Cost & Currency Callout Banner */}
            <div className={styles.costCalloutBanner}>
              <div className={styles.costItem}>
                <span className={styles.costLabel}>JOINING COST</span>
                <strong className={styles.costHighlightFree}>₹0.00 (100% FREE)</strong>
              </div>
              <div className={styles.costDivider}></div>
              <div className={styles.costItem}>
                <span className={styles.costLabel}>CURRENCY REQUIRED</span>
                <strong className={styles.costVal}>0 Real Money / 0 Cash</strong>
              </div>
              <div className={styles.costDivider}></div>
              <div className={styles.costItem}>
                <span className={styles.costLabel}>FREE DAILY ENTRY</span>
                <strong className={styles.costVal}>1 Ticket Guaranteed</strong>
              </div>
            </div>

            {/* Countdown Box */}
            <div className={styles.countdownWrapper}>
              <span className={styles.countdownLabel}>
                <Clock size={14} /> Ends in
              </span>
              <Countdown targetDate={giveaway.endDate || giveaway.endsAt} />
            </div>

            {/* Entry Pool Capacity Progress Bar */}
            <div className={styles.poolProgressWrap}>
              <div className={styles.poolProgressHead}>
                <span className={styles.poolLabel}>POOL CAPACITY</span>
                <strong className={styles.poolValue}>
                  {totalTickets.toLocaleString()} / {capacity.toLocaleString()} Tickets ({fillPercent}% Filled)
                </strong>
              </div>
              <div className={styles.poolTrack}>
                <motion.div
                  className={styles.poolFill}
                  initial={{ width: 0 }}
                  animate={{ width: `${fillPercent}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
              </div>
            </div>

            {/* User Active Stake Status Card */}
            <div className={styles.userStakeCard}>
              <div className={styles.stakeInfo}>
                <Ticket size={22} className={styles.iconGold} />
                <div>
                  <div className={styles.stakeTitle}>
                    {userEntryCount > 0 ? (
                      <>You're Participating! (<strong>{userEntryCount} Active Tickets</strong>)</>
                    ) : (
                      <>Free Baseline Entry Available</>
                    )}
                  </div>
                  <div className={styles.stakeSub}>
                    Winning Probability: <strong className={styles.probHighlight}>{formattedOdds}%</strong> {userEntryCount > 0 && `(1 in ${oneInN} Odds)`}
                  </div>
                </div>
              </div>

              <button
                className="btn-primary-glow"
                onClick={() => {
                  soundFx.playClick();
                  setIsParticipationOpen(true);
                }}
                style={{ padding: '0.75rem 1.5rem', fontSize: '0.95rem' }}
              >
                <Zap size={18} />
                <span>{userEntryCount > 0 ? 'Earn More Entries →' : 'Enter Giveaway Free →'}</span>
              </button>
            </div>

            {/* Verification Link */}
            <div className={styles.verifierRow}>
              <span>Draw verified cryptographically:</span>
              <button className={styles.verifierBtn} onClick={() => setIsFairOpen(true)}>
                <ShieldCheck size={14} /> Provably Fair Audit (SHA-256) <ExternalLink size={12} />
              </button>
            </div>
          </motion.div>
        </div>

        {/* Tabbed In-Depth Specifications & Rules */}
        <div className={styles.tabSection}>
          <div className={styles.tabBar}>
            <button
              className={`${styles.tabBtn} ${activeTab === 'overview' ? styles.tabBtnActive : ''}`}
              onClick={() => { soundFx.playClick(); setActiveTab('overview'); }}
            >
              <Layers size={16} /> Reward Details & Specs
            </button>
            <button
              className={`${styles.tabBtn} ${activeTab === 'howitworks' ? styles.tabBtnActive : ''}`}
              onClick={() => { soundFx.playClick(); setActiveTab('howitworks'); }}
            >
              <CheckCircle2 size={16} /> How It Works & Transparency
            </button>
            <button
              className={`${styles.tabBtn} ${activeTab === 'odds' ? styles.tabBtnActive : ''}`}
              onClick={() => { soundFx.playClick(); setActiveTab('odds'); }}
            >
              <TrendingUp size={16} /> "Your Chance" Odds Engine
            </button>
            <button
              className={`${styles.tabBtn} ${activeTab === 'timeline' ? styles.tabBtnActive : ''}`}
              onClick={() => { soundFx.playClick(); setActiveTab('timeline'); }}
            >
              <Calendar size={16} /> Giveaway Timeline
            </button>
            <button
              className={`${styles.tabBtn} ${activeTab === 'rules' ? styles.tabBtnActive : ''}`}
              onClick={() => { soundFx.playClick(); setActiveTab('rules'); }}
            >
              <Award size={16} /> Terms & Eligibility
            </button>
          </div>

          <div className={styles.tabContentCard}>
            {activeTab === 'overview' && (
              <div className={styles.tabPanel}>
                <h3>📦 Package & Fulfillment Specifications</h3>
                <div className={styles.specsTableGrid}>
                  <div className={styles.specCell}>
                    <span className={styles.specKey}>Reward Category</span>
                    <strong className={styles.specVal}>{giveaway.category || 'Tech & Lifestyle'}</strong>
                  </div>
                  <div className={styles.specCell}>
                    <span className={styles.specKey}>Fulfillment Method</span>
                    <strong className={styles.specVal}>{prizeConfig.dispatchDescription}</strong>
                  </div>
                  <div className={styles.specCell}>
                    <span className={styles.specKey}>Estimated Delivery</span>
                    <strong className={styles.specVal}>{prizeConfig.deliveryEstimate}</strong>
                  </div>
                  <div className={styles.specCell}>
                    <span className={styles.specKey}>Shipping Carrier</span>
                    <strong className={styles.specVal}>FedEx Priority Air / Blue Dart (100% Insured)</strong>
                  </div>
                </div>

                <div className={styles.packageInclusions}>
                  <h4>Official Box Contents & Warranty:</h4>
                  <ul>
                    <li>Brand New Factory-Sealed Unit with 1-Year Comprehensive Manufacturer Warranty</li>
                    <li>Official retail packaging with all standard charging cables and user manuals</li>
                    <li>Certificate of Provenance & Cryptographic Draw Receipt</li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'howitworks' && (
              <div className={styles.tabPanel}>
                <h3>🔍 Everything You Need to Know Before Joining</h3>
                <p>We believe in 100% transparency. Here is the complete breakdown of how this giveaway operates:</p>

                <div className={styles.transparencyGrid}>
                  <div className={styles.transparencyCard}>
                    <div className={styles.transparencyHeader}>
                      <span className={styles.transparencyIcon}>💰</span>
                      <strong>How Much Does It Cost?</strong>
                    </div>
                    <p><strong>₹0.00 (Zero).</strong> No purchase or payment of any kind is required. Every verified member is entitled to a free baseline ticket.</p>
                  </div>

                  <div className={styles.transparencyCard}>
                    <div className={styles.transparencyHeader}>
                      <span className={styles.transparencyIcon}>🪙</span>
                      <strong>What Currency is Required?</strong>
                    </div>
                    <p><strong>Zero Real Cash / 0 INR.</strong> In-platform loyalty VELoop coins can be optionally earned through non-monetary daily quests to boost multiplier tiers.</p>
                  </div>

                  <div className={styles.transparencyCard}>
                    <div className={styles.transparencyHeader}>
                      <span className={styles.transparencyIcon}>⏳</span>
                      <strong>Giveaway Duration & Draw Time</strong>
                    </div>
                    <p>Pool locks at <strong>23:59 IST on {new Date(giveaway.endDate || giveaway.endsAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</strong>. The countdown timer on this page is synchronized across all users.</p>
                  </div>

                  <div className={styles.transparencyCard}>
                    <div className={styles.transparencyHeader}>
                      <span className={styles.transparencyIcon}>🛡️</span>
                      <strong>Eligibility & Important Restrictions</strong>
                    </div>
                    <p>Open to users aged 18+. Strictly <strong>1 account per human</strong>. Automated scripts/bots will result in immediate disqualification and permanent ban.</p>
                  </div>

                  <div className={styles.transparencyCard}>
                    <div className={styles.transparencyHeader}>
                      <span className={styles.transparencyIcon}>🎲</span>
                      <strong>How the Winner is Selected</strong>
                    </div>
                    <p>Winners are chosen via our <strong>SHA-256 Provably Fair algorithm</strong> combining locked server seeds, client entropy, and blockchain hashes for un-riggable transparency.</p>
                  </div>

                  <div className={styles.transparencyCard}>
                    <div className={styles.transparencyHeader}>
                      <span className={styles.transparencyIcon}>📦</span>
                      <strong>What Happens After Joining?</strong>
                    </div>
                    <p>Your unique ticket ID is recorded. If your ticket wins, the prize claim portal activates with <strong>7 calendar days</strong> to confirm courier shipping or email voucher dispatch.</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'odds' && (
              <div className={styles.tabPanel}>
                <h3>🎲 Transparent Probability & Odds Breakdown</h3>
                <p>Every ticket represents an equal mathematical opportunity in our provably fair draw.</p>

                <div className={styles.oddsBoxGrid}>
                  <div className={styles.oddsBox}>
                    <span className={styles.oddsBoxLabel}>TOTAL TICKETS IN POOL</span>
                    <strong className={styles.oddsBoxVal}>{totalTickets.toLocaleString()}</strong>
                  </div>
                  <div className={styles.oddsBox}>
                    <span className={styles.oddsBoxLabel}>YOUR TICKETS</span>
                    <strong className={styles.oddsBoxVal}>{userEntryCount}</strong>
                  </div>
                  <div className={styles.oddsBox}>
                    <span className={styles.oddsBoxLabel}>WINNING PROBABILITY</span>
                    <strong className={styles.oddsBoxHighlight}>{formattedOdds}%</strong>
                  </div>
                  <div className={styles.oddsBox}>
                    <span className={styles.oddsBoxLabel}>RATIO PROBABILITY</span>
                    <strong className={styles.oddsBoxVal}>{userEntryCount > 0 ? `1 in ${oneInN}` : 'Enter free to calculate'}</strong>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'timeline' && (
              <div className={styles.tabPanel}>
                <h3>⏱️ Milestone Timeline</h3>
                <div className={styles.timelineStepper}>
                  <div className={styles.stepItemDone}>
                    <CheckCircle2 size={18} />
                    <div>
                      <strong>Phase 1: Registration Open</strong>
                      <p>Free baseline entries activated for all verified members.</p>
                    </div>
                  </div>
                  <div className={styles.stepItemActive}>
                    <Zap size={18} />
                    <div>
                      <strong>Phase 2: Quest Multipliers Active (Current)</strong>
                      <p>Complete daily bonus quests to earn extra tickets.</p>
                    </div>
                  </div>
                  <div className={styles.stepItemUpcoming}>
                    <Clock size={18} />
                    <div>
                      <strong>Phase 3: Countdown Expiration & Pool Freeze</strong>
                      <p>Ticket allocations lock permanently at 23:59 IST on end date.</p>
                    </div>
                  </div>
                  <div className={styles.stepItemUpcoming}>
                    <Trophy size={18} />
                    <div>
                      <strong>Phase 4: Cryptographic Draw & Delivery</strong>
                      <p>SHA-256 algorithm selects winners; winner claim portal goes live.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'rules' && (
              <div className={styles.tabPanel}>
                <h3>🛡️ Official Giveaway Terms & Conditions</h3>
                <ul className={styles.rulesList}>
                  <li><strong>No Purchase Necessary:</strong> Free entries are provided to all authenticated users. No payment required to enter or win.</li>
                  <li><strong>Eligibility:</strong> Open to verified account holders aged 18+ worldwide.</li>
                  <li><strong>Entry Limits:</strong> Strictly capped at 50 tickets per user to maintain fair odds across the entire community.</li>
                  <li><strong>Claim Deadline:</strong> Declared winners have 7 calendar days to submit recipient details.</li>
                  <li><strong>Shipping & Taxes:</strong> All shipping, handling, and insurance fees are 100% covered by VELoop Rewards and authorized sponsors.</li>
                  <li><strong>Audit Logs:</strong> Complete seed hashes are publicly verifiable upon draw conclusion via the SHA-256 audit modal.</li>
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Related Giveaways Carousel / Grid */}
        {relatedGiveaways.length > 0 && (
          <div className={styles.relatedSection}>
            <div className={styles.relatedHeader}>
              <div>
                <span className={styles.relatedSub}>EXPLORE MORE</span>
                <h3 className={styles.relatedTitle}>Other Active Reward Pools</h3>
              </div>
              <Link to="/" className={styles.viewAllLink}>
                View All Giveaways <ChevronRight size={16} />
              </Link>
            </div>

            <div className={styles.relatedGrid}>
              {relatedGiveaways.map((item) => (
                <PrizeCard
                  key={item.id}
                  giveaway={item}
                  userEntryCount={userState.userEntries[item.id]?.tickets || 0}
                  onEnter={() => navigate(`/giveaway/${item.slug || item.id}`)}
                  onViewDetails={() => navigate(`/giveaway/${item.slug || item.id}`)}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Lazy Loaded Modals */}
      <Suspense fallback={null}>
        {isParticipationOpen && (
          <ParticipationModal
            isOpen={isParticipationOpen}
            onClose={() => setIsParticipationOpen(false)}
            giveaway={giveaway}
            userCoins={userState.veloopCoins}
            userEntryCount={userEntryCount}
            onEnterSuccess={handleEnterSuccess}
          />
        )}

        {isFairOpen && (
          <ProvablyFairModal
            isOpen={isFairOpen}
            onClose={() => setIsFairOpen(false)}
            winnerData={null}
          />
        )}

        {isRulesOpen && (
          <GiveawayRules
            isOpen={isRulesOpen}
            onClose={() => setIsRulesOpen(false)}
          />
        )}
      </Suspense>

      {/* Floating Toast Notification */}
      {toast && (
        <div className={`${styles.toast} ${styles[`toast_${toast.type}`]}`}>
          <div className={styles.toastContent}>
            <strong>{toast.title}</strong>
            <p>{toast.desc}</p>
          </div>
        </div>
      )}
    </div>
  );
}
