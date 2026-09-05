import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ShieldCheck, Zap, Gift, ArrowRight, X, CheckCircle2 } from 'lucide-react';
import { soundFx } from '../../utils/soundFx';
import { ConfettiManager } from '../../utils/confetti';
import styles from './ExclusiveBanner.module.css';

export default function ExclusiveBanner({ onClaimCodeSuccess, onOpenParticipation }) {
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [code, setCode] = useState('');
  const [codeSuccess, setCodeSuccess] = useState(null);
  const [codeError, setCodeError] = useState('');
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
    e.preventDefault();
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

  return (
    <section className={styles.sectionWrap}>
      <div className="container-custom">
        <motion.div
          className={styles.bannerCard}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
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
          {/* Ambient Glows with subtle cursor interaction */}
          <div
            className={styles.glowLeft}
            style={{
              transform: `translate(${mousePos.x * 20}px, ${mousePos.y * 20}px)`,
              transition: 'transform 0.2s ease-out'
            }}
          />
          <div
            className={styles.glowRight}
            style={{
              transform: `translate(${-mousePos.x * 20}px, ${-mousePos.y * 20}px)`,
              transition: 'transform 0.2s ease-out'
            }}
          />
          <div className={styles.glowCenter} />

          {/* Top Left Tag */}
          <div className={styles.topBar}>
            <button className={styles.codePillBtn} onClick={handleOpenCodeModal}>
              <Gift size={15} className={styles.codeIcon} />
              <span>Giveaway Code</span>
            </button>
          </div>

          <div className={styles.mainGrid}>
            {/* Left 3D Gift Box Area */}
            <div className={styles.leftVisual}>
              <div className={styles.giftStage}>
                <div className={styles.giftPedestal} />
                
                {/* SVG 3D Gift Box with Ribbon & Stars */}
                <motion.div
                  className={styles.giftBoxWrapper}
                  animate={{ y: [0, -8, 0], rotateZ: [-0.5, 0.5, -0.5] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <svg viewBox="0 0 200 200" className={styles.giftSvg}>
                    <defs>
                      <linearGradient id="purpleFront" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#432280" />
                        <stop offset="100%" stopColor="#25124d" />
                      </linearGradient>
                      <linearGradient id="purpleTop" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#6c3ce0" />
                        <stop offset="100%" stopColor="#4b24a3" />
                      </linearGradient>
                      <linearGradient id="purpleRight" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#301561" />
                        <stop offset="100%" stopColor="#1b0a3b" />
                      </linearGradient>
                      <linearGradient id="goldRibbon" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#ffe685" />
                        <stop offset="50%" stopColor="#f59e0b" />
                        <stop offset="100%" stopColor="#b45309" />
                      </linearGradient>
                      <filter id="giftGlow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#8b5cf6" floodOpacity="0.5" />
                      </filter>
                    </defs>

                    {/* Ground Reflection */}
                    <ellipse cx="100" cy="175" rx="55" ry="14" fill="#a855f7" opacity="0.4" filter="blur(8px)" />

                    {/* Box Top Face */}
                    <polygon points="100,50 155,75 100,100 45,75" fill="url(#purpleTop)" />
                    {/* Box Left Face */}
                    <polygon points="45,75 100,100 100,165 45,138" fill="url(#purpleFront)" />
                    {/* Box Right Face */}
                    <polygon points="100,100 155,75 155,138 100,165" fill="url(#purpleRight)" />

                    {/* Lid Edge */}
                    <polygon points="40,72 100,98 100,108 40,81" fill="#582cb8" />
                    <polygon points="100,98 160,72 160,81 100,108" fill="#3b177d" />
                    <polygon points="100,45 160,72 100,98 40,72" fill="#7947ea" />

                    {/* Gold Ribbons on Box */}
                    {/* Top Ribbons */}
                    <polygon points="94,48 106,53 106,95 94,90" fill="url(#goldRibbon)" />
                    <polygon points="45,72 55,77 145,72 155,67" fill="url(#goldRibbon)" />

                    {/* Left Front Ribbon */}
                    <polygon points="68,85 78,90 78,154 68,149" fill="url(#goldRibbon)" />
                    {/* Right Front Ribbon */}
                    <polygon points="122,88 132,83 132,147 122,152" fill="url(#goldRibbon)" />

                    {/* Bow on Top */}
                    <path d="M100,48 C85,25 60,35 80,48 C90,55 98,50 100,48 Z" fill="url(#goldRibbon)" />
                    <path d="M100,48 C115,25 140,35 120,48 C110,55 102,50 100,48 Z" fill="url(#goldRibbon)" />
                    <circle cx="100" cy="48" r="7" fill="#fde68a" />

                    {/* Sparkle stars on box */}
                    <text x="58" y="125" fill="#fbbf24" fontSize="9">★</text>
                    <text x="82" y="115" fill="#fde68a" fontSize="7">✦</text>
                    <text x="85" y="145" fill="#fbbf24" fontSize="8">★</text>
                    <text x="110" y="130" fill="#fde68a" fontSize="8">✦</text>
                    <text x="138" y="120" fill="#fbbf24" fontSize="9">★</text>
                    <text x="142" y="140" fill="#fde68a" fontSize="7">✦</text>
                  </svg>
                </motion.div>

                {/* Floating Gold Confetti */}
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
                <span>Unlock Amazing Rewards</span>
                <span className={styles.sparkleStar}>✦</span>
              </div>

              <h2 className={styles.mainHeading}>
                Exclusive Giveaway <span className={styles.purpleGradientText}>Rewards</span>
              </h2>

              <p className={styles.description}>
                Enter special giveaway codes and unlock exciting <strong>VELoop Rewards</strong> instantly. Complete eligible activities and collect daily guaranteed entries.
              </p>

              {/* 3 Trust / Feature Badges */}
              <div className={styles.featuresRow}>
                <div className={styles.featurePill}>
                  <div className={styles.featureIconWrap}>
                    <ShieldCheck size={16} className={styles.cyanIcon} />
                  </div>
                  <div className={styles.featureText}>
                    <strong>100% Safe</strong>
                    <span>Secure & Trusted</span>
                  </div>
                </div>

                <div className={styles.featurePill}>
                  <div className={styles.featureIconWrap}>
                    <Zap size={16} className={styles.goldIcon} />
                  </div>
                  <div className={styles.featureText}>
                    <strong>Instant Rewards</strong>
                    <span>Get Rewards Fast</span>
                  </div>
                </div>

                <div className={styles.featurePill}>
                  <div className={styles.featureIconWrap}>
                    <Gift size={16} className={styles.goldIcon} />
                  </div>
                  <div className={styles.featureText}>
                    <strong>Exclusive VELoops</strong>
                    <span>Special for You</span>
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
                    if (onOpenParticipation) onOpenParticipation('gw-apple-studio');
                  }}
                >
                  <span>Enter Giveaway</span>
                  <ArrowRight size={18} className={styles.btnArrow} />
                </motion.button>

                <button className={styles.quickCodeBtn} onClick={handleOpenCodeModal}>
                  Have a Promo Code? Redeem Here
                </button>
              </div>
            </div>

            {/* Right Ticket Illustration Area */}
            <div className={styles.rightVisual}>
              <motion.div
                className={styles.ticketHolder}
                animate={{ y: [0, -6, 0], rotateZ: [0, 2, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              >
                {/* SVG Golden Cutout VIP Ticket */}
                <svg viewBox="0 0 180 120" className={styles.ticketSvg}>
                  <defs>
                    <linearGradient id="goldTicketGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#ffd700" />
                      <stop offset="50%" stopColor="#f59e0b" />
                      <stop offset="100%" stopColor="#b45309" />
                    </linearGradient>
                    <linearGradient id="darkTicketGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#1f1435" />
                      <stop offset="100%" stopColor="#0f071d" />
                    </linearGradient>
                  </defs>

                  {/* Golden Ticket Body */}
                  <rect x="10" y="10" width="160" height="95" rx="8" fill="url(#goldTicketGrad)" filter="drop-shadow(0 10px 18px rgba(0,0,0,0.6))" />
                  
                  {/* Perforated Inner Ticket */}
                  <rect x="16" y="16" width="148" height="83" rx="6" fill="url(#darkTicketGrad)" />

                  {/* Ticket Notch Cutouts */}
                  <circle cx="10" cy="57" r="8" fill="#0e0720" />
                  <circle cx="170" cy="57" r="8" fill="#0e0720" />

                  {/* Golden Star & Giveaway Text */}
                  <circle cx="132" cy="57" r="18" fill="url(#goldTicketGrad)" />
                  <path d="M132,46 L135,53 L142,54 L137,59 L138,66 L132,62 L126,66 L127,59 L122,54 L129,53 Z" fill="#1f1435" />

                  <text x="35" y="44" fill="#fbbf24" fontSize="8" letterSpacing="2">★★★</text>
                  <text x="35" y="62" fill="#ffd700" fontSize="11" fontWeight="900" fontFamily="sans-serif" letterSpacing="1">GIVEAWAY</text>
                  <text x="35" y="76" fill="#9ca3af" fontSize="7" fontFamily="monospace">#VEL-VIP-2026</text>
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
                  <Gift size={20} className={styles.goldIcon} />
                  <h3>Redeem Giveaway Code</h3>
                </div>
                <button className={styles.modalCloseBtn} onClick={() => setIsCodeModalOpen(false)}>
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleRedeem} className={styles.modalBody}>
                <p className={styles.modalDesc}>
                  Enter an official VELoop promo or creator partner code to unlock instant bonus tickets and reward coins.
                </p>

                <div className={styles.inputGroup}>
                  <label>Enter Secret Code</label>
                  <input
                    type="text"
                    placeholder="e.g. VELOOP2026 or VIPREWARD"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className={styles.codeInput}
                    autoFocus
                  />
                </div>

                {codeSuccess && (
                  <div className={styles.successBox}>
                    <CheckCircle2 size={16} />
                    <span>{codeSuccess}</span>
                  </div>
                )}

                {codeError && (
                  <div className={styles.errorBox}>
                    <span>{codeError}</span>
                  </div>
                )}

                <div className={styles.codePillsQuick}>
                  <span>Try Codes:</span>
                  <button type="button" onClick={() => setCode('VELOOP2026')}>VELOOP2026</button>
                  <button type="button" onClick={() => setCode('VIPREWARD')}>VIPREWARD</button>
                  <button type="button" onClick={() => setCode('LUCKY100')}>LUCKY100</button>
                </div>

                <div className={styles.modalActions}>
                  <button type="button" className="btn-outline-custom" onClick={() => setIsCodeModalOpen(false)}>
                    Close
                  </button>
                  <button type="submit" className="btn-primary-glow">
                    Redeem Code →
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
