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
  AlertCircle,
  AlertTriangle,
  Package,
  Coins,
  Star,
  Eye,
  UserCheck,
  PackageCheck,
  ArrowDown,
  ChevronDown,
  ChevronUp,
  Info,
  ShieldAlert,
  FileText,
  RotateCcw
} from 'lucide-react';
import Header from '../../components/Header/Header';
import IndividualPageFooter from '../../components/IndividualPageFooter/IndividualPageFooter';
import Countdown from '../../components/Countdown/Countdown';
import PrizeCard from '../../components/PrizeCard/PrizeCard';
import { soundFx } from '../../utils/soundFx';
import { ConfettiManager } from '../../utils/confetti';
import { getPrizeTypeConfig, validateUserCurrencyBalance } from '../../utils/prizeTypeUtils';
import {
  getGiveawayBySlug,
  mockActiveGiveaways,
  mockHeroGiveaway,
  mockQuestTasks
} from '../../data/giveawayData';
import { useAuth } from '../../context/AuthContext';
import styles from './GiveawayDetailsPage.module.css';

const ParticipationModal = lazy(() => import('../../components/ParticipationModal/ParticipationModal'));
const ProvablyFairModal = lazy(() => import('../../components/ProvablyFairModal/ProvablyFairModal'));
const GiveawayRules = lazy(() => import('../../components/GiveawayRules/GiveawayRules'));
const EntryFeeConfirmationModal = lazy(() => import('../../components/EntryFeeConfirmationModal/EntryFeeConfirmationModal'));
const LoginRequiredModal = lazy(() => import('../../components/LoginRequiredModal/LoginRequiredModal'));
const AuthModal = lazy(() => import('../../components/AuthModal/AuthModal'));

