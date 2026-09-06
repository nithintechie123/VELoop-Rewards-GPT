import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gift } from 'lucide-react';

import Header from '../../components/Header/Header';
import SimulationToolbar from '../../components/SimulationToolbar/SimulationToolbar';
import WinnerSlider from '../../components/WinnerSlider/WinnerSlider';
import WinnerClaimBanner from '../../components/WinnerClaimBanner/WinnerClaimBanner';
import GiveawayHero from '../../components/GiveawayHero/GiveawayHero';
import ExclusiveBanner from '../../components/ExclusiveBanner/ExclusiveBanner';
import GiveawayStats from '../../components/GiveawayStats/GiveawayStats';
import FeaturedGiveaways from '../../components/FeaturedGiveaways/FeaturedGiveaways';
import HowToParticipate from '../../components/HowToParticipate/HowToParticipate';
import WinnersTabs from '../../components/WinnersTabs/WinnersTabs';
import TrustSection from '../../components/TrustSection/TrustSection';
import PreFooterCTA from '../../components/PreFooterCTA/PreFooterCTA';
import FAQ from '../../components/FAQ/FAQ';

// Requirement 68: Lazy-load heavy modals on demand to reduce initial payload
const ParticipationModal = lazy(() => import('../../components/ParticipationModal/ParticipationModal'));
const PrizeClaimModal = lazy(() => import('../../components/PrizeClaimModal/PrizeClaimModal'));
const ProvablyFairModal = lazy(() => import('../../components/ProvablyFairModal/ProvablyFairModal'));
const GiveawayRules = lazy(() => import('../../components/GiveawayRules/GiveawayRules'));
const WinnerRevealModal = lazy(() => import('../../components/WinnerReveal/WinnerRevealModal'));
const PrizeDetailDrawer = lazy(() => import('../../components/PrizeDetailDrawer/PrizeDetailDrawer'));
const EntryFeeConfirmationModal = lazy(() => import('../../components/EntryFeeConfirmationModal/EntryFeeConfirmationModal'));
const LoginRequiredModal = lazy(() => import('../../components/LoginRequiredModal/LoginRequiredModal'));
const AuthModal = lazy(() => import('../../components/AuthModal/AuthModal'));
import ErrorState from '../../components/ErrorState/ErrorState';
import {
  HeroSkeleton,
  StatsSkeleton,
  PrizeCardSkeleton,
  WinnerCardSkeleton
} from '../../components/Skeletons/Skeletons';

import { apiService } from '../../services/api';
import {
  mockHeroGiveaway,
  mockActiveGiveaways,
  mockSpotlightWinners,
  mockArchiveWinners,
  mockQuestTasks,
  mockWinnerLookup
} from '../../data/giveawayData';
import { soundFx } from '../../utils/soundFx';
import { ConfettiManager } from '../../utils/confetti';
import { useAuth } from '../../context/AuthContext';
import styles from './GiveawayPage.module.css';

