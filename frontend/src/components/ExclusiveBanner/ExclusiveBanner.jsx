import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Zap, Gift, ArrowRight, X, CheckCircle2, Sparkles, KeyRound, Copy, Star } from 'lucide-react';
import { soundFx } from '../../utils/soundFx';
import { ConfettiManager } from '../../utils/confetti';
import styles from './ExclusiveBanner.module.css';

export default function ExclusiveBanner({ onClaimCodeSuccess, onOpenParticipation }) {
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [code, setCode] = useState('');
  const [codeSuccess, setCodeSuccess] = useState(null);
  const [codeError, setCodeError] = useState('');
  const [copiedCode, setCopiedCode] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  };

  const handleOpenCodeModal = () => {
    soundFx.playClick();
    setIsCodeModalOpen(true);
    setCodeSuccess(null);
    setCodeError('');
  };

  const handleRedeem = (e) => {
    if (e) e.preventDefault();
    if (!code.trim()) {
      setCodeError('Please enter a valid giveaway code.');
      return;
    }

    const cleanCode = code.trim().toUpperCase();
    if (['VELOOP2026', 'VIPREWARD', 'LUCKY100', 'GIVEAWAY', 'BONUS'].includes(cleanCode)) {
      soundFx.playSuccess();
      soundFx.playCoin();
      ConfettiManager.burst(window.innerWidth / 2, window.innerHeight / 2, 100);
      setCodeSuccess(`Code "${cleanCode}" applied! +500 VELoop Coins and +5 VIP Entries added.`);
      setCodeError('');
      if (onClaimCodeSuccess) {
        onClaimCodeSuccess({ code: cleanCode, coins: 500, tickets: 5 });
      }
    } else {
      soundFx.playClick();
      setCodeError('Invalid or expired code. Try using "VELOOP2026" or "VIPREWARD".');
    }
  };

  const handleQuickSelectCode = (c) => {
    soundFx.playClick();
    setCode(c);
    setCopiedCode(c);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <section className={styles.sectionWrap}>
      <div className="container-custom">
        <motion.div
          className={styles.bannerCard}
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => {
            setIsHovered(false);
            setMousePos({ x: 0, y: 0 });
          }}
          style={{
            transform: isHovered
              ? `perspective(1000px) rotateY(${mousePos.x * 2.5}deg) rotateX(${-mousePos.y * 2.5}deg)`
              : 'perspective(1000px) rotateY(0deg) rotateX(0deg)',
            transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.5s ease-out'
          }}
        >
          {/* Shimmer Ambient Border Line */}
          <div className={styles.shimmerBorder} />

          {/* Ambient Glows with subtle cursor interaction */}
          <div
            className={styles.glowLeft}
            style={{
              transform: `translate(${mousePos.x * 25}px, ${mousePos.y * 25}px)`,
              transition: 'transform 0.2s ease-out'
            }}
          />
          <div
            className={styles.glowRight}
            style={{
              transform: `translate(${-mousePos.x * 25}px, ${-mousePos.y * 25}px)`,
              transition: 'transform 0.2s ease-out'
            }}
          />
          <div className={styles.glowCenter} />

          {/* Top Bar with Badge Row */}
          <div className={styles.topBar}>
            <div className={styles.topBadgesGroup}>
              <span className={styles.exclusivePill}>
                <Sparkles size={13} className={styles.sparkleGold} /> EXCLUSIVE VAULT
              </span>
              <button className={styles.codePillBtn} onClick={handleOpenCodeModal}>
                <KeyRound size={13} className={styles.codeIcon} />
                <span>Secret Promo Code</span>
                <span className={styles.codePulseDot} />
              </button>
            </div>
            <div className={styles.topVerifiedSeal}>
              <ShieldCheck size={14} /> Official Verified Partner
            </div>
          </div>

          <div className={styles.mainGrid}>
            {/* Left 3D Gift Box Area */}
            <div className={styles.leftVisual}>
              <div className={styles.giftStage}>
                <div className={styles.giftPedestal} />
                <div className={styles.energyRing} />
                
                {/* SVG 3D Gift Box with Ribbon & Stars */}
                <motion.div
                  className={styles.giftBoxWrapper}
                  animate={{ y: [0, -10, 0], rotateZ: [-1, 1, -1] }}
                  transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <svg viewBox="0 0 200 200" className={styles.giftSvg}>
                    <defs>
                      <linearGradient id="purpleFront" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#4c1d95" />
                        <stop offset="100%" stopColor="#1e103c" />
                      </linearGradient>
                      <linearGradient id="purpleTop" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#8b5cf6" />
                        <stop offset="100%" stopColor="#5b21b6" />
                      </linearGradient>
                      <linearGradient id="purpleRight" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#3b0764" />
                        <stop offset="100%" stopColor="#13072b" />
                      </linearGradient>
                      <linearGradient id="goldRibbon" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#fef08a" />
                        <stop offset="50%" stopColor="#f59e0b" />
                        <stop offset="100%" stopColor="#b45309" />
                      </linearGradient>
                      <filter id="giftGlow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="8" stdDeviation="14" floodColor="#a855f7" floodOpacity="0.6" />
                      </filter>
                    </defs>

                    {/* Ground Reflection */}
                    <ellipse cx="100" cy="175" rx="60" ry="16" fill="#c084fc" opacity="0.35" filter="blur(10px)" />

                    {/* Box Top Face */}
                    <polygon points="100,48 158,74 100,100 42,74" fill="url(#purpleTop)" filter="url(#giftGlow)" />
                    {/* Box Left Face */}
                    <polygon points="42,74 100,100 100,166 42,139" fill="url(#purpleFront)" />
                    {/* Box Right Face */}
                    <polygon points="100,100 158,74 158,139 100,166" fill="url(#purpleRight)" />

                    {/* Lid Overhang Edges */}
                    <polygon points="38,72 100,99 100,109 38,82" fill="#6d28d9" />
                    <polygon points="100,99 162,72 162,82 100,109" fill="#4c1d95" />
                    <polygon points="100,44 162,72 100,99 38,72" fill="#7c3aed" />

                    {/* Gold Ribbons on Box */}
                    <polygon points="94,46 106,51 106,96 94,91" fill="url(#goldRibbon)" />
                    <polygon points="42,72 53,77 147,72 158,67" fill="url(#goldRibbon)" />
                    <polygon points="67,86 78,91 78,155 67,150" fill="url(#goldRibbon)" />
                    <polygon points="122,89 133,84 133,148 122,153" fill="url(#goldRibbon)" />

                    {/* Bow on Top */}
                    <path d="M100,46 C82,20 55,32 78,46 C89,53 98,48 100,46 Z" fill="url(#goldRibbon)" />
                    <path d="M100,46 C118,20 145,32 122,46 C111,53 102,48 100,46 Z" fill="url(#goldRibbon)" />
                    <circle cx="100" cy="46" r="7.5" fill="#fef08a" />

                    {/* Sparkles on box */}
                    <text x="56" y="125" fill="#fbbf24" fontSize="10">★</text>
                    <text x="82" y="115" fill="#fde68a" fontSize="8">✦</text>
                    <text x="85" y="146" fill="#fbbf24" fontSize="9">★</text>
                    <text x="112" y="130" fill="#fde68a" fontSize="8">✦</text>
                    <text x="140" y="120" fill="#fbbf24" fontSize="10">★</text>
                    <text x="144" y="142" fill="#fde68a" fontSize="8">✦</text>
                  </svg>
                </motion.div>

                {/* Floating Particle Accents */}
                <div className={styles.particle1}>✦</div>
                <div className={styles.particle2}>★</div>
                <div className={styles.particle3}>◆</div>
                <div className={styles.particle4}>✦</div>
              </div>
            </div>

            {/* Center Content Area */}
            <div className={styles.centerContent}>
              <div className={styles.subtag}>
                <span className={styles.sparkleStar}>✦</span>
                <span>UNLOCK EXCLUSIVE REWARD TIERS</span>
                <span className={styles.sparkleStar}>✦</span>
              </div>

              <h2 className={styles.mainHeading}>
                Exclusive Giveaway <span className={styles.purpleGradientText}>Vault Rewards</span>
              </h2>

              <p className={styles.description}>
                Redeem partner promo codes, claim your guaranteed <strong>Free Daily Tickets</strong>, and enter high-tier flagship draws with transparent cryptographic odds.
              </p>

              {/* 3 Trust / Feature Badges */}
              <div className={styles.featuresRow}>
                <div className={styles.featurePill}>
                  <div className={styles.featureIconWrap}>
                    <ShieldCheck size={16} className={styles.cyanIcon} />
                  </div>
                  <div className={styles.featureText}>
                    <strong>100% Provably Fair</strong>
                    <span>SHA-256 Verified Draws</span>
                  </div>
                </div>

                <div className={styles.featurePill}>
                  <div className={styles.featureIconWrap}>
                    <Zap size={16} className={styles.goldIcon} />
                  </div>
                  <div className={styles.featureText}>
                    <strong>Free Daily Entry</strong>
                    <span>No Purchase Necessary</span>
                  </div>
                </div>

                <div className={styles.featurePill}>
                  <div className={styles.featureIconWrap}>
                    <Gift size={16} className={styles.purpleIcon} />
                  </div>
                  <div className={styles.featureText}>
                    <strong>Instant Bonus Drops</strong>
                    <span>Coins & VIP Tickets</span>
                  </div>
                </div>
              </div>

              {/* Enter Giveaway CTA */}
              <div className={styles.ctaRow}>
                <motion.button
                  className={styles.enterBtn}
                  whileHover={{ scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => {
                    soundFx.playClick();
                    if (onOpenParticipation) onOpenParticipation('creator-bundle');
                  }}
                >
                  <Sparkles size={17} />
                  <span>Enter Giveaway Vault</span>
                  <ArrowRight size={17} className={styles.btnArrow} />
                </motion.button>

                <button className={styles.quickCodeBtn} onClick={handleOpenCodeModal}>
                  <KeyRound size={15} />
                  <span>Have a Promo Code? Redeem Here</span>
                </button>
              </div>
            </div>

            {/* Right Ticket Illustration Area */}
            <div className={styles.rightVisual}>
              <motion.div
                className={styles.ticketHolder}
                animate={{ y: [0, -8, 0], rotateZ: [0, 2.5, 0] }}
                transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
              >
                {/* SVG Golden Cutout VIP Ticket */}
                <svg viewBox="0 0 180 120" className={styles.ticketSvg}>
                  <defs>
                    <linearGradient id="goldTicketGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#ffd700" />
                      <stop offset="35%" stopColor="#f59e0b" />
                      <stop offset="70%" stopColor="#d97706" />
                      <stop offset="100%" stopColor="#92400e" />
                    </linearGradient>
                    <linearGradient id="darkTicketGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#22153e" />
                      <stop offset="100%" stopColor="#0f071d" />
                    </linearGradient>
                    <filter id="ticketShadow">
                      <feDropShadow dx="0" dy="12" stdDeviation="14" floodColor="#f59e0b" floodOpacity="0.35" />
                    </filter>
                  </defs>

                  {/* Golden Ticket Outer Body */}
                  <rect x="10" y="10" width="160" height="98" rx="10" fill="url(#goldTicketGrad)" filter="url(#ticketShadow)" />
                  
                  {/* Perforated Inner Ticket */}
                  <rect x="16" y="16" width="148" height="86" rx="8" fill="url(#darkTicketGrad)" />

                  {/* Ticket Notch Cutouts */}
                  <circle cx="10" cy="59" r="8" fill="#080314" />
                  <circle cx="170" cy="59" r="8" fill="#080314" />

                  {/* Perforated Line */}
                  <line x1="120" y1="18" x2="120" y2="100" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />

                  {/* Golden Star Circle */}
                  <circle cx="142" cy="59" r="14" fill="url(#goldTicketGrad)" />
                  <path d="M142,50 L145,56 L151,57 L147,61 L148,67 L142,64 L136,67 L137,61 L133,57 L139,56 Z" fill="#1f1435" />

                  {/* Texts */}
                  <text x="30" y="40" fill="#fbbf24" fontSize="8" letterSpacing="2">★★★ VIP PASS</text>
                  <text x="30" y="58" fill="#ffd700" fontSize="11" fontWeight="900" fontFamily="sans-serif" letterSpacing="1">GIVEAWAY</text>
                  <text x="30" y="74" fill="#cbd5e1" fontSize="7.5" fontFamily="monospace">#VEL-VIP-2026</text>
                  <text x="30" y="88" fill="#34d399" fontSize="6.5" fontWeight="700">✓ VERIFIED DRAW</text>
                </svg>

                {/* Ambient Particles */}
                <div className={styles.particleRight1}>✦</div>
                <div className={styles.particleRight2}>★</div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Code Redemption Modal */}
      <AnimatePresence>
        {isCodeModalOpen && (
          <motion.div
            className={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCodeModalOpen(false)}
          >
            <motion.div
              className={styles.modalBox}
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.modalHeader}>
                <div className={styles.modalTitleWrap}>
                  <div className={styles.modalIconCircle}>
                    <KeyRound size={20} className={styles.goldIcon} />
                  </div>
                  <div>
                    <h3>Redeem Giveaway Promo Code</h3>
                    <span className={styles.modalSubtitle}>Unlock bonus tickets & loyalty reward coins</span>
                  </div>
                </div>
                <button className={styles.modalCloseBtn} onClick={() => setIsCodeModalOpen(false)} aria-label="Close modal">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleRedeem} className={styles.modalBody}>
                <p className={styles.modalDesc}>
                  Enter an official VELoop partner or creator reward code to unlock instant bonus tickets and +500 VELoop Coins.
                </p>

                <div className={styles.inputGroup}>
                  <label htmlFor="giveaway-code-input">Secret Promo Code</label>
                  <div className={styles.inputWrap}>
                    <input
                      id="giveaway-code-input"
                      type="text"
                      placeholder="e.g. VELOOP2026"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className={styles.codeInput}
                      autoFocus
                    />
                    {code && (
                      <button type="button" className={styles.clearInputBtn} onClick={() => setCode('')}>
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>

                {codeSuccess && (
                  <motion.div className={styles.successBox} initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}>
                    <CheckCircle2 size={18} />
                    <span>{codeSuccess}</span>
                  </motion.div>
                )}

                {codeError && (
                  <motion.div className={styles.errorBox} initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}>
                    <span>{codeError}</span>
                  </motion.div>
                )}

                <div className={styles.codePillsQuick}>
                  <span className={styles.quickSelectLabel}>
                    <Sparkles size={12} className={styles.sparkleGold} /> Quick Tap Test Codes:
                  </span>
                  <div className={styles.pillGroup}>
                    {['VELOOP2026', 'VIPREWARD', 'LUCKY100', 'BONUS'].map((c) => (
                      <button
                        key={c}
                        type="button"
                        className={`${styles.codePill} ${code === c ? styles.codePillActive : ''}`}
                        onClick={() => handleQuickSelectCode(c)}
                      >
                        <code>{c}</code>
                        {copiedCode === c ? <CheckCircle2 size={12} /> : <Copy size={11} />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className={styles.modalActions}>
                  <button type="button" className="btn-outline-custom" onClick={() => setIsCodeModalOpen(false)}>
                    Close
                  </button>
                  <button type="submit" className="btn-gold-glow">
                    <Sparkles size={16} />
                    <span>Redeem Code →</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