export default function GiveawayDetailsPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, isLoggedIn, updateUser, authModalConfig, closeAuthModal } = useAuth();

  const [giveaway, setGiveaway] = useState(null);
  const [theme, setTheme] = useState(() => localStorage.getItem('veloop_theme') || 'dark');
  const [userState, setUserState] = useState({
    name: user?.fullName || 'Alex Thorne',
    userId: user?.userId || 'VE10025',
    isLoggedIn: isLoggedIn,
    coins: user?.coins || 1450,
    veloopCoins: user?.veloopCoins || 850,
    sveCoins: user?.sveCoins || 1200,
    tokens: user?.tokens || 5000,
    activeTickets: user?.activeTickets || 8,
    userEntries: user?.userEntries || {
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

  // Keep userState in sync with centralized AuthContext
  useEffect(() => {
    if (user) {
      setUserState(prev => ({
        ...prev,
        name: user.fullName || user.name || 'Member',
        userId: user.userId || 'VE10025',
        isLoggedIn: true,
        coins: user.coins ?? prev.coins,
        veloopCoins: user.veloopCoins ?? prev.veloopCoins,
        sveCoins: user.sveCoins ?? prev.sveCoins,
        tokens: user.tokens ?? prev.tokens,
        activeTickets: user.activeTickets ?? prev.activeTickets,
        userEntries: user.userEntries ?? prev.userEntries
      }));
    } else {
      setUserState(prev => ({
        ...prev,
        isLoggedIn: false
      }));
    }
  }, [user, isLoggedIn]);

  const [isParticipationOpen, setIsParticipationOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isLoginRequiredOpen, setIsLoginRequiredOpen] = useState(false);
  const [isFairOpen, setIsFairOpen] = useState(false);
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [isImportantInfoExpanded, setIsImportantInfoExpanded] = useState(true);
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

  // Requirement 94: Handle Entry Fee Confirmation Join
  const handleConfirmFeeJoin = ({ giveawayId, feeAmount, feeUnit, newBalance }) => {
    soundFx.playCelebration();
    ConfettiManager.burst();

    setUserState(prev => {
      const balanceField = feeUnit === 'SVEs' ? 'sveCoins' : feeUnit === 'Tokens' ? 'tokens' : 'veloopCoins';
      const prevTickets = prev.userEntries[giveawayId]?.tickets || 0;
      return {
        ...prev,
        [balanceField]: newBalance,
        userEntries: {
          ...prev.userEntries,
          [giveawayId]: {
            tickets: prevTickets + 1,
            oddsMultiplier: 2.0
          }
        }
      };
    });

    setIsConfirmModalOpen(false);
    showToast(
      '🎉 Participation Confirmed!',
      `Successfully registered 1 ticket in ${giveaway.title}. Remaining balance: ${newBalance.toLocaleString()} ${feeUnit}.`,
      'success'
    );
  };

  const relatedGiveaways = mockActiveGiveaways
    .filter(g => g.id !== giveaway.id && g.slug !== giveaway.slug)
    .slice(0, 3);

  const entryRequirement = giveaway.joiningRequirement || (giveaway.entryFee ? `${giveaway.entryFee} ${giveaway.entryFeeUnit || 'VEs'}` : `${giveaway.coinCost || 250} VEs`);
  
  // Requirement 89: Currency-Specific Validation
  const validationResult = validateUserCurrencyBalance(userState, giveaway);
  const { feeUnit, feeAmount, currentBalance, hasEnoughBalance, difference: balanceDifference } = validationResult;

  const daysDiff = Math.max(1, Math.ceil((new Date(giveaway.endDate || '2026-09-20').getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
  const daysRemaining = `${daysDiff}d`;

  // Requirement 90: How This Giveaway Works (7-Step Lifecycle Timeline)
  const giveawaySteps = [
    {
      num: '01',
      title: 'Review the giveaway',
      desc: 'Inspect prize specs, genuine retail value, model details, and official manufacturer warranty.',
      icon: Eye,
      iconColor: '#60a5fa'
    },
    {
      num: '02',
      title: 'Check your eligibility',
      desc: 'Verify that your account meets the 18+ requirement with 1-person-1-account policy.',
      icon: UserCheck,
      iconColor: '#a78bfa'
    },
    {
      num: '03',
      title: 'Pay the required entry amount',
      desc: `Redeem ${entryRequirement} or claim your daily 100% free baseline ticket without purchase.`,
      icon: Coins,
      iconColor: '#fbbf24'
    },
    {
      num: '04',
      title: 'Your participation is recorded',
      desc: 'A unique serialized ticket code is assigned and permanently logged in the audit ledger.',
      icon: Ticket,
      iconColor: '#34d399'
    },
    {
      num: '05',
      title: 'Wait until the giveaway ends',
      desc: 'Track live countdown timer. Complete bonus daily quests if you wish to earn additional tickets.',
      icon: Clock,
      iconColor: '#f472b6'
    },
    {
      num: '06',
      title: 'Winner is selected',
      desc: 'SHA-256 Provably Fair algorithm cryptographically draws the winning ticket publicly.',
      icon: Trophy,
      iconColor: '#fbbf24'
    },
    {
      num: '07',
      title: 'Winner claims the prize',
      desc: 'Winner portal activates with 7-day window to confirm delivery address or email voucher code.',
      icon: PackageCheck,
      iconColor: '#10b981'
    }
  ];

  // Requirement 92: Important Information Data Structure (10 Key Points)
  const importantInfoItems = [
    {
      id: 'currency',
      label: 'Entry currency',
      value: `${feeUnit} (In-platform Loyalty Currency — ₹0.00 cash required)`,
      icon: Coins,
      color: '#fbbf24',
      badge: 'Loyalty Currency'
    },
    {
      id: 'amount',
      label: 'Entry amount',
      value: `${entryRequirement} per entry ticket (Guaranteed 1 Free Baseline Entry available daily)`,
      icon: Zap,
      color: '#60a5fa',
      badge: 'Zero Real Money'
    },
    {
      id: 'duration',
      label: 'Giveaway duration',
      value: `Starts ${new Date(giveaway.startDate || '2026-08-01').toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} • Ends ${new Date(giveaway.endDate || giveaway.endsAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })} at 23:59 IST (${daysRemaining} remaining)`,
      icon: Clock,
      color: '#a78bfa',
      badge: daysRemaining
    },
    {
      id: 'winners',
      label: 'Number of winners',
      value: `${giveaway.winnerCount || 1} Winner${(giveaway.winnerCount || 1) > 1 ? 's' : ''} Guaranteed across all eligible participants in the pool`,
      icon: Trophy,
      color: '#34d399',
      badge: 'Guaranteed'
    },
    {
      id: 'prize',
      label: 'Prize details',
      value: `${giveaway.title} (Retail Value: ₹${(giveaway.valueUSD || 44900).toLocaleString('en-IN')}) • 100% Brand New Factory-Sealed Unit with 1-Year Official Warranty`,
      icon: Package,
      color: '#38bdf8',
      badge: 'Official Retail'
    },
    {
      id: 'selection',
      label: 'Winner selection',
      value: 'Unbiased Cryptographic SHA-256 Provably Fair Algorithm combining server seed hashes, client entropy, and blockchain blocks',
      icon: Sparkles,
      color: '#f59e0b',
      badge: 'Provably Fair'
    },
    {
      id: 'claim',
      label: 'Claim requirements',
      value: `Winners have strictly 7 calendar days (168 hours) to verify identity and ${prizeConfig.requiresShippingAddress ? 'submit delivery address for insured air express shipping' : 'confirm email address for instant digital voucher code dispatch'}.`,
      icon: PackageCheck,
      color: '#10b981',
      badge: '7-Day Deadline'
    },
    {
      id: 'eligibility',
      label: 'Account eligibility',
      value: 'Open to verified members aged 18 years or older. Strictly 1 account per human individual worldwide.',
      icon: UserCheck,
      color: '#6366f1',
      badge: 'Age 18+ Only'
    },
    {
      id: 'fraud',
      label: 'Fraud prevention',
      value: 'Automated bot scripts, multiple accounts, VPN spoofing, and abusive actions result in immediate disqualification, ticket forfeiture, and permanent ban.',
      icon: ShieldAlert,
      color: '#ef4444',
      badge: 'Anti-Fraud Shield'
    },
    {
      id: 'rules',
      label: 'Platform rules',
      value: 'All operations strictly adhere to VELoop Platform Rules, Fair Play Guidelines, and Sweepstakes Legal Terms of Service.',
      icon: FileText,
      color: '#94a3b8',
      badge: 'Terms & Policies'
    }
  ];

  // Requirement 99: Giveaway Participation Rules & Entry Limits Configuration
  const participationRulesData = [
    {
      id: 'single_participation',
      title: 'One Participation per User',
      allowed: true,
      statusLabel: 'Allowed (1 Baseline Entry)',
      isMockRule: false,
      tag: '1 Account = 1 Free Entry',
      icon: UserCheck,
      color: '#10b981',
      summary: 'Guaranteed 1 free daily baseline ticket per authenticated member.',
      details: 'Every registered and verified VELoop Rewards member is entitled to participate with 1 free baseline entry without consuming any balance. Strictly 1 VELoop account per human user.',
      ruleBadge: 'Core Policy'
    },
    {
      id: 'multiple_entries',
      title: 'Multiple Entries Allowed',
      allowed: true,
      statusLabel: 'Allowed (Up to 50 Tickets)',
      isMockRule: true,
      tag: `Max 50 Tickets (${entryRequirement}/ea)`,
      icon: Layers,
      color: '#38bdf8',
      summary: `Users can redeem additional entries using ${feeUnit} up to the 50-ticket pool cap.`,
      details: `[Demo/Mock Rule]: You may acquire extra tickets at ${entryRequirement} per entry. Each ticket is issued a distinct cryptographic serial number, proportionally increasing your mathematical odds.`,
      ruleBadge: 'Draft Rule (Pending Finalization)'
    },
    {
      id: 're_entry',
      title: 'Re-entry Permitted',
      allowed: true,
      statusLabel: 'Allowed Before Draw Lock',
      isMockRule: true,
      tag: 'Open until Countdown Expiry',
      icon: RotateCcw,
      color: '#fbbf24',
      summary: 'Return and join again across multiple sessions anytime before the pool locks.',
      details: `[Demo/Mock Rule]: If you previously entered this giveaway, you can return at any time before the countdown hits 00:00:00 to add more entries, up to the individual cap.`,
      ruleBadge: 'Draft Rule (Pending Finalization)'
    },
    {
      id: 'task_bonus_entries',
      title: 'Additional Entries Through Tasks',
      allowed: true,
      statusLabel: 'Allowed (+1 to +10 Tickets)',
      isMockRule: true,
      tag: 'Quests, Surveys & Shares',
      icon: Zap,
      color: '#a855f7',
      summary: 'Earn bonus tickets by completing daily sponsor tasks and community quests.',
      details: `[Demo/Mock Rule]: Complete optional actions such as social shares, daily streak check-ins, or partner surveys to earn bonus ticket allocations without spending ${feeUnit}.`,
      ruleBadge: 'Draft Rule (Pending Finalization)'
    }
  ];

  return (
    <div className={styles.pageWrap}>
      {/* Requirement 82: Individual Page Navigation Header */}
      <Header
        userState={{
          ...userState,
          coins: userState.veloopCoins,
          activeTickets: Object.values(userState.userEntries || {}).reduce((acc, curr) => acc + (curr.tickets || 0), 0)
        }}
        isDetailPage={true}
        onOpenRules={() => setIsRulesOpen(true)}
        theme={theme}
        onToggleTheme={() => {
          const next = theme === 'dark' ? 'light' : 'dark';
          setTheme(next);
          document.documentElement.setAttribute('data-theme', next);
          localStorage.setItem('veloop_theme', next);
        }}
        onToggleSound={() => soundFx.toggle()}
      />

      <main className="container-custom" style={{ padding: '2rem 1.5rem 5rem' }}>
        {/* Requirement 82: Breadcrumb Navigation & Clearly Visible Return */}
        <div className={styles.breadcrumbBar}>
          <div className={styles.breadLeft}>
            <Link to="/" className={styles.backLink} aria-label="Return to Giveaway Home">
              <ArrowLeft size={16} />
              <span className={styles.backDesktopText}>Giveaway Home</span>
              <span className={styles.backMobileText}>Giveaway</span>
            </Link>
            <span className={styles.breadDivider}>/</span>
            <span className={styles.breadCategory}>{giveaway.category || 'Rewards'}</span>
            <span className={styles.breadDivider}>/</span>
            <span className={styles.breadCurrent}>{giveaway.title}</span>
          </div>

          <div className={styles.demoBalanceToggleWrap}>
            <span className={styles.demoToggleLabel}>Demo Simulator:</span>
            <button
              className={`${styles.demoToggleBtn} ${currentBalance >= feeAmount ? styles.demoToggleBtnActive : ''}`}
              onClick={() => {
                soundFx.playClick();
                setUserState(prev => ({ ...prev, veloopCoins: 350, sveCoins: 850, tokens: 5000 }));
                showToast('💳 Balance: 350 VEs', 'Simulated sufficient balance state.', 'success');
              }}
            >
              350 VEs (Sufficient)
            </button>
            <button
              className={`${styles.demoToggleBtn} ${currentBalance < feeAmount && userState.isLoggedIn ? styles.demoToggleBtnActive : ''}`}
              onClick={() => {
                soundFx.playClick();
                setUserState(prev => ({ ...prev, isLoggedIn: true, veloopCoins: 120, sveCoins: 200, tokens: 500 }));
                showToast('⚠️ Balance: 120 VEs', `Simulated insufficient balance (Need +${feeAmount - 120} VEs).`, 'info');
              }}
            >
              120 VEs (Insufficient)
            </button>
            <button
              className={`${styles.demoToggleBtn} ${!userState.isLoggedIn ? styles.demoToggleBtnActive : ''}`}
              onClick={() => {
                soundFx.playClick();
                setUserState(prev => ({ ...prev, isLoggedIn: !prev.isLoggedIn }));
                showToast(
                  userState.isLoggedIn ? '🔒 Visitor Mode Active' : '✅ Member Mode Active',
                  userState.isLoggedIn ? 'Simulating logged out visitor. Joining will prompt login.' : 'Simulating verified logged in member.',
                  'info'
                );
              }}
            >
              {userState.isLoggedIn ? 'Simulate Visitor' : 'Visitor (Logged Out)'}
            </button>
          </div>
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
            <div className={`${styles.mediaContainer} ${styles[`mediaGlow_${giveaway.accentTheme || 'purple'}`]}`}>
              {/* Background Geometric Rings & Soft Lighting */}
              <div className={styles.ambientOrbitRing1}></div>
              <div className={styles.ambientOrbitRing2}></div>
              <div className={styles.mediaAmbientGlow}></div>
              <div className={styles.gridPatternOverlay}></div>

              {/* Subtle Floating Reward Coins & Particles */}
              <motion.div
                className={`${styles.floatingChip} ${styles.floatingChipLeft}`}
                animate={{ y: [0, -8, 0], rotate: [0, -2, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Coins size={14} className={styles.coinIconGold} />
                <span>VELoop Verified</span>
              </motion.div>

              <motion.div
                className={`${styles.floatingChip} ${styles.floatingChipRight}`}
                animate={{ y: [0, 8, 0], rotate: [0, 2, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              >
                <Sparkles size={13} className={styles.sparkleIconGold} />
                <span>Provably Fair</span>
              </motion.div>

              {/* Floating micro particle dots */}
              <motion.div
                className={`${styles.rewardParticle} ${styles.particle1}`}
                animate={{ y: [0, -12, 0], opacity: [0.4, 0.9, 0.4] }}
                transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.div
                className={`${styles.rewardParticle} ${styles.particle2}`}
                animate={{ y: [0, -10, 0], opacity: [0.3, 0.8, 0.3] }}
                transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              />
              <motion.div
                className={`${styles.rewardParticle} ${styles.particle3}`}
                animate={{ y: [0, -14, 0], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
              />

              {/* Main Prize Image */}
              <img
                src={giveaway.image}
                alt={giveaway.title}
                className={styles.mainImg}
                decoding="async"
              />

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

              {/* Requirement 97: Already Joined State in Hero */}
              {userEntryCount > 0 ? (
                <button
                  className={styles.viewStatusHeroBtn}
                  onClick={() => {
                    soundFx.playClick();
                    setActiveTab('odds');
                    const tabEl = document.getElementById('details-tabs-section');
                    if (tabEl) tabEl.scrollIntoView({ behavior: 'smooth' });
                  }}
                  aria-label="View Giveaway Status"
                >
                  <CheckCircle2 size={16} />
                  <span>View Giveaway Status</span>
                </button>
              ) : (
                <button
                  className="btn-primary-glow"
                  onClick={() => {
                    soundFx.playClick();
                    if (!userState.isLoggedIn) {
                      setIsLoginRequiredOpen(true);
                      return;
                    }
                    if (hasEnoughBalance) {
                      setIsConfirmModalOpen(true);
                    } else {
                      setIsParticipationOpen(true);
                    }
                  }}
                  style={{ padding: '0.75rem 1.5rem', fontSize: '0.95rem' }}
                >
                  <Zap size={18} />
                  <span>Join for {entryRequirement}</span>
                </button>
              )}
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
        {/* End of heroGrid */}

        {/* Requirement 84: Dedicated Prize Information Area / Card */}
        <section className={styles.prizeInfoSection} aria-label="Prize Quick Information Area">
          <div className={styles.prizeInfoCard}>
            <div className={styles.prizeInfoHeader}>
              <div className={styles.prizeInfoTitleGroup}>
                <div className={styles.prizeInfoTopTag}>
                  <Trophy size={14} className={styles.iconGold} />
                  <span>OFFICIAL PRIZE PROFILE</span>
                </div>
                <h2 className={styles.prizeInfoTitle}>
                  {giveaway.name || giveaway.title.replace(/^Win an?\s+/i, '')}
                </h2>
                <p className={styles.prizeInfoSubtitle}>
                  {giveaway.description || `Latest ${giveaway.title.replace(/^Win an?\s+/i, '')} with manufacturer warranty & sealed packaging.`}
                </p>
              </div>

              <div className={styles.prizeInfoBadgeRow}>
                <span className={styles.guaranteeTag}>
                  <ShieldCheck size={14} /> 100% Genuine Sealed
                </span>
                <span className={styles.shippingTag}>
                  <Package size={14} /> {prizeConfig.badgeText}
                </span>
              </div>
            </div>

            {/* Quick Metrics Grid */}
            <div className={styles.prizeMetricsGrid}>
              <div className={styles.metricItem}>
                <div className={styles.metricIconWrap}>
                  <Trophy size={20} className={styles.iconGold} />
                </div>
                <div className={styles.metricData}>
                  <span className={styles.metricLabel}>🏆 Winners:</span>
                  <strong className={styles.metricValue}>
                    {giveaway.winnerCount || 1}
                  </strong>
                </div>
              </div>

              <div className={styles.metricItem}>
                <div className={styles.metricIconWrap}>
                  <Users size={20} className={styles.iconBlue} />
                </div>
                <div className={styles.metricData}>
                  <span className={styles.metricLabel}>👥 Participants:</span>
                  <strong className={styles.metricValue}>
                    {giveaway.participantsCount ? `${(giveaway.participantsCount / 1000).toFixed(1)}K+` : '2.3K+'}
                  </strong>
                </div>
              </div>

              <div className={styles.metricItem}>
                <div className={styles.metricIconWrap}>
                  <Clock size={20} className={styles.iconPurple} />
                </div>
                <div className={styles.metricData}>
                  <span className={styles.metricLabel}>⏳ Ends in:</span>
                  <strong className={styles.metricValue}>
                    {daysRemaining}
                  </strong>
                </div>
              </div>
            </div>

            {/* Requirement 87: Balance Verification Area */}
            <div className={styles.balanceVerificationBox}>
              <div className={styles.balanceCol}>
                <span className={styles.balanceSubLabel}>YOUR BALANCE</span>
                <div className={styles.balanceValRow}>
                  <Coins size={18} className={styles.iconGold} />
                  <strong className={styles.balanceValStrong}>
                    {currentBalance.toLocaleString()} {feeUnit}
                  </strong>
                </div>
              </div>

              <div className={styles.balanceDivider}></div>

              <div className={styles.balanceCol}>
                <span className={styles.balanceSubLabel}>ENTRY FEE</span>
                <div className={styles.balanceValRow}>
                  <Zap size={18} className={styles.iconBlue} />
                  <strong className={styles.balanceValStrong}>
                    {feeAmount.toLocaleString()} {feeUnit}
                  </strong>
                </div>
              </div>

              <div className={styles.balanceDivider}></div>

              <div className={styles.balanceStatusCol}>
                {hasEnoughBalance ? (
                  <div className={styles.balanceSuccessBadge}>
                    <CheckCircle2 size={16} className={styles.iconEmerald} />
                    <span>✓ You have enough {feeUnit}</span>
                  </div>
                ) : (
                  <div className={styles.balanceWarningBadge}>
                    <AlertTriangle size={18} className={styles.iconGold} />
                    <div className={styles.balanceWarningTextWrap}>
                      <strong className={styles.balanceWarningTitle}>⚠️ Insufficient {feeUnit}</strong>
                      <span className={styles.balanceWarningDesc}>
                        You need {balanceDifference.toLocaleString()} more {feeUnit} to participate.
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Requirement 97: Already Joined State or Entry Fee Direct Action Area */}
            {userEntryCount > 0 ? (
              <div className={styles.alreadyParticipatingBox}>
                <div className={styles.alreadyParticipatingHead}>
                  <div className={styles.checkCircleBadge}>
                    <CheckCircle2 size={22} className={styles.iconEmerald} />
                  </div>
                  <div className={styles.alreadyParticipatingTextWrap}>
                    <strong className={styles.alreadyParticipatingTitle}>✓ You're Already Participating</strong>
                    <p className={styles.alreadyParticipatingDesc}>Your entry has already been recorded.</p>
                  </div>
                </div>

                <button
                  className={styles.viewStatusBtn}
                  onClick={() => {
                    soundFx.playClick();
                    setActiveTab('odds');
                    const tabEl = document.getElementById('details-tabs-section');
                    if (tabEl) tabEl.scrollIntoView({ behavior: 'smooth' });
                  }}
                  aria-label="View Giveaway Status"
                >
                  <Ticket size={16} />
                  <span>View Giveaway Status</span>
                </button>
              </div>
            ) : (
              <div className={styles.prizeActionStrip}>
                <div className={styles.feeGroup}>
                  <span className={styles.feeLabel}>Entry Fee</span>
                  <div className={styles.feeValueRow}>
                    <Coins size={22} className={styles.iconGold} />
                    <strong className={styles.feeAmount}>{entryRequirement}</strong>
                    <span className={styles.feeSubtext}>≈ Required balance: <strong>{entryRequirement}</strong> (Available: {currentBalance.toLocaleString()} {feeUnit})</span>
                  </div>
                </div>

                <button
                  className={`${styles.joinGiveawayActionBtn} ${!hasEnoughBalance ? styles.joinBtnEarnMore : ''}`}
                  onClick={() => {
                    soundFx.playClick();
                    if (!userState.isLoggedIn) {
                      setIsLoginRequiredOpen(true);
                      return;
                    }
                    if (hasEnoughBalance) {
                      setIsConfirmModalOpen(true);
                    } else {
                      setIsParticipationOpen(true);
                    }
                  }}
                  aria-label={hasEnoughBalance ? `Join Giveaway – ${entryRequirement}` : `Earn More ${feeUnit} →`}
                >
                  {hasEnoughBalance ? <Zap size={18} /> : <Coins size={18} />}
                  <span>{hasEnoughBalance ? `Join Giveaway – ${entryRequirement}` : `Earn More ${feeUnit} →`}</span>
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Requirement 93: Dedicated "About the Prize" Section */}
        <section className={styles.aboutPrizeSection} aria-label="About the Prize">
          <div className={styles.sectionHeadingWrap}>
            <span className={styles.sectionBadge}>
              <Trophy size={13} className={styles.sparkleIconGold} /> REWARD SPOTLIGHT
            </span>
            <h2 className={styles.sectionTitle}>About the Prize</h2>
            <p className={styles.sectionSubtitle}>
              Detailed product specifications, official value, authenticity guarantee, and delivery protocols.
            </p>
          </div>

          <div className={styles.aboutPrizeCard}>
            {/* Left: Product Image & Certified Seal */}
            <div className={styles.aboutPrizeMediaCol}>
              <div className={styles.aboutPrizeImgWrap}>
                <div className={styles.ambientGlowEffect}></div>
                <img
                  src={giveaway.image}
                  alt={giveaway.title}
                  className={styles.aboutPrizeImg}
                  loading="lazy"
                />
                <div className={styles.certifiedSealBadge}>
                  <ShieldCheck size={15} className={styles.iconEmerald} />
                  <span>100% Genuine Retail Unit</span>
                </div>
              </div>
            </div>

            {/* Right: Comprehensive Details Grid */}
            <div className={styles.aboutPrizeDetailsCol}>
              <div className={styles.aboutPrizeHeaderRow}>
                <div className={styles.prizeCategoryPill}>
                  <Package size={13} /> {giveaway.category || 'Premium Tech'}
                </div>
                <span className={styles.prizeTierBadge}>
                  {giveaway.badge || giveaway.prizeTier || 'Tier-1 Grand Prize'}
                </span>
              </div>

              <h3 className={styles.aboutPrizeName}>
                {giveaway.name || giveaway.title.replace(/^Win an?\s+/i, '')}
              </h3>

              <p className={styles.aboutPrizeDesc}>
                {giveaway.description || `The all-new ${giveaway.title.replace(/^Win an?\s+/i, '')} featuring state-of-the-art engineering, factory packaging, and official brand warranty.`}
              </p>

              {/* 4-Key Metrics Grid */}
              <div className={styles.aboutPrizeSpecsGrid}>
                {/* 1. Official Prize Value */}
                <div className={styles.aboutSpecItem}>
                  <div className={styles.aboutSpecIconWrap}>
                    <Coins size={20} className={styles.iconGold} />
                  </div>
                  <div className={styles.aboutSpecData}>
                    <span className={styles.aboutSpecLabel}>OFFICIAL VALUE (MSRP)</span>
                    <strong className={styles.aboutSpecValHighlight}>
                      ₹{(giveaway.valueUSD || 44900).toLocaleString('en-IN')}
                    </strong>
                    <span className={styles.aboutSpecSub}>100% Free to win</span>
                  </div>
                </div>

                {/* 2. Number of Winners */}
                <div className={styles.aboutSpecItem}>
                  <div className={styles.aboutSpecIconWrap}>
                    <Trophy size={20} className={styles.iconPurple} />
                  </div>
                  <div className={styles.aboutSpecData}>
                    <span className={styles.aboutSpecLabel}>NUMBER OF WINNERS</span>
                    <strong className={styles.aboutSpecVal}>
                      {giveaway.winnerCount || 1} Winner{(giveaway.winnerCount || 1) > 1 ? 's' : ''}
                    </strong>
                    <span className={styles.aboutSpecSub}>Guaranteed allocation</span>
                  </div>
                </div>

                {/* 3. Delivery Method */}
                <div className={styles.aboutSpecItem}>
                  <div className={styles.aboutSpecIconWrap}>
                    <PackageCheck size={20} className={styles.iconBlue} />
                  </div>
                  <div className={styles.aboutSpecData}>
                    <span className={styles.aboutSpecLabel}>FULFILLMENT METHOD</span>
                    <strong className={styles.aboutSpecVal}>
                      {prizeConfig.badgeText}
                    </strong>
                    <span className={styles.aboutSpecSub}>{prizeConfig.deliveryEstimate}</span>
                  </div>
                </div>

                {/* 4. Claim Protocol */}
                <div className={styles.aboutSpecItem}>
                  <div className={styles.aboutSpecIconWrap}>
                    <Clock size={20} className={styles.iconEmerald} />
                  </div>
                  <div className={styles.aboutSpecData}>
                    <span className={styles.aboutSpecLabel}>CLAIM TIMEFRAME</span>
                    <strong className={styles.aboutSpecVal}>7 Calendar Days</strong>
                    <span className={styles.aboutSpecSub}>168 Hours verification</span>
                  </div>
                </div>
              </div>

              {/* Delivery & Claim Information Banner */}
              <div className={styles.deliveryInfoBanner}>
                <div className={styles.deliveryBannerHead}>
                  <Sparkles size={16} className={styles.iconGold} />
                  <strong>Delivery & Claim Information:</strong>
                </div>
                <p className={styles.deliveryBannerText}>
                  {prizeConfig.requiresShippingAddress
                    ? `Physical prize will be dispatched via insured FedEx Priority Air / Blue Dart express courier within 3-5 business days of address verification. All shipping charges, transit insurance, and regional import duties are 100% prepaid by VELoop.`
                    : `Digital voucher codes are dispatched instantly via automated secure email within 15 minutes of winner confirmation. Includes 16-digit voucher number, claim PIN, and complete redemption instructions.`}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Requirement 99: Giveaway Participation Rules & Limits Section */}
        <section className={styles.participationRulesSection} aria-label="Giveaway Participation Rules">
          <div className={styles.sectionHeadingWrap}>
            <span className={styles.sectionBadge}>
              <ShieldCheck size={13} className={styles.sparkleIconGold} /> ENTRY POLICIES & LIMITS
            </span>
            <h2 className={styles.sectionTitle}>Giveaway Participation Rules</h2>
            <p className={styles.sectionSubtitle}>
              Understand single entries, multiple tickets, re-entry windows, and task-based bonus allocations before participating.
            </p>
          </div>

          {/* Demo / Mock Rule Notification Banner */}
          <div className={styles.ruleMockNoticeBanner}>
            <Info size={18} className={styles.ruleMockIcon} />
            <div>
              <strong>Demo & Preliminary Participation Policy Notice:</strong>
              <div>
                The rules and thresholds displayed below represent VELoop Rewards operational draft parameters. 
                The UI is modularly structured so finalized corporate terms and campaign limits can be dynamically injected seamlessly.
              </div>
            </div>
          </div>

          {/* 4 Core Rule Cards */}
          <div className={styles.participationRulesGrid}>
            {participationRulesData.map((rule) => {
              const RuleIcon = rule.icon;
              return (
                <div key={rule.id} className={styles.participationRuleCard}>
                  <div className={styles.ruleCardHeaderRow}>
                    <div className={styles.ruleIconAndTitle}>
                      <div
                        className={styles.ruleIconWrap}
                        style={{
                          color: rule.color,
                          background: `${rule.color}15`,
                          borderColor: `${rule.color}35`
                        }}
                      >
                        <RuleIcon size={20} />
                      </div>
                      <div>
                        <h3 className={styles.ruleTitle}>{rule.title}</h3>
                        <span className={styles.ruleDraftBadge}>{rule.ruleBadge}</span>
                      </div>
                    </div>
                    <span className={`${styles.ruleStatusPill} ${styles.ruleStatusAllowed}`}>
                      <CheckCircle2 size={12} /> {rule.statusLabel}
                    </span>
                  </div>

                  <p className={styles.ruleSummaryText}>{rule.summary}</p>
                  <p className={styles.ruleDetailsText}>{rule.details}</p>

                  <div className={styles.ruleTagPill}>
                    <span>Rule Threshold:</span>
                    <strong className={styles.ruleTagHighlight}>{rule.tag}</strong>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Rules Summary Matrix Table */}
          <div className={styles.rulesMatrixWrap}>
            <div className={styles.rulesMatrixTitle}>
              <FileText size={16} className={styles.iconGold} />
              <span>Quick Rules Matrix</span>
            </div>
            <table className={styles.rulesMatrixTable}>
              <thead>
                <tr>
                  <th>Rule Parameter</th>
                  <th>Permission</th>
                  <th>Limit / Condition</th>
                  <th>Policy Framework</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>One Participation per User</strong></td>
                  <td><span className={styles.ruleStatusAllowed}>✓ Permitted</span></td>
                  <td>1 Free baseline entry per verified member</td>
                  <td>Core Security Standard</td>
                </tr>
                <tr>
                  <td><strong>Multiple Entries</strong></td>
                  <td><span className={styles.ruleStatusAllowed}>✓ Permitted</span></td>
                  <td>Up to 50 tickets ({entryRequirement} per ticket)</td>
                  <td>Demo Configuration</td>
                </tr>
                <tr>
                  <td><strong>Re-entry</strong></td>
                  <td><span className={styles.ruleStatusAllowed}>✓ Permitted</span></td>
                  <td>Allowed in multiple sessions until draw timer hits 00:00:00</td>
                  <td>Demo Configuration</td>
                </tr>
                <tr>
                  <td><strong>Task Bonus Entries</strong></td>
                  <td><span className={styles.ruleStatusAllowed}>✓ Permitted</span></td>
                  <td>Up to +10 bonus tickets through sponsor quests & shares</td>
                  <td>Demo Configuration</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Requirement 92: Expandable Important Information Section */}
        <section className={styles.importantInfoSection} aria-label="Important Information">
          <div
            className={styles.importantInfoHeader}
            onClick={() => {
              soundFx.playClick();
              setIsImportantInfoExpanded(prev => !prev);
            }}
            role="button"
            tabIndex={0}
            aria-expanded={isImportantInfoExpanded}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setIsImportantInfoExpanded(prev => !prev);
              }
            }}
          >
            <div className={styles.importantInfoTitleWrap}>
              <div className={styles.importantInfoIconBox}>
                <Info size={22} className={styles.iconGold} />
              </div>
              <div className={styles.importantInfoTextWrap}>
                <div className={styles.importantInfoBadgeRow}>
                  <span className={styles.importantInfoBadge}>MANDATORY DISCLOSURE</span>
                  <span className={styles.importantInfoCountBadge}>10 CRITICAL RULES</span>
                </div>
                <h2 className={styles.importantInfoTitle}>Important Information</h2>
                <p className={styles.importantInfoSubtitle}>
                  Please review the giveaway rules and participation requirements carefully before joining.
                </p>
              </div>
            </div>

            <div className={styles.importantInfoToggleWrap}>
              <span className={styles.importantInfoToggleText}>
                {isImportantInfoExpanded ? 'Collapse Details' : 'Expand Details'}
              </span>
              <motion.div
                animate={{ rotate: isImportantInfoExpanded ? 180 : 0 }}
                transition={{ duration: 0.25 }}
                className={styles.chevronWrap}
              >
                <ChevronDown size={20} />
              </motion.div>
            </div>
          </div>

          <AnimatePresence initial={false}>
            {isImportantInfoExpanded && (
              <motion.div
                key="important-info-grid"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.35, ease: 'easeInOut' }}
                className={styles.importantInfoBody}
              >
                <div className={styles.importantInfoGrid}>
                  {importantInfoItems.map((item, idx) => {
                    const ItemIcon = item.icon;
                    return (
                      <motion.div
                        key={item.id}
                        className={styles.importantInfoCard}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25, delay: idx * 0.03 }}
                      >
                        <div className={styles.infoCardTop}>
                          <div
                            className={styles.infoCardIconWrap}
                            style={{
                              color: item.color,
                              background: `${item.color}15`,
                              borderColor: `${item.color}35`
                            }}
                          >
                            <ItemIcon size={18} />
                          </div>
                          <span className={styles.infoCardBadge}>{item.badge}</span>
                        </div>
                        <h3 className={styles.infoCardLabel}>{item.label}</h3>
                        <p className={styles.infoCardValue}>{item.value}</p>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Requirement 90: How This Giveaway Works Section */}
        <section className={styles.howItWorksSection} aria-label="How This Giveaway Works">
          <div className={styles.sectionHeadingWrap}>
            <span className={styles.sectionBadge}>
              <Sparkles size={13} className={styles.sparkleIconGold} /> STEP-BY-STEP PROCESS
            </span>
            <h2 className={styles.sectionTitle}>How This Giveaway Works</h2>
            <p className={styles.sectionSubtitle}>
              From initial review to prize delivery — a 100% transparent, provably fair user journey.
            </p>
          </div>

          <div className={styles.howTimelineContainer}>
            {giveawaySteps.map((step, idx) => {
              const IconComp = step.icon;
              return (
                <React.Fragment key={step.num}>
                  <motion.div
                    className={styles.timelineStepCard}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.35, delay: idx * 0.06 }}
                  >
                    <div className={styles.stepCardHeader}>
                      <span className={styles.stepNumberBadge}>{step.num}</span>
                      <div className={styles.stepIconWrap} style={{ color: step.iconColor }}>
                        <IconComp size={22} />
                      </div>
                    </div>
                    <h3 className={styles.stepTitle}>{step.title}</h3>
                    <p className={styles.stepDesc}>{step.desc}</p>
                  </motion.div>

                  {idx < giveawaySteps.length - 1 && (
                    <div className={styles.timelineConnector} aria-hidden="true">
                      <ArrowDown size={18} className={styles.arrowIcon} />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </section>

        {/* Tabbed In-Depth Specifications & Rules */}
        <div className={styles.tabSection} id="details-tabs-section">
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
                <div className={styles.termsHeaderRow}>
                  <div>
                    <h3 className={styles.termsMainHeading}>🛡️ Important Terms & Conditions</h3>
                    <p className={styles.termsSubtitle}>
                      Official operational rules, eligibility restrictions, and fulfillment protocols for {giveaway.title}.
                    </p>
                  </div>
                  <span className={styles.termsVersionBadge}>VERSION 2026.4 • LEGAL DISCLOSURE</span>
                </div>

                <div className={styles.termsGrid}>
                  {/* 1. Eligibility */}
                  <div className={styles.termsCard}>
                    <div className={styles.termsCardTitle}>
                      <span className={styles.termsNum}>01</span>
                      <h4>Eligibility</h4>
                    </div>
                    <p>
                      Open exclusively to verified account holders aged <strong>18 years or older</strong> worldwide. 
                      Strictly <strong>one (1) account per individual</strong>. Employees, contractors, and immediate family members of VELoop Rewards are restricted from claiming tier-1 prizes.
                    </p>
                  </div>

                  {/* 2. Entry Requirement */}
                  <div className={styles.termsCard}>
                    <div className={styles.termsCardTitle}>
                      <span className={styles.termsNum}>02</span>
                      <h4>Entry Requirement</h4>
                    </div>
                    <p>
                      Standard ticket redemption requires <strong>{entryRequirement}</strong> per ticket entry. 
                      A guaranteed <strong>100% free daily baseline entry</strong> is available to all authenticated members with no purchase or coin deduction necessary.
                    </p>
                  </div>

                  {/* 3. Participation & Entry Rules */}
                  <div className={styles.termsCard}>
                    <div className={styles.termsCardTitle}>
                      <span className={styles.termsNum}>03</span>
                      <h4>Participation & Entry Limits</h4>
                    </div>
                    <p>
                      <strong>• Single Participation:</strong> 1 free baseline entry guaranteed per verified account.<br />
                      <strong>• Multiple Entries:</strong> Permitted up to 50 tickets ({entryRequirement}/ea) to mathematically increase winning odds.<br />
                      <strong>• Re-entry:</strong> Return and acquire more tickets across multiple sessions before the pool timer hits 00:00:00.<br />
                      <strong>• Task Bonus Entries:</strong> Earn up to +10 additional bonus tickets by completing daily sponsor quests & social shares.<br />
                      <em>[Note: Parameters structured as mock/draft policy pending final VELoop rules.]</em>
                    </p>
                  </div>

                  {/* 4. Giveaway Duration */}
                  <div className={styles.termsCard}>
                    <div className={styles.termsCardTitle}>
                      <span className={styles.termsNum}>04</span>
                      <h4>Giveaway Duration</h4>
                    </div>
                    <p>
                      Giveaway pool officially opens at <strong>00:00 IST on {new Date(giveaway.startDate || '2026-08-01').toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</strong> and permanently locks at <strong>{new Date(giveaway.endDate || giveaway.endsAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })} IST</strong>.
                    </p>
                  </div>

                  {/* 5. Winner Selection */}
                  <div className={styles.termsCard}>
                    <div className={styles.termsCardTitle}>
                      <span className={styles.termsNum}>05</span>
                      <h4>Winner Selection Process</h4>
                    </div>
                    <p>
                      Winners are drawn using an un-riggable <strong>SHA-256 Provably Fair algorithm</strong>. 
                      The drawing mathematically combines the locked server seed hash, client entropy seed, and the public blockchain block hash.
                    </p>
                  </div>

                  {/* 6. Winner Announcement */}
                  <div className={styles.termsCard}>
                    <div className={styles.termsCardTitle}>
                      <span className={styles.termsNum}>06</span>
                      <h4>Winner Announcement</h4>
                    </div>
                    <p>
                      Official winning tickets are published on the <strong>Winners Board</strong> and live winner spotlight within <strong>15 minutes</strong> of the countdown timer expiration.
                    </p>
                  </div>

                  {/* 7. Prize Claim */}
                  <div className={styles.termsCard}>
                    <div className={styles.termsCardTitle}>
                      <span className={styles.termsNum}>07</span>
                      <h4>Prize Claim & Dispatch</h4>
                    </div>
                    <p>
                      {prizeConfig.requiresShippingAddress
                        ? 'Hardware winners must submit verified postal address details for insured FedEx/BlueDart express dispatch (all shipping & import duties fully covered).'
                        : 'Digital voucher codes are dispatched instantly to the recipient’s registered email address with 16-digit redemption voucher and activation PIN.'}
                    </p>
                  </div>

                  {/* 8. Claim Deadline */}
                  <div className={styles.termsCard}>
                    <div className={styles.termsCardTitle}>
                      <span className={styles.termsNum}>08</span>
                      <h4>Claim Deadline</h4>
                    </div>
                    <p>
                      Winners have strictly <strong>7 calendar days (168 hours)</strong> from the official draw timestamp to claim their prize. 
                      Unclaimed prizes after this deadline are subject to re-roll or roll-over to community pools.
                    </p>
                  </div>

                  {/* 9. Disqualification */}
                  <div className={`${styles.termsCard} ${styles.termsCardWarning}`}>
                    <div className={styles.termsCardTitle}>
                      <span className={styles.termsNum}>09</span>
                      <h4>Disqualification Policy</h4>
                    </div>
                    <p>
                      Suspicious, fraudulent, abusive, multi-accounting, automated bot scripts, or rule-breaking activities will result in <strong>immediate disqualification, voiding of all tickets, and permanent account suspension</strong> in accordance with VELoop platform security rules.
                    </p>
                  </div>

                  {/* 10. Refund / Entry Policy */}
                  <div className={`${styles.termsCard} ${styles.termsCardPolicy}`}>
                    <div className={styles.termsCardTitle}>
                      <span className={styles.termsNum}>10</span>
                      <h4>Refund & Entry Policy</h4>
                    </div>
                    <p>
                      <em>[Placeholder Content for Confirmation]</em>: Loyalty currency ({feeUnit}) and tickets committed to an active giveaway pool are non-refundable once recorded in the immutable pool ledger, as tickets immediately alter draw probability weights. In the rare event of administrative cancellation prior to draw lock, 100% of redeemed {feeUnit} will be automatically re-credited.
                    </p>
                  </div>
                </div>
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

      {/* Requirement 101: Individual Page Compact Footer */}
      <IndividualPageFooter
        onOpenRules={() => setIsRulesOpen(true)}
        onOpenTerms={() => {
          setActiveTab('rules');
          const tabEl = document.getElementById('details-tabs-section');
          if (tabEl) tabEl.scrollIntoView({ behavior: 'smooth' });
        }}
        onOpenSupport={() => {
          showToast('🎧 VELOOP Support Desk', 'Support inquiry opened! Email support@veloop.io for 24/7 assistance.', 'info');
        }}
      />

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

        {isConfirmModalOpen && (
          <EntryFeeConfirmationModal
            isOpen={isConfirmModalOpen}
            onClose={() => setIsConfirmModalOpen(false)}
            giveaway={giveaway}
            userState={userState}
            onConfirmJoin={handleConfirmFeeJoin}
          />
        )}

        {isLoginRequiredOpen && (
          <LoginRequiredModal
            isOpen={isLoginRequiredOpen}
            onClose={() => setIsLoginRequiredOpen(false)}
            giveawayTitle={giveaway.title}
          />
        )}

        {authModalConfig?.isOpen && (
          <AuthModal
            isOpen={authModalConfig.isOpen}
            initialMode={authModalConfig.mode}
            onClose={closeAuthModal}
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