export default function GiveawayPage() {
  const { user, isLoggedIn, updateUser, authModalConfig, closeAuthModal } = useAuth();

  // Application Data States
  const [giveaways, setGiveaways] = useState(mockActiveGiveaways);
  const [heroGiveaway, setHeroGiveaway] = useState(mockHeroGiveaway);
  const [spotlightWinners, setSpotlightWinners] = useState(mockSpotlightWinners);
  const [archiveWinners, setArchiveWinners] = useState(mockArchiveWinners);

  // User & Identity State
  const [currentUserId, setCurrentUserId] = useState(user?.userId || null);
  const [claimState, setClaimState] = useState('not_submitted'); // 'not_submitted' | 'submitted' | 'processing' | 'completed' | 'expired'

  const [userState, setUserState] = useState({
    name: user?.fullName || 'Guest',
    userId: user?.userId || null,
    isLoggedIn: isLoggedIn,
    coins: user?.coins || user?.veloopCoins || 0,
    veloopCoins: user?.veloopCoins || 0,
    sveCoins: user?.sveCoins || 0,
    tokens: user?.tokens || 0,
    activeTickets: user?.activeTickets || 0,
    soundEnabled: true,
    userEntries: user?.userEntries || {},
    quests: mockQuestTasks
  });

  // Keep userState in sync with centralized AuthContext
  useEffect(() => {
    if (user) {
      setUserState(prev => ({
        ...prev,
        name: user.fullName || user.name || 'Member',
        userId: user.userId || user.id,
        isLoggedIn: true,
        coins: user.coins ?? user.veloopCoins ?? 0,
        veloopCoins: user.veloopCoins ?? 0,
        sveCoins: user.sveCoins ?? 0,
        tokens: user.tokens ?? 0,
        activeTickets: user.activeTickets ?? 0,
        userEntries: user.userEntries ?? {}
      }));
      setCurrentUserId(user.userId || user.id);
    } else {
      setUserState(prev => ({
        ...prev,
        name: 'Guest',
        userId: null,
        isLoggedIn: false,
        coins: 0,
        veloopCoins: 0,
        sveCoins: 0,
        tokens: 0,
        activeTickets: 0,
        userEntries: {}
      }));
      setCurrentUserId(null);
    }
  }, [user, isLoggedIn]);

  // Current Winner Matching (Requirement 34)
  const winningRecord = mockWinnerLookup.find(w => w.userId === currentUserId) || null;

  // Theme State ('dark' | 'light')
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('veloop_theme') || 'dark';
  });

  // Modal States
  const [isParticipationOpen, setIsParticipationOpen] = useState(false);
  const [activeModalGiveaway, setActiveModalGiveaway] = useState(null);
  const [confirmFeeGiveaway, setConfirmFeeGiveaway] = useState(null);
  const [isLoginRequiredOpen, setIsLoginRequiredOpen] = useState(false);
  const [selectedDrawerPrize, setSelectedDrawerPrize] = useState(null);
  const [isClaimOpen, setIsClaimOpen] = useState(false);
  const [claimPrizeTitle, setClaimPrizeTitle] = useState('Apple Watch Series 9');
  const [isFairOpen, setIsFairOpen] = useState(false);
  const [inspectingWinner, setInspectingWinner] = useState(null);
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [isRevealOpen, setIsRevealOpen] = useState(false);
  const [activeWinnersTab, setActiveWinnersTab] = useState(null);

  // Toast Notification State
  const [toast, setToast] = useState(null);

  // Sync theme attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('veloop_theme', theme);
  }, [theme]);

  const handleToggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    soundFx.playClick();
    showToast(
      nextTheme === 'dark' ? '🌙 Dark Mode Active' : '☀️ Light Mode Active',
      nextTheme === 'dark' ? 'Switched to Obsidian Emerald Dark theme' : 'Switched to Clean Pearl Light theme',
      'info'
    );
  };

  // Fetch initial data from Express API
  useEffect(() => {
    async function loadData() {
      const gws = await apiService.getGiveaways();
      const hero = await apiService.getHeroGiveaway();
      const winners = await apiService.getSpotlightWinners();
      const archive = await apiService.getArchiveWinners();

      if (gws) setGiveaways(gws);
      if (hero) setHeroGiveaway(hero);
      if (winners) setSpotlightWinners(winners);
      if (archive) setArchiveWinners(archive);
    }
    loadData();
  }, []);

  const showToast = (title, desc, type = 'success') => {
    setToast({ title, desc, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Sound FX toggle
  const handleToggleSound = () => {
    const isEnabled = soundFx.toggle();
    setUserState(prev => ({ ...prev, soundEnabled: isEnabled }));
    showToast(
      isEnabled ? '🔊 Audio FX Enabled' : '🔇 Audio FX Muted',
      isEnabled ? 'Interactive audio feedback turned on' : 'Interactive audio feedback muted',
      'info'
    );
  };

  // Login Helper (Requirement 55)
  const handleLogin = () => {
    soundFx.playSuccess();
    setUserState(prev => ({
      ...prev,
      isLoggedIn: true,
      userId: 'VE10025',
      name: 'Alex Thorne'
    }));
    setCurrentUserId('VE10025');
    showToast('👤 Logged In as Member', 'Welcome back, Alex Thorne (VE10025)! Free daily entries unlocked.', 'success');
  };

  const navigate = useNavigate();

  const handleNavigateToDetails = (giveawayIdOrSlug) => {
    soundFx.playClick();
    const found = giveaways.find(g => g.id === giveawayIdOrSlug || g.slug === giveawayIdOrSlug);
    const slug = found?.slug || giveawayIdOrSlug;
    navigate(`/giveaway/${slug}`);
  };

  // Participation Handlers
  const handleOpenParticipation = (giveawayId) => {
    soundFx.playClick();
    let gw = null;
    if (heroGiveaway && heroGiveaway.id === giveawayId) {
      gw = heroGiveaway;
    } else {
      gw = giveaways.find(g => g.id === giveawayId);
    }
    if (!gw) return;

    if (!userState.isLoggedIn) {
      setActiveModalGiveaway(gw);
      setIsLoginRequiredOpen(true);
      return;
    }

    setActiveModalGiveaway(gw);
    setIsParticipationOpen(true);
  };

  const handleClaimFreeEntry = (giveawayId) => {
    const randomHex = Math.floor(10000 + Math.random() * 90000);
    const ticketId = `#VEL-${randomHex}-US`;

    setUserState(prev => {
      const current = prev.userEntries[giveawayId]?.tickets || 0;
      return {
        ...prev,
        activeTickets: prev.activeTickets + 1,
        userEntries: {
          ...prev.userEntries,
          [giveawayId]: { tickets: current + 1 }
        }
      };
    });

    setGiveaways(prev => prev.map(g => g.id === giveawayId ? { ...g, totalTicketsEntered: g.totalTicketsEntered + 1 } : g));
    if (heroGiveaway && heroGiveaway.id === giveawayId) {
      setHeroGiveaway(prev => ({ ...prev, totalTicketsEntered: prev.totalTicketsEntered + 1 }));
    }

    showToast('🎉 Free Entry Confirmed!', `Allocated ticket ${ticketId}`, 'success');
    return ticketId;
  };

  const handleClaimCoinBooster = (giveawayId, ticketCount, coinCost) => {
    const randomHex = Math.floor(10000 + Math.random() * 90000);
    const ticketId = `#VEL-${randomHex}-US`;

    setUserState(prev => {
      const current = prev.userEntries[giveawayId]?.tickets || 0;
      return {
        ...prev,
        coins: prev.coins - coinCost,
        activeTickets: prev.activeTickets + ticketCount,
        userEntries: {
          ...prev.userEntries,
          [giveawayId]: { tickets: current + ticketCount }
        }
      };
    });

    setGiveaways(prev => prev.map(g => g.id === giveawayId ? { ...g, totalTicketsEntered: g.totalTicketsEntered + ticketCount } : g));
    if (heroGiveaway && heroGiveaway.id === giveawayId) {
      setHeroGiveaway(prev => ({ ...prev, totalTicketsEntered: prev.totalTicketsEntered + ticketCount }));
    }

    showToast('⚡ Booster Activated!', `Added +${ticketCount} tickets (-${coinCost} Coins)`, 'gold');
    return ticketId;
  };

  const handleCompleteQuest = (task, giveawayId) => {
    const randomHex = Math.floor(10000 + Math.random() * 90000);
    const ticketId = `#VEL-${randomHex}-US`;

    setUserState(prev => {
      const current = prev.userEntries[giveawayId]?.tickets || 0;
      return {
        ...prev,
        coins: prev.coins + task.rewardCoins,
        activeTickets: prev.activeTickets + task.rewardTickets,
        quests: prev.quests.map(q => q.id === task.id ? { ...q, completed: true } : q),
        userEntries: {
          ...prev.userEntries,
          [giveawayId]: { tickets: current + task.rewardTickets }
        }
      };
    });

    showToast('🏆 Quest Finished!', `+${task.rewardTickets} Tickets & +${task.rewardCoins} Coins earned!`, 'info');
    return ticketId;
  };

  // Requirement 94: Handle Confirmation Modal Entry
  const handleConfirmFeeJoin = ({ giveawayId, feeAmount, feeUnit, newBalance }) => {
    soundFx.playCelebration();
    ConfettiManager.burst();

    const randomHex = Math.floor(10000 + Math.random() * 90000);
    const ticketId = `#VEL-${randomHex}-US`;

    setUserState(prev => {
      const balanceField = feeUnit === 'SVEs' ? 'sveCoins' : feeUnit === 'Tokens' ? 'tokens' : 'coins';
      const prevTickets = prev.userEntries[giveawayId]?.tickets || 0;
      return {
        ...prev,
        [balanceField]: newBalance,
        activeTickets: prev.activeTickets + 1,
        userEntries: {
          ...prev.userEntries,
          [giveawayId]: {
            tickets: prevTickets + 1,
            oddsMultiplier: 2.0
          }
        }
      };
    });

    setGiveaways(prev => prev.map(g => g.id === giveawayId ? { ...g, totalTicketsEntered: (g.totalTicketsEntered || 0) + 1 } : g));
    if (heroGiveaway && heroGiveaway.id === giveawayId) {
      setHeroGiveaway(prev => ({ ...prev, totalTicketsEntered: (prev.totalTicketsEntered || 0) + 1 }));
    }

    setConfirmFeeGiveaway(null);
    showToast('🎉 Participation Confirmed!', `Allocated ticket ${ticketId}. Remaining balance: ${newBalance.toLocaleString()} ${feeUnit}.`, 'success');
  };

  // Promo Code Redemption
  const handleClaimCodeSuccess = ({ code, coins, tickets }) => {
    setUserState(prev => {
      const heroId = heroGiveaway?.id || 'gw-apple-studio';
      const current = prev.userEntries[heroId]?.tickets || 0;
      return {
        ...prev,
        coins: prev.coins + coins,
        activeTickets: prev.activeTickets + tickets,
        userEntries: {
          ...prev.userEntries,
          [heroId]: { tickets: current + tickets }
        }
      };
    });
    showToast('🎁 Promo Code Activated!', `+${coins} Coins & +${tickets} Bonus Entries applied!`, 'gold');
  };

  // Inspect Proof Modal
  const handleInspectProof = (winner) => {
    soundFx.playClick();
    setInspectingWinner(winner);
    setIsFairOpen(true);
  };

  // Winner Claim Portal
  const handleOpenClaim = (prizeTitle = 'Apple Watch Series 9') => {
    soundFx.playClick();
    setClaimPrizeTitle(prizeTitle);
    setIsClaimOpen(true);
  };

  // Simulation Toolbar Controls
  const [activeUserStatePreset, setActiveUserStatePreset] = useState(4); // Default to State 4 (Winner)

  const handleCycleUserStatePreset = () => {
    soundFx.playClick();
    const nextPreset = activeUserStatePreset === 7 ? 1 : activeUserStatePreset + 1;
    setActiveUserStatePreset(nextPreset);

    if (nextPreset === 1) {
      // State 1: Visitor (Logged-Out Guest)
      setUserState(prev => ({ ...prev, isLoggedIn: false }));
      setCurrentUserId('VE_GUEST');
      setHeroGiveaway({
        ...mockHeroGiveaway,
        status: 'active',
        endsAt: new Date(Date.now() + 3 * 86400000).toISOString()
      });
      setGiveaways(mockActiveGiveaways.map(g => ({ ...g, status: 'active' })));
      showToast('👤 State 1: Visitor', 'Viewing platform as logged-out guest. Login prompt displayed.', 'info');
    } else if (nextPreset === 2) {
      // State 2: Logged-in non-participant (0 Tickets)
      setUserState(prev => ({ ...prev, isLoggedIn: true, userId: 'VE10025', name: 'Alex Thorne', userEntries: {} }));
      setCurrentUserId('VE10025');
      setHeroGiveaway({
        ...mockHeroGiveaway,
        status: 'active',
        endsAt: new Date(Date.now() + 3 * 86400000).toISOString()
      });
      setGiveaways(mockActiveGiveaways.map(g => ({ ...g, status: 'active' })));
      showToast('👤 State 2: Logged-In Non-Participant', 'Authenticated as VE10025 with 0 active tickets.', 'info');
    } else if (nextPreset === 3) {
      // State 3: Logged-in participant (Active Tickets > 0, Requirement 56)
      const heroId = mockHeroGiveaway.id || 'GW-2026-08';
      setUserState(prev => ({
        ...prev,
        isLoggedIn: true,
        userId: 'VE10025',
        name: 'Alex Thorne',
        userEntries: { [heroId]: { tickets: 24 }, 'gw-sony-ps5': { tickets: 12 }, 'gw-macbook-pro': { tickets: 8 } }
      }));
      setCurrentUserId('VE10025');
      setHeroGiveaway({
        ...mockHeroGiveaway,
        status: 'active',
        endsAt: new Date(Date.now() + 3 * 86400000).toISOString()
      });
      setGiveaways(mockActiveGiveaways.map(g => ({ ...g, status: 'active' })));
      showToast('🎟️ State 3: Participant', "You're Participating ✓ (Your Entries: 24). CTA: Earn More Entries →", 'success');
    } else if (nextPreset === 4) {
      // State 4: Winner
      setUserState(prev => ({
        ...prev,
        isLoggedIn: true,
        userId: 'VE10025',
        name: 'Alex Thorne'
      }));
      setCurrentUserId('VE10025');
      setClaimState('not_submitted');
      setHeroGiveaway({
        ...mockHeroGiveaway,
        status: 'active',
        endsAt: new Date(Date.now() + 3 * 86400000).toISOString()
      });
      setGiveaways(mockActiveGiveaways.map(g => ({ ...g, status: 'active' })));
      showToast('🏆 State 4: Winner', 'VE10025 matches Apple Watch winner! Claim Banner active.', 'gold');
    } else if (nextPreset === 5) {
      // State 5: Non-winner
      setUserState(prev => ({
        ...prev,
        isLoggedIn: true,
        userId: 'VE99999',
        name: 'Guest Explorer'
      }));
      setCurrentUserId('VE99999');
      setHeroGiveaway({
        ...mockHeroGiveaway,
        status: 'active',
        endsAt: new Date(Date.now() + 3 * 86400000).toISOString()
      });
      setGiveaways(mockActiveGiveaways.map(g => ({ ...g, status: 'active' })));
      showToast('🌟 State 5: Non-Winner', 'Displays "Didn\'t win this time?" with Explore Next CTA.', 'info');
    } else if (nextPreset === 6) {
      // State 6: Giveaway ended
      setHeroGiveaway({
        ...mockHeroGiveaway,
        status: 'ended',
        winnerName: 'VE****82',
        endsAt: new Date(Date.now() - 1000).toISOString()
      });
      setGiveaways(mockActiveGiveaways.map(g => ({
        ...g,
        status: 'ended',
        winnerName: 'VE****82',
        endsAt: new Date(Date.now() - 1000).toISOString()
      })));
      showToast('⏳ State 6: Giveaway Ended', 'Countdown reached 0. Concluded drawing & winners displayed.', 'gold');
    } else if (nextPreset === 7) {
      // State 7: Upcoming giveaway
      setHeroGiveaway({
        ...mockHeroGiveaway,
        status: 'upcoming',
        startsIn: '3 Days'
      });
      setGiveaways(mockActiveGiveaways.map(g => ({
        ...g,
        status: 'upcoming',
        startsIn: '3 Days'
      })));
      showToast('🚀 State 7: Upcoming Giveaway', 'Pool starts in 3 days with pre-registration active.', 'info');
    }
  };

  const handleCycleUserIdentity = () => {
    soundFx.playClick();
    if (currentUserId === 'VE10025') {
      // Switch to GIFT_CARD Winner
      setCurrentUserId('VE20088');
      setUserState(prev => ({ ...prev, userId: 'VE20088', name: 'Rohan Verma' }));
      showToast('🎁 GIFT_CARD Winner (VE20088)', 'Switched to: ₹2,000 Amazon Gift Card (Email claim form)', 'gold');
    } else if (currentUserId === 'VE20088') {
      // Switch to DIGITAL Winner
      setCurrentUserId('VE30077');
      setUserState(prev => ({ ...prev, userId: 'VE30077', name: 'Maya Chen' }));
      showToast('⚡ DIGITAL Winner (VE30077)', 'Switched to: Xbox Game Pass & Steam Vault (Key claim form)', 'info');
    } else if (currentUserId === 'VE30077') {
      // Switch to Non-Winner
      setCurrentUserId('VE99999');
      setUserState(prev => ({ ...prev, userId: 'VE99999', name: 'Guest Explorer' }));
      showToast('👤 Non-Winner (VE99999)', 'Switched to Non-Winner State: Displays "Didn\'t win this time?"', 'info');
    } else {
      // Switch back to PHYSICAL Winner
      setCurrentUserId('VE10025');
      setUserState(prev => ({ ...prev, userId: 'VE10025', name: 'Alex Thorne' }));
      showToast('🏆 PHYSICAL Winner (VE10025)', 'Switched to: Apple Watch Series 9 (Shipping address form)', 'success');
    }
  };

  const handleCycleClaimState = () => {
    soundFx.playClick();
    const states = ['not_submitted', 'submitted', 'processing', 'completed', 'expired'];
    const currentIdx = states.indexOf(claimState);
    const nextState = states[(currentIdx + 1) % states.length];
    setClaimState(nextState);

    const labels = {
      not_submitted: 'Not Submitted (Claim Prize)',
      submitted: 'Claim Submitted ✓ (Our team will process your prize)',
      processing: 'Prize Verification In Progress',
      completed: 'Prize Delivered ✓',
      expired: 'Claim Window Expired'
    };
    showToast('⚙️ Claim State Updated', labels[nextState], 'info');
  };

  const handleAddCoins = () => {
    soundFx.playCoin();
    setUserState(prev => ({ ...prev, coins: prev.coins + 1000 }));
    showToast('💰 Coins Added!', '+1,000 VELoop Loyalty Coins added to balance', 'gold');
  };

  const handleToggleAuth = () => {
    soundFx.playClick();
    setUserState(prev => {
      const nextAuth = !prev.isLoggedIn;
      showToast(
        nextAuth ? `👤 Member Logged In (${currentUserId})` : '🔒 Logged Out',
        nextAuth ? `Viewing giveaways as authenticated member ${currentUserId}` : 'Viewing giveaways in logged out guest state',
        nextAuth ? 'success' : 'info'
      );
      return { ...prev, isLoggedIn: nextAuth };
    });
  };

  const [lifecycleStage, setLifecycleStage] = useState(1);

  // Requirement 61: Previous Winner Transition Lifecycle
  // Current Giveaway -> Giveaway Ends -> Winners Announced -> Move to Previous Winners -> New Giveaway Becomes Current
  const handleCycleLifecycleStage = () => {
    soundFx.playClick();
    const nextStage = lifecycleStage === 5 ? 1 : lifecycleStage + 1;
    setLifecycleStage(nextStage);

    if (nextStage === 1) {
      // 1. Current Giveaway
      setGiveaways(mockActiveGiveaways.map(g => ({
        ...g,
        status: 'active',
        statusLabel: 'Giveaway Live',
        endsAt: new Date(Date.now() + 4 * 86400000 + 12 * 3600000).toISOString()
      })));
      setHeroGiveaway({
        ...mockHeroGiveaway,
        status: 'active',
        endsAt: new Date(Date.now() + 3 * 86400000 + 14 * 3600000).toISOString()
      });
      showToast('🟢 Step 1: Current Giveaway', 'Active giveaway is live with countdown running and entries open.', 'info');
    } else if (nextStage === 2) {
      // 2. Giveaway Ends
      setGiveaways(mockActiveGiveaways.map(g => ({
        ...g,
        status: 'ended',
        statusLabel: 'Giveaway Ended',
        winnerName: 'VE****82',
        endsAt: new Date(Date.now() - 1000).toISOString()
      })));
      setHeroGiveaway({
        ...mockHeroGiveaway,
        status: 'ended',
        winnerName: 'VE****82',
        endsAt: new Date(Date.now() - 1000).toISOString()
      });
      showToast('⏳ Step 2: Giveaway Ends', 'Countdown timer reached 00:00:00. Pool locked for drawing.', 'gold');
    } else if (nextStage === 3) {
      // 3. Winners Announced
      setActiveWinnersTab('spotlight');
      setIsRevealOpen(true);
      showToast('🏆 Step 3: Winners Announced', 'Provably fair winners picked & announced across platform.', 'gold');
    } else if (nextStage === 4) {
      // 4. Current Winners Move to Previous Winners
      setArchiveWinners(prev => {
        const newArchived = [
          {
            id: `arch-${Date.now()}`,
            giveawayName: 'August Flagship Tech Drop',
            user: 'VE****82',
            prize: 'iPhone 15 Pro Titanium',
            val: '₹1,34,900',
            ticket: '#VEL-82194-IN',
            date: 'August 10, 2026',
            category: 'Flagship Mobile',
            status: 'Delivered & Verified',
            tracking: 'FDX-8829-9140'
          },
          ...prev.filter(w => w.ticket !== '#VEL-82194-IN')
        ];
        return newArchived;
      });
      setActiveWinnersTab('archive');
      showToast('📜 Step 4: Move to Previous Winners', 'Concluded winners immutably archived into Previous Winners registry.', 'info');
    } else if (nextStage === 5) {
      // 5. New Giveaway Becomes Current
      const nextEndDate = new Date(Date.now() + 7 * 86400000).toISOString();
      setGiveaways(mockActiveGiveaways.map(g => ({
        ...g,
        status: 'active',
        statusLabel: 'Giveaway Live',
        totalTicketsEntered: 0,
        endsAt: nextEndDate
      })));
      setHeroGiveaway({
        ...mockHeroGiveaway,
        id: `GW-2026-${Date.now().toString().slice(-4)}`,
        title: 'Fall Creator Series - Apple Studio & Pro Studio Display',
        status: 'active',
        totalTicketsEntered: 0,
        endsAt: nextEndDate
      });
      setUserState(prev => ({
        ...prev,
        userEntries: {}
      }));
      setActiveWinnersTab('current');
      showToast('🚀 Step 5: New Giveaway Becomes Current', 'Fresh prize cycle activated! Ready for new daily free and bonus entries.', 'success');
    }
  };

  const handleResetData = () => {
    soundFx.playClick();
    setLifecycleStage(1);
    setCurrentUserId('VE10025');
    setClaimState('not_submitted');
    setGiveaways(mockActiveGiveaways);
    setHeroGiveaway(mockHeroGiveaway);
    setArchiveWinners(mockArchiveWinners);
    setUserState({
      name: 'Alex Thorne',
      userId: 'VE10025',
      isLoggedIn: true,
      coins: 1450,
      activeTickets: 12,
      soundEnabled: true,
      userEntries: {
        'gw-apple-studio': { tickets: 5 },
        'gw-ps5-pro': { tickets: 3 },
        'gw-iphone-titanium': { tickets: 4 }
      },
      quests: mockQuestTasks
    });
    showToast('🔄 State Reset', 'Demo data reset to initial values', 'info');
  };

  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleToggleLoading = () => {
    soundFx.playClick();
    setIsLoading(prev => {
      const next = !prev;
      showToast(next ? '⏳ Skeletons Active' : '✨ Content Loaded', next ? 'Viewing simulated skeleton loading states across all cards' : 'Live data restored', 'info');
      return next;
    });
  };

  const handleToggleError = () => {
    soundFx.playClick();
    setHasError(prev => {
      const next = !prev;
      showToast(next ? '⚠️ Error State Simulated' : '✨ Error Cleared', next ? 'Displaying friendly error screen with Try Again recovery' : 'Normal platform view restored', 'info');
      return next;
    });
  };

  const handleRetry = () => {
    soundFx.playSuccess();
    setHasError(false);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      showToast('✨ Connected', 'Giveaway data retrieved successfully!', 'success');
    }, 600);
  };

  return (
    <div className={styles.pageWrap}>
      {/* 1. Interactive Demo Simulation Toolbar (Requirements 32, 33, 34, 46, 47, 54, 65, 66) */}
      <SimulationToolbar
        isLoggedIn={userState.isLoggedIn !== false}
        currentUserId={currentUserId}
        currentStage={lifecycleStage}
        claimState={claimState}
        activeUserStatePreset={activeUserStatePreset}
        isLoading={isLoading}
        hasError={hasError}
        onToggleLoading={handleToggleLoading}
        onToggleError={handleToggleError}
        onSelectUserState={handleCycleUserStatePreset}
        onCycleLifecycleStage={handleCycleLifecycleStage}
        onCycleUserIdentity={handleCycleUserIdentity}
        onCycleClaimState={handleCycleClaimState}
        onToggleAuth={handleToggleAuth}
        onAddCoins={handleAddCoins}
        onResetData={handleResetData}
        onOpenReveal={() => setIsRevealOpen(true)}
      />

      {/* 2. Main Brand Header with Light/Dark Theme Toggle */}
      <Header
        userState={{ ...userState, userId: currentUserId }}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onToggleSound={handleToggleSound}
        onOpenClaim={() => handleOpenClaim(winningRecord?.prize || 'Apple Watch Series 9')}
        onOpenRules={() => setIsRulesOpen(true)}
        onLoginClick={handleLogin}
      />

      {/* 3. Live Winner Announcement Slider */}
      <WinnerSlider />

      {/* Main Content Sections */}
      <main className={styles.mainContainer}>
        {/* Requirement 66: Error State View */}
        {hasError ? (
          <ErrorState
            title="We couldn't load the giveaway information."
            subtitle="Something went wrong while connecting to the prize vault. Please check your network or try again."
            onRetry={handleRetry}
            onReset={handleResetData}
          />
        ) : (
          <>
            {/* Winner Claim Area or Non-Winner Experience (Requirements 26, 32, 33, 34, 58) */}
            <WinnerClaimBanner
              isLoggedIn={userState.isLoggedIn !== false}
              currentUserId={currentUserId}
              winningRecord={winningRecord}
              claimState={claimState}
              onClaimPrize={handleOpenClaim}
              onViewWinners={() => {
                setActiveWinnersTab('spotlight');
                const el = document.getElementById('winners-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              onExploreNextGiveaway={() => {
                const el = document.getElementById('active-giveaways') || document.querySelector('#featured-giveaways');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            />

        {/* 4. Reference-Inspired Exclusive Giveaway Banner */}
        <ExclusiveBanner
          onClaimCodeSuccess={handleClaimCodeSuccess}
          onOpenParticipation={handleNavigateToDetails}
        />

        {/* 5. Flagship Hero Giveaway with Countdown & Odds (Requirement 65: HeroSkeleton) */}
        {isLoading ? (
          <HeroSkeleton />
        ) : (
          <GiveawayHero
            giveaway={heroGiveaway}
            userEntryCount={userState.userEntries[heroGiveaway?.id]?.tickets || 0}
            isLoggedIn={userState.isLoggedIn !== false}
            onEnter={() => handleNavigateToDetails(heroGiveaway?.slug || heroGiveaway?.id)}
            onOpenFairModal={() => { setInspectingWinner(null); setIsFairOpen(true); }}
            onOpenReveal={() => setIsRevealOpen(true)}
            onNavigateToWinners={() => {
              setActiveWinnersTab('spotlight');
              const el = document.getElementById('winners-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          />
        )}

        {/* 6. Metrics & Community Strip (Requirement 65: StatsSkeleton) */}
        {isLoading ? (
          <StatsSkeleton />
        ) : (
          <GiveawayStats />
        )}

        {/* 7. Dual Split Hub: Featured Giveaways & How To Participate */}
        <div className="container-custom" id="active-giveaways">
          <div className={styles.splitGiveawayHub}>
            <div className={styles.giveawaysCol}>
              {isLoading ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
                  <PrizeCardSkeleton />
                  <PrizeCardSkeleton />
                  <PrizeCardSkeleton />
                </div>
              ) : (
                <FeaturedGiveaways
                  giveaways={giveaways}
                  userEntries={userState.userEntries}
                  isLoggedIn={userState.isLoggedIn !== false}
                  onEnterGiveaway={handleNavigateToDetails}
                  onViewDetails={(prize) => {
                    soundFx.playClick();
                    setSelectedDrawerPrize(prize);
                  }}
                />
              )}
            </div>
            <div className={styles.howToCol}>
              <HowToParticipate onOpenRules={() => setIsRulesOpen(true)} />
            </div>
          </div>
        </div>

        {/* 8. Verified Winners & Historical Archive */}
        {isLoading ? (
          <div className="container-custom" style={{ margin: '2rem auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
              <WinnerCardSkeleton />
              <WinnerCardSkeleton />
              <WinnerCardSkeleton />
            </div>
          </div>
        ) : (
          <WinnersTabs
            giveaways={giveaways}
            heroGiveaway={heroGiveaway}
            spotlightWinners={spotlightWinners}
            archiveWinners={archiveWinners}
            currentTab={activeWinnersTab}
            onInspectProof={handleInspectProof}
            onOpenFairModal={() => { setInspectingWinner(null); setIsFairOpen(true); }}
            onEnterGiveaway={handleNavigateToDetails}
          />
        )}

        {/* 9. Trust & Security Badges (Requirement 43) */}
        <TrustSection onOpenRules={() => setIsRulesOpen(true)} />

        {/* 10. High-Impact Call to Action (CTA) Strip (Requirement 42) */}
        <PreFooterCTA
          onClaimFreeEntry={() => handleOpenParticipation(heroGiveaway?.id || 'GW-2026-08')}
          onOpenFairVerifier={() => { setInspectingWinner(null); setIsFairOpen(true); }}
          onOpenRules={() => setIsRulesOpen(true)}
        />

        {/* 11. FAQ Section */}
        <FAQ />
          </>
        )}
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className="container-custom">
          <div className={styles.footerGrid}>
            <div className={styles.footerBrand}>
              <div className={styles.footerLogo}>
                <Gift size={20} className={styles.iconEmerald} />
                <span>VELOOP <strong>REWARDS</strong></span>
              </div>
              <p>
                The certified loyalty rewards and consumer sweepstakes network. Official corporate partner giveaways with 100% free daily entries and verified cryptographic drawings.
              </p>
            </div>

            <div className={styles.footerCol}>
              <h5>Giveaway Vault</h5>
              <ul>
                <li><a href="#active-giveaways">Flagship Draws</a></li>
                <li><a href="#active-giveaways">Instant Digital Cards</a></li>
                <li><a href="#active-giveaways">VIP Exclusive Tiers</a></li>
                <li><a href="#how-it-works">Free Daily Entry Policy</a></li>
              </ul>
            </div>

            <div className={styles.footerCol}>
              <h5>Fairness & Trust</h5>
              <ul>
                <li><button onClick={() => { setInspectingWinner(null); setIsFairOpen(true); }}>Provably Fair Verifier</button></li>
                <li><button onClick={() => setIsRulesOpen(true)}>Official Sweepstakes Rules</button></li>
                <li><a href="#winners-section">Verified Delivery Records</a></li>
                <li><a href="#how-it-works">No Purchase Necessary</a></li>
              </ul>
            </div>

            <div className={styles.footerCol}>
              <h5>Member Support</h5>
              <ul>
                <li><button onClick={() => handleOpenClaim(winningRecord?.prize || 'Apple Watch Series 9')}>Prize Claim Portal</button></li>
                <li><a href="#faq">Fulfillment FAQ</a></li>
                <li><a href="mailto:support@veloop-rewards.io">Courier Tracking Help</a></li>
                <li><a href="#">Privacy & Data Shield</a></li>
              </ul>
            </div>
          </div>

          <div className={styles.footerBottom}>
            <p>© 2026 VELoop Rewards Inc. All rights reserved. Registered trademark.</p>
            <div className={styles.footerLegalPills}>
              <span>100% Free Daily Entries</span>
              <span>•</span>
              <span>Insured Courier Fulfillment</span>
              <span>•</span>
              <span>SHA-256 Verified Draws</span>
            </div>
          </div>
        </div>
      </footer>

      {/* MODALS (Requirement 68: Lazy-loaded with Suspense) */}
      <Suspense fallback={null}>
        {/* 1. Participation Modal */}
        {isParticipationOpen && (
          <ParticipationModal
            giveaway={activeModalGiveaway}
            userState={userState}
            isOpen={isParticipationOpen}
            onClose={() => setIsParticipationOpen(false)}
            onClaimFreeEntry={handleClaimFreeEntry}
            onClaimCoinBooster={handleClaimCoinBooster}
            onCompleteQuest={handleCompleteQuest}
            onLogin={handleLogin}
          />
        )}

        {/* 2. Prize Claim Modal (Physical, Gift Card, or Digital) */}
        {isClaimOpen && (
          <PrizeClaimModal
            isOpen={isClaimOpen}
            onClose={() => setIsClaimOpen(false)}
            defaultPrize={claimPrizeTitle || winningRecord?.prize || 'Apple Watch Series 9'}
            prizeType={winningRecord?.type || winningRecord?.prizeType || 'PHYSICAL'}
            giveawayName={winningRecord?.giveawayName || 'Summer Rewards'}
            defaultTicket={winningRecord?.ticket || '#VEL-10025-IN'}
            onSubmitClaim={(claimData) => {
              setClaimState('submitted');
              showToast('🎉 Prize Claim Registered!', `Tracking/Voucher: ${claimData.tracking}`, 'success');
            }}
          />
        )}

        {/* 3. Provably Fair Verification Modal */}
        {isFairOpen && (
          <ProvablyFairModal
            isOpen={isFairOpen}
            onClose={() => setIsFairOpen(false)}
            winnerData={inspectingWinner}
          />
        )}

        {/* 4. Official Giveaway Rules Modal */}
        {isRulesOpen && (
          <GiveawayRules
            isOpen={isRulesOpen}
            onClose={() => setIsRulesOpen(false)}
          />
        )}

        {/* 5. Winner Reveal Sequence Modal (Requirement 47) */}
        {isRevealOpen && (
          <WinnerRevealModal
            isOpen={isRevealOpen}
            onClose={() => setIsRevealOpen(false)}
            giveaway={heroGiveaway}
            onInspectProof={handleInspectProof}
            onNavigateToWinners={() => {
              setActiveWinnersTab('spotlight');
              const el = document.getElementById('winners-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          />
        )}

        {/* 6. Interactive Prize Detail Drawer (Requirement 78) */}
        {selectedDrawerPrize && (
          <PrizeDetailDrawer
            isOpen={Boolean(selectedDrawerPrize)}
            onClose={() => setSelectedDrawerPrize(null)}
            prize={selectedDrawerPrize}
            userEntryCount={userState.userEntries[selectedDrawerPrize?.id]?.tickets || 0}
            totalPoolTickets={selectedDrawerPrize?.totalTickets || 14200}
            poolCapacity={selectedDrawerPrize?.poolCap || 25000}
            onEnter={(id) => {
              setSelectedDrawerPrize(null);
              handleNavigateToDetails(id);
            }}
            onOpenRules={() => setIsRulesOpen(true)}
            onOpenFairModal={() => { setInspectingWinner(null); setIsFairOpen(true); }}
          />
        )}

        {/* 7. Entry Fee Confirmation Modal (Requirement 94) */}
        {confirmFeeGiveaway && (
          <EntryFeeConfirmationModal
            isOpen={Boolean(confirmFeeGiveaway)}
            onClose={() => setConfirmFeeGiveaway(null)}
            giveaway={confirmFeeGiveaway}
            userState={userState}
            onConfirmJoin={handleConfirmFeeJoin}
          />
        )}

        {/* 8. Login Requirement Modal (Requirement 98) */}
        {isLoginRequiredOpen && (
          <LoginRequiredModal
            isOpen={isLoginRequiredOpen}
            onClose={() => setIsLoginRequiredOpen(false)}
            giveawayTitle={activeModalGiveaway?.title}
          />
        )}

        {/* 9. Interactive Auth Modal */}
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
