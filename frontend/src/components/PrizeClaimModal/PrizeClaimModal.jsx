import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Gift,
  CheckCircle2,
  ShieldCheck,
  Download,
  Mail,
  Phone,
  Clock,
  MapPin,
  Send,
  Loader2,
  Award,
  Key,
  Gamepad2,
  Truck
} from 'lucide-react';
import { soundFx } from '../../utils/soundFx';
import { ConfettiManager } from '../../utils/confetti';
import {
  getPrizeTypeConfig,
  isPhysicalPrize,
  isGiftCardPrize,
  isDigitalPrize,
  PRIZE_TYPES
} from '../../utils/prizeTypeUtils';
import styles from './PrizeClaimModal.module.css';

/**
 * Prize Types Supported (Requirement 38, 69):
 * Centralized business logic via getPrizeTypeConfig
 */
export default function PrizeClaimModal({
  isOpen,
  onClose,
  defaultPrize = 'Apple Watch Series 9',
  prizeType = null, // 'PHYSICAL' | 'GIFT_CARD' | 'DIGITAL_KEY' | 'EXPERIENCE'
  giveawayName = 'Summer Rewards',
  defaultTicket = '#VEL-42190-IN',
  onSubmitClaim
}) {
  if (!isOpen) return null;

  // Retrieve unified structured config
  const prizeConfig = getPrizeTypeConfig(prizeType || defaultPrize);
  const normalizedType = prizeConfig.type;
  const isGiftCard = normalizedType === PRIZE_TYPES.GIFT_CARD;
  const isDigital = normalizedType === PRIZE_TYPES.DIGITAL_KEY || isDigitalPrize(prizeConfig);
  const isPhysical = normalizedType === PRIZE_TYPES.PHYSICAL;

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [fullName, setFullName] = useState('Alex Thorne');
  const [phoneNumber, setPhoneNumber] = useState('+91 98765 43210');
  const [address, setAddress] = useState('Flat 402, Lotus Residency, 12th Main Road, Indiranagar');
  const [city, setCity] = useState('Bengaluru');
  const [state, setState] = useState('Karnataka');
  const [pin, setPin] = useState('560038');
  const [digitalEmail, setDigitalEmail] = useState('alex.thorne@veloop-rewards.io');
  const [gamerTag, setGamerTag] = useState('AlexVeloop#9201');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedTracking, setGeneratedTracking] = useState('');

  const handleSubmitClaim = (e) => {
    if (e) e.preventDefault();
    soundFx.playClick();

    if (isGiftCard || isDigital) {
      if (!digitalEmail.trim() || !digitalEmail.includes('@')) {
        alert('Please enter a valid email address where you want to receive your prize');
        return;
      }
    } else {
      if (!fullName.trim()) {
        alert('Please enter your Full Name');
        return;
      }
      if (!phoneNumber.trim()) {
        alert('Please enter your Phone Number');
        return;
      }
      if (!address.trim()) {
        alert('Please enter your Address');
        return;
      }
      if (!city.trim() || !state.trim() || !pin.trim()) {
        alert('Please complete City, State, and PIN code');
        return;
      }
    }

    setIsSubmitting(true);
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const code = isGiftCard
      ? `AMZN-IN-${randomCode}-${Math.floor(100000 + Math.random() * 900000)}-GIFT`
      : isDigital
      ? `KEY-VEL-${randomCode}-${Math.floor(100000 + Math.random() * 900000)}-DIGITAL`
      : `FDX-VL-${randomCode}-${Math.floor(100000 + Math.random() * 900000)}`;

    setTimeout(() => {
      setGeneratedTracking(code);
      setIsSubmitting(false);
      setIsSubmitted(true);
      soundFx.playFanfare();
      ConfettiManager.burst(window.innerWidth / 2, window.innerHeight / 2, 120);

      if (onSubmitClaim) {
        onSubmitClaim({
          prize: defaultPrize,
          prizeType: normalizedType,
          tracking: code,
          fullName,
          phoneNumber,
          address,
          city,
          state,
          pin,
          digitalEmail,
          gamerTag
        });
      }
    }, 500);
  };

  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleDownloadReceipt = () => {
    soundFx.playClick();
    alert(`📄 Official Claim Certificate saved. Reference Code: ${generatedTracking}`);
  };

  return (
    <motion.div
      className={styles.overlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="prize-claim-modal-title"
    >
      <motion.div
        className={styles.modal}
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.giftIconCircle}>
              <Gift size={20} className={styles.iconGold} />
            </div>
            <div>
              <h3 className={styles.title} id="prize-claim-modal-title">
                {isGiftCard
                  ? '🎁 Claim Gift Card'
                  : isDigital
                  ? '⚡ Claim Digital Reward'
                  : '🎁 Claim Your Prize'}
              </h3>
              <p className={styles.headerSub}>
                {isGiftCard
                  ? 'Instant Amazon Digital Delivery'
                  : isDigital
                  ? 'Instant License Key & Subscription Activation'
                  : 'Official VELoop Rewards Fulfillment Portal'}
              </p>
            </div>
          </div>
          <motion.button
            className={styles.closeBtn}
            whileHover={{ rotate: 90, scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            aria-label="Close claim portal"
          >
            <X size={18} />
          </motion.button>
        </div>

        {/* Modal Body */}
        <div className={styles.body}>
          <AnimatePresence mode="wait">
            {!isSubmitted ? (
              <motion.form
                key="claim-form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleSubmitClaim}
                className={styles.formContainer}
              >
                {/* Prize Banner */}
                <div className={styles.wonBanner}>
                  <div className={styles.wonGlowBackground}></div>
                  <div className={styles.wonHeaderRow}>
                    <div className={styles.wonBadge}>
                      <Award size={14} className={styles.iconGold} />
                      <span>{normalizedType} REWARD WINNER</span>
                    </div>
                    <div className={styles.deadlineBadge}>
                      <Clock size={12} /> Claim within 7 days
                    </div>
                  </div>

                  <h2 className={styles.wonTitle}>
                    You won <span className={styles.prizeGradientText}>{defaultPrize}</span>
                  </h2>

                  <div className={styles.wonMetaRow}>
                    <span>Giveaway: <strong>{giveawayName}</strong></span>
                    <span className={styles.metaDivider}>•</span>
                    <span>Status: <strong className={styles.statusVerified}><CheckCircle2 size={13} /> Winner ✓</strong></span>
                    <span className={styles.metaDivider}>•</span>
                    <span>Ticket: <strong className={styles.ticketHighlight}>{defaultTicket}</strong></span>
                  </div>
                </div>

                {/* FORM 1: GIFT_CARD (Requirement 29, 31, 38) */}
                {isGiftCard && (
                  <div className={styles.fieldSection}>
                    <div className={styles.formGroup}>
                      <label htmlFor="claim-gift-email" className={styles.label}>
                        <Mail size={14} className={styles.fieldIcon} />
                        Email Address <span className={styles.requiredAsterisk}>*</span>
                      </label>
                      <input
                        id="claim-gift-email"
                        type="email"
                        value={digitalEmail}
                        onChange={(e) => setDigitalEmail(e.target.value)}
                        className={styles.input}
                        placeholder="Enter email where you want to receive your gift card"
                        required
                        autoFocus
                      />
                      <span className={styles.fieldHint}>
                        Enter email where you want to receive your gift card. No physical shipping address required.
                      </span>
                    </div>
                  </div>
                )}

                {/* FORM 2: DIGITAL (Requirement 38) */}
                {isDigital && (
                  <div className={styles.fieldSection}>
                    <div className={styles.formGroup}>
                      <label htmlFor="claim-digital-email" className={styles.label}>
                        <Mail size={14} className={styles.fieldIcon} />
                        Delivery Email Address <span className={styles.requiredAsterisk}>*</span>
                      </label>
                      <input
                        id="claim-digital-email"
                        type="email"
                        value={digitalEmail}
                        onChange={(e) => setDigitalEmail(e.target.value)}
                        className={styles.input}
                        placeholder="Enter email to receive license keys and activation credentials"
                        required
                        autoFocus
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="claim-gamertag" className={styles.label}>
                        <Gamepad2 size={14} className={styles.fieldIcon} />
                        Platform GamerTag / Account ID (Optional)
                      </label>
                      <input
                        id="claim-gamertag"
                        type="text"
                        value={gamerTag}
                        onChange={(e) => setGamerTag(e.target.value)}
                        className={styles.input}
                        placeholder="e.g. SteamID, Xbox Gamertag, or Discord Handle"
                      />
                      <span className={styles.fieldHint}>
                        Allows direct account linking or instant activation where supported.
                      </span>
                    </div>
                  </div>
                )}

                {/* FORM 3: PHYSICAL (Requirement 28, 30, 38) */}
                {isPhysical && (
                  <div className={styles.fieldSection}>
                    {/* Full Name */}
                    <div className={styles.formGroup}>
                      <label htmlFor="claim-fullname" className={styles.label}>
                        Full Name <span className={styles.requiredAsterisk}>*</span>
                      </label>
                      <input
                        id="claim-fullname"
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className={styles.input}
                        placeholder="e.g. Alex Thorne"
                        required
                      />
                    </div>

                    {/* Phone Number */}
                    <div className={styles.formGroup}>
                      <label htmlFor="claim-phone" className={styles.label}>
                        <Phone size={14} className={styles.fieldIcon} />
                        Phone Number <span className={styles.requiredAsterisk}>*</span>
                      </label>
                      <input
                        id="claim-phone"
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className={styles.input}
                        placeholder="e.g. +91 98765 43210"
                        required
                      />
                    </div>

                    {/* Address */}
                    <div className={styles.formGroup}>
                      <label htmlFor="claim-address" className={styles.label}>
                        <MapPin size={14} className={styles.fieldIcon} />
                        Address <span className={styles.requiredAsterisk}>*</span>
                      </label>
                      <input
                        id="claim-address"
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className={styles.input}
                        placeholder="e.g. Flat 402, Lotus Residency, 12th Main Road, Indiranagar"
                        required
                      />
                    </div>

                    {/* 3-Column Grid: City, State, PIN */}
                    <div className={styles.threeColRow}>
                      <div className={styles.formGroup}>
                        <label htmlFor="claim-city" className={styles.label}>
                          City <span className={styles.requiredAsterisk}>*</span>
                        </label>
                        <input
                          id="claim-city"
                          type="text"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className={styles.input}
                          placeholder="Bengaluru"
                          required
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label htmlFor="claim-state" className={styles.label}>
                          State <span className={styles.requiredAsterisk}>*</span>
                        </label>
                        <input
                          id="claim-state"
                          type="text"
                          value={state}
                          onChange={(e) => setState(e.target.value)}
                          className={styles.input}
                          placeholder="Karnataka"
                          required
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label htmlFor="claim-pin" className={styles.label}>
                          PIN <span className={styles.requiredAsterisk}>*</span>
                        </label>
                        <input
                          id="claim-pin"
                          type="text"
                          value={pin}
                          onChange={(e) => setPin(e.target.value)}
                          className={styles.input}
                          placeholder="560038"
                          maxLength={6}
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Fulfillment Trust Pill */}
                <div className={styles.trustPill}>
                  <ShieldCheck size={14} className={styles.iconEmerald} />
                  <span>
                    {isGiftCard
                      ? 'Instant Amazon India digital voucher dispatch with verified 100% balance.'
                      : isDigital
                      ? 'Cryptographically generated digital license key sent with instant activation guide.'
                      : 'Free insured express shipping via FedEx / Blue Dart with live tracking.'}
                  </span>
                </div>

                {/* Submit Claim Button */}
                <div className={styles.actionRow}>
                  <motion.button
                    type="submit"
                    className={`${styles.submitBtn} btn-primary-glow`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={18} className={styles.spinner} />
                        Processing Claim...
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        [ Submit Claim ]
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.form>
            ) : (
              /* Success Confirmation Panel */
              <motion.div
                key="claim-success"
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                className={styles.confirmationPanel}
              >
                <motion.div
                  className={styles.confettiIconWrap}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', damping: 15, delay: 0.1 }}
                >
                  <CheckCircle2 size={40} />
                </motion.div>

                <h3 className={styles.successTitle}>Claim Successfully Registered!</h3>
                <p className={styles.successSub}>
                  {isGiftCard
                    ? `Your digital voucher code for ${defaultPrize} has been dispatched.`
                    : isDigital
                    ? `Your digital license activation key for ${defaultPrize} is ready below.`
                    : `Your dispatch fulfillment order for ${defaultPrize} has been created.`}
                </p>

                <div className={styles.trackingCard}>
                  <span className={styles.trackLabel}>
                    {isGiftCard
                      ? 'DIGITAL GIFT CARD VOUCHER CODE'
                      : isDigital
                      ? 'DIGITAL LICENSE & ACTIVATION KEY'
                      : 'OFFICIAL CARRIER TRACKING NUMBER'}
                  </span>
                  <span className={styles.trackNum}>{generatedTracking}</span>
                  <span className={styles.trackCarrier}>
                    {isGiftCard
                      ? 'Instant Amazon Digital Redemption • 100% Face Value'
                      : isDigital
                      ? 'Digital Delivery • Instant Vault Activation Code'
                      : 'Courier: FedEx Priority Air • Insured Transit'}
                  </span>
                </div>

                <div className={styles.summaryBox}>
                  <div className={styles.summaryRow}>
                    <span>Prize:</span>
                    <strong className={styles.summaryHighlight}>{defaultPrize}</strong>
                  </div>
                  <div className={styles.summaryRow}>
                    <span>Prize Type:</span>
                    <strong>{normalizedType}</strong>
                  </div>
                  {isGiftCard || isDigital ? (
                    <div className={styles.summaryRow}>
                      <span>Recipient Email:</span>
                      <strong>{digitalEmail}</strong>
                    </div>
                  ) : (
                    <>
                      <div className={styles.summaryRow}>
                        <span>Recipient:</span>
                        <strong>{fullName} ({phoneNumber})</strong>
                      </div>
                      <div className={styles.summaryRow}>
                        <span>Delivery Address:</span>
                        <strong>{address}, {city}, {state} - {pin}</strong>
                      </div>
                    </>
                  )}
                  <div className={styles.summaryRow}>
                    <span>Winning Ticket:</span>
                    <strong className={styles.ticketText}>{defaultTicket}</strong>
                  </div>
                  <div className={styles.summaryRow}>
                    <span>Fulfillment Status:</span>
                    <strong className={styles.emeraldText}>
                      {isGiftCard || isDigital ? 'Dispatched Instantly' : 'In Transit (2–4 Business Days)'}
                    </strong>
                  </div>
                </div>

                <div className={styles.confirmActions}>
                  <motion.button
                    className="btn-primary-glow"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleDownloadReceipt}
                  >
                    <Download size={16} /> Download {isGiftCard || isDigital ? 'Digital Voucher Certificate' : 'Claim Certificate'}
                  </motion.button>
                  <motion.button
                    className="btn-outline-custom"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={onClose}
                  >
                    Done
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
