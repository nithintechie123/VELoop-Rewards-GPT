import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gift, Coins, Sparkles, CheckCircle2, Ticket, Flame, MessageSquare, Twitter, Users, ShieldCheck, Zap, Trophy } from 'lucide-react';
import { soundFx } from '../../utils/soundFx';
import { ConfettiManager } from '../../utils/confetti';
import styles from './ParticipationModal.module.css';

export default function ParticipationModal({
  giveaway,
  userState,
  isOpen,
  onClose,
  onClaimFreeEntry,
  onClaimCoinBooster,
  onCompleteQuest
}) {
  if (!isOpen || !giveaway) return null;

  const [activeTab, setActiveTab] = useState('free'); // 'free' | 'coins' | 'quests'
  const [selectedCoinTier, setSelectedCoinTier] = useState(150);
  const [generatedTicket, setGeneratedTicket] = useState(null);

  const coinPacks = [
    { coins: 50, tickets: 1, label: 'Single Booster' },
    { coins: 150, tickets: 5, label: '5x Multiplier (Popular)', isPopular: true },
    { coins: 500, tickets: 20, label: '20x VIP Power Pack' }
  ];

  const handleFreeEntry = () => {
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
    const ticketId = onCompleteQuest(task, giveaway.id);
    soundFx.playSuccess();
    ConfettiManager.burst(window.innerWidth / 2, window.innerHeight / 2, 75);
  };

  return (
    <motion.div
      className={styles.overlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
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
            <h3 className={styles.title}>Participate & Enter Draw</h3>
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

        {/* Prize Summary Header */}
        <div className={styles.prizeSummary}>
          <img src={giveaway.image} alt={giveaway.title} className={styles.prizeThumb} />
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

        {/* Your Entries Status Bar */}
        <div className={styles.userEntriesBanner}>
          <div className={styles.entriesCountBox}>
            <span className={styles.entriesLabel}>YOUR ENTRIES</span>
            <div className={styles.entriesValRow}>
              <Ticket size={18} className={styles.ticketEmeraldIcon} />
              <strong className={styles.entriesNum}>
                {userState.userEntries[giveaway.id]?.tickets || 0} Entries
              </strong>
            </div>
          </div>
          <div className={styles.entriesHelpText}>
            <span>Complete eligible tasks or use coin boosters to earn more entries.</span>
          </div>
        </div>

        {/* Tabs */}
        <div className={styles.tabsRow}>
          <button
            className={`${styles.tabBtn} ${activeTab === 'free' ? styles.tabActive : ''}`}
            onClick={() => { setActiveTab('free'); soundFx.playClick(); }}
          >
            <Gift size={15} /> 1. Free Daily Entry
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === 'coins' ? styles.tabActive : ''}`}
            onClick={() => { setActiveTab('coins'); soundFx.playClick(); }}
          >
            <Coins size={15} /> 2. Coin Boosters
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === 'quests' ? styles.tabActive : ''}`}
            onClick={() => { setActiveTab('quests'); soundFx.playClick(); }}
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
                  <Zap size={18} /> Claim Free Ticket Now
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
                  <span>Your Balance:</span>
                  <strong>{userState.coins.toLocaleString()} VELoop Coins</strong>
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
                  <Zap size={18} /> Redeem Booster (-{selectedCoinTier} Coins)
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
                {userState.quests.map(task => (
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
