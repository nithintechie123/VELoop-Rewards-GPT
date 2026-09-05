import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gift, Coins, Sparkles, CheckCircle2, Ticket, Flame, MessageSquare, Twitter, Users, ShieldCheck, Zap, Trophy, Lock, LogIn } from 'lucide-react';
import { soundFx } from '../../utils/soundFx';
import { ConfettiManager } from '../../utils/confetti';
import styles from './ParticipationModal.module.css';

/**
 * Requirement 55: Visitor State Handling in Participation Modal
 * If a visitor clicks participate:
 * "Please login or create an account to participate."
 */

export default function ParticipationModal({
  giveaway,
  userState,
  isOpen,
  onClose,
  onClaimFreeEntry,
  onClaimCoinBooster,
  onCompleteQuest,
  onLogin
}) {
  if (!isOpen || !giveaway) return null;

  const [activeTab, setActiveTab] = useState('free'); // 'free' | 'coins' | 'quests'
  const [selectedCoinTier, setSelectedCoinTier] = useState(150);
  const [generatedTicket, setGeneratedTicket] = useState(null);

  const isVisitor = userState.isLoggedIn === false;

  const coinPacks = [
    { coins: 50, tickets: 1, label: 'Single Booster' },
    { coins: 150, tickets: 5, label: '5x Multiplier (Popular)', isPopular: true },
    { coins: 500, tickets: 20, label: '20x VIP Power Pack' }
  ];

  const handleFreeEntry = () => {
    if (isVisitor) {
      soundFx.playClick();
      alert('Please login or create an account to participate.');
      if (onLogin) onLogin();
      return;
    }

    const ticketId = onClaimFreeEntry(giveaway.id);
    setGeneratedTicket({
      code: ticketId,
      tickets: 1,
      type: 'Daily Free Entry'
    });
    soundFx.playSuccess();
    ConfettiManager.burst(window.innerWidth / 2, window.innerHeight / 2, 85);
  };

  const handleCoinBoost = () => {
    if (isVisitor) {
      soundFx.playClick();
      alert('Please login or create an account to participate.');
      if (onLogin) onLogin();
      return;
    }

    if (userState.coins < selectedCoinTier) {
      soundFx.playClick();
      alert(`You need ${selectedCoinTier} VELoop Coins. Click "+1,000 Coins" in the demo bar!`);
      return;
    }
    const pack = coinPacks.find(p => p.coins === selectedCoinTier);
    const ticketId = onClaimCoinBooster(giveaway.id, pack.tickets, pack.coins);
    setGeneratedTicket({
      code: ticketId,
      tickets: pack.tickets,
      type: `${pack.coins} Coins Booster (+${pack.tickets} Tickets)`
    });
    soundFx.playCoin();
    setTimeout(() => soundFx.playSuccess(), 120);
    ConfettiManager.burst(window.innerWidth / 2, window.innerHeight / 2, 95);
  };

  const handleQuest = (task) => {
    if (isVisitor) {
      soundFx.playClick();
      alert('Please login or create an account to participate.');
      if (onLogin) onLogin();
      return;
    }

    const ticketId = onCompleteQuest(task, giveaway.id);
    soundFx.playSuccess();
    ConfettiManager.burst(window.innerWidth / 2, window.innerHeight / 2, 75);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <motion.div
      className={styles.overlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="participation-modal-title"
    >
      <motion.div
        className={styles.modal}
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h3 className={styles.title} id="participation-modal-title">Participate & Enter Draw</h3>
            <p className={styles.subtitle}>Choose your entry method below</p>
          </div>
          <motion.button
            className={styles.closeBtn}
            whileHover={{ rotate: 90, scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={18} />
          </motion.button>
        </div>

        {/* Visitor Warning Gate Banner (Requirement 55) */}
        {isVisitor && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.12)',
            borderBottom: '1px solid rgba(239, 68, 68, 0.35)',
            padding: '0.85rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Lock size={16} style={{ color: '#f87171', flexShrink: 0 }} />
              <span style={{ fontSize: '0.84rem', color: '#fca5a5', fontWeight: 700 }}>
                Please login or create an account to participate.
              </span>
            </div>
            <button
              className="btn-primary-glow btn-sm"
              onClick={() => {
                if (onLogin) onLogin();
              }}
            >
              <LogIn size={13} /> Login / Signup Now
            </button>
          </div>
        )}

        {/* Prize Summary Header */}
        <div className={styles.prizeSummary}>
          <img src={giveaway.image} alt={giveaway.title} className={styles.prizeThumb} loading="lazy" decoding="async" />
          <div className={styles.prizeMeta}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <h4 style={{ margin: 0 }}>{giveaway.title}</h4>
              <span className="badge-pill-custom badge-gold-custom" style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem' }}>
                <Trophy size={11} /> {giveaway.winnerLabel || (giveaway.winnerCount ? `${giveaway.winnerCount} Winner${giveaway.winnerCount > 1 ? 's' : ''}` : '1 Winner')}
              </span>
            </div>
            <span className={styles.prizeVal}>Est. Value: ₹{giveaway.valueUSD.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Your Entries Status Bar (Requirements 56 & 64) */}
        <div className={styles.userEntriesBanner}>
          <div className={styles.entriesCountBox}>
            <span className={styles.entriesLabel}>
              {(userState.userEntries?.[giveaway.id]?.tickets || 0) > 0 ? 'YOUR ENTRIES' : 'PARTICIPATION STATUS'}
            </span>
            <div className={styles.entriesValRow}>
              <Ticket size={18} className={styles.ticketEmeraldIcon} />
              <strong className={styles.entriesNum}>
                {(userState.userEntries?.[giveaway.id]?.tickets || 0) > 0
                  ? `${userState.userEntries[giveaway.id].tickets} Entries`
                  : 'No Active Participation'}
              </strong>
            </div>
          </div>
          <div className={styles.entriesHelpText}>
            <span>
              {(userState.userEntries?.[giveaway.id]?.tickets || 0) > 0
                ? 'You are currently participating. Complete more tasks or coin boosts to increase win probability.'
                : 'Join the giveaway to start earning entries.'}
            </span>
          </div>
        </div>

        {/* Tabs (Requirement 67) */}
        <div className={styles.tabsRow} role="tablist" aria-label="Participation Options">
          <button
            className={`${styles.tabBtn} ${activeTab === 'free' ? styles.tabActive : ''}`}
            onClick={() => { setActiveTab('free'); soundFx.playClick(); }}
            role="tab"
            aria-selected={activeTab === 'free'}
          >
            <Gift size={15} /> 1. Free Daily Entry
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === 'coins' ? styles.tabActive : ''}`}
            onClick={() => { setActiveTab('coins'); soundFx.playClick(); }}
            role="tab"
            aria-selected={activeTab === 'coins'}
          >
            <Coins size={15} /> 2. Coin Boosters
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === 'quests' ? styles.tabActive : ''}`}
            onClick={() => { setActiveTab('quests'); soundFx.playClick(); }}
            role="tab"
            aria-selected={activeTab === 'quests'}
          >
            <Sparkles size={15} /> 3. Quests & Tasks
          </button>
        </div>

        {/* Tab Content with AnimatePresence */}
        <div className={styles.tabBody}>
          <AnimatePresence mode="wait">
            {/* TAB 1: FREE ENTRY */}
            {activeTab === 'free' && (
              <motion.div
                key="tab-free"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                transition={{ duration: 0.2 }}
                className={styles.freeCard}
              >
                <div className={styles.freeIconWrap}>
                  <Gift size={32} />
                </div>
                <h4>Guaranteed Free Daily Entry</h4>
                <p>
                  Every VELoop member is entitled to 1 free serialized ticket per day with zero purchase required.
                </p>
                <motion.button
                  className="btn-primary-glow mt-2"
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleFreeEntry}
                >
                  <Zap size={18} /> {isVisitor ? 'Login / Signup to Participate' : 'Claim Free Ticket Now'}
                </motion.button>
              </motion.div>
            )}

            {/* TAB 2: COIN BOOSTERS */}
            {activeTab === 'coins' && (
              <motion.div
                key="tab-coins"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                transition={{ duration: 0.2 }}
                className={styles.coinsWrap}
              >
                <div className={styles.userCoinsIndicator}>
                  <div>
                    <span>Your Balance: </span>
                    <strong>{(userState.coins || 0).toLocaleString()} VELoop Coins</strong>
                  </div>
                  {userState.coins >= selectedCoinTier ? (
                    <span className={styles.balanceStatusSuccess}>✓ You have enough VEs</span>
                  ) : (
                    <span className={styles.balanceStatusWarning}>Need +{(selectedCoinTier - (userState.coins || 0)).toLocaleString()} VEs</span>
                  )}
                </div>

                <div className={styles.coinPacksGrid}>
                  {coinPacks.map(pack => (
                    <motion.div
                      key={pack.coins}
                      className={`${styles.coinPackCard} ${selectedCoinTier === pack.coins ? styles.packSelected : ''}`}
                      whileHover={{ scale: 1.03, y: -2 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => { setSelectedCoinTier(pack.coins); soundFx.playClick(); }}
                    >
                      {pack.isPopular && <span className={styles.popularBadge}>POPULAR</span>}
                      <span className={styles.packTickets}>+{pack.tickets} Tickets</span>
                      <span className={styles.packCost}>
                        <Coins size={13} /> {pack.coins} Coins
                      </span>
                    </motion.div>
                  ))}
                </div>

                <motion.button
                  className="btn-gold-glow w-100 justify-content-center"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={handleCoinBoost}
                >
                  <Zap size={18} /> {isVisitor ? 'Login / Signup to Participate' : `Redeem Booster (-${selectedCoinTier} Coins)`}
                </motion.button>
              </motion.div>
            )}

            {/* TAB 3: QUESTS */}
            {activeTab === 'quests' && (
              <motion.div
                key="tab-quests"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                transition={{ duration: 0.2 }}
                className={styles.questsList}
              >
                <p className={styles.questIntro}>
                  Complete community quests to earn extra tickets and loyalty coins instantly:
                </p>
                {(userState.quests || []).map(task => (
                  <div key={task.id} className={`${styles.questItem} ${task.completed ? styles.questDone : ''}`}>
                    <div className={styles.questLeft}>
                      <div className={styles.questIconBox}>
                        {task.icon === 'Flame' && <Flame size={16} />}
                        {task.icon === 'MessageSquare' && <MessageSquare size={16} />}
                        {task.icon === 'Twitter' && <Twitter size={16} />}
                        {task.icon === 'Users' && <Users size={16} />}
                        {task.icon === 'ShieldCheck' && <ShieldCheck size={16} />}
                      </div>
                      <div>
                        <h5>{task.title}</h5>
                        <p>{task.desc}</p>
                      </div>
                    </div>

                    <div className={styles.questRight}>
                      {task.completed ? (
                        <span className="badge-pill-custom badge-active-custom">
                          <CheckCircle2 size={12} /> Claimed
                        </span>
                      ) : (
                        <motion.button
                          className="btn-primary-glow btn-sm"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.94 }}
                          onClick={() => handleQuest(task)}
                        >
                          Claim +{task.rewardTickets} 🎟️
                        </motion.button>
                      )}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Serialized Ticket Stamp 3D Reveal */}
          {generatedTicket && (
            <motion.div
              className={styles.ticketCardReveal}
              initial={{ opacity: 0, scale: 0.8, rotateX: -60 }}
              animate={{ opacity: 1, scale: 1, rotateX: 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            >
              <div className={styles.ticketHeader}>
                <Ticket size={16} className={styles.ticketIcon} />
                <span>OFFICIAL SERIALIZED TICKET CONFIRMED</span>
              </div>
              <div className={styles.ticketCodeDisplay}>
                {generatedTicket.code}
              </div>
              <p className={styles.ticketSub}>
                {generatedTicket.type} • Verified on SHA-256 draw registry
              </p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
