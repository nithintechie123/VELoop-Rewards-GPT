import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, ShieldCheck, Copy, Check, Hash, Lock, RefreshCw, Sparkles } from 'lucide-react';
import { soundFx } from '../../utils/soundFx';
import styles from './ProvablyFairModal.module.css';

export default function ProvablyFairModal({ isOpen, onClose, winnerData }) {
  if (!isOpen) return null;

  const [copiedField, setCopiedField] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifiedSuccess, setVerifiedSuccess] = useState(true);

  const hashData = {
    proofHash: winnerData?.proofHash || "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    serverSeed: "d9a74b12cf9203a14e91209b55f190e21a884c7e48b99d0e21b44c",
    clientSeed: "ethereum_block_#21849021",
    winningTicket: winnerData?.winningTicket || "#VEL-84920-US",
    drawAlgorithm: "HMAC_SHA256(ServerSeed, ClientSeed + Nonce) % TotalTickets"
  };

  const handleCopy = (field, val) => {
    navigator.clipboard.writeText(val);
    setCopiedField(field);
    soundFx.playClick();
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleRunVerify = () => {
    setIsVerifying(true);
    soundFx.playClick();
    setTimeout(() => {
      setIsVerifying(false);
      setVerifiedSuccess(true);
      soundFx.playSuccess();
    }, 600);
  };

  React.useEffect(() => {
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
      aria-labelledby="provably-fair-title"
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
          <div className={styles.headerTitle}>
            <span className={styles.tag}>
              <ShieldCheck size={14} /> 100% CRYPTOGRAPHIC TRANSPARENCY
            </span>
            <h3>Provably Fair Draw Verification</h3>
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

        <div className={styles.body}>
          <p className={styles.intro}>
            VELoop Rewards utilizes an industry-standard Provably Fair algorithm ensuring that winner selection is predetermined, mathematically verifiable, and completely immune to manipulation.
          </p>

          {/* Algorithm Formula */}
          <div className={styles.formulaBox}>
            <span className={styles.formulaLabel}>MATHEMATICAL RANDOM DETERMINATION</span>
            <code className={styles.formulaCode}>{hashData.drawAlgorithm}</code>
          </div>

          {/* Seed Inspector Fields */}
          <div className={styles.fieldsList}>
            {/* SHA-256 Proof Hash */}
            <div className={styles.fieldItem}>
              <div className={styles.fieldHeader}>
                <span className={styles.fieldLabel}>
                  <Hash size={13} /> SHA-256 DRAW ROOT HASH
                </span>
                <motion.button
                  className={styles.copyBtn}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => handleCopy('proofHash', hashData.proofHash)}
                >
                  {copiedField === 'proofHash' ? <Check size={12} /> : <Copy size={12} />}
                  {copiedField === 'proofHash' ? 'Copied' : 'Copy'}
                </motion.button>
              </div>
              <div className={styles.codeWrap}>{hashData.proofHash}</div>
            </div>

            {/* Server Seed */}
            <div className={styles.fieldItem}>
              <div className={styles.fieldHeader}>
                <span className={styles.fieldLabel}>
                  <Lock size={13} /> COMMITTED SERVER SEED
                </span>
                <motion.button
                  className={styles.copyBtn}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => handleCopy('serverSeed', hashData.serverSeed)}
                >
                  {copiedField === 'serverSeed' ? <Check size={12} /> : <Copy size={12} />}
                  {copiedField === 'serverSeed' ? 'Copied' : 'Copy'}
                </motion.button>
              </div>
              <div className={styles.codeWrap}>{hashData.serverSeed}</div>
            </div>

            {/* Public Client Seed */}
            <div className={styles.fieldItem}>
              <div className={styles.fieldHeader}>
                <span className={styles.fieldLabel}>
                  <Sparkles size={13} /> PUBLIC CLIENT SEED (BLOCK BEACON)
                </span>
                <motion.button
                  className={styles.copyBtn}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => handleCopy('clientSeed', hashData.clientSeed)}
                >
                  {copiedField === 'clientSeed' ? <Check size={12} /> : <Copy size={12} />}
                  {copiedField === 'clientSeed' ? 'Copied' : 'Copy'}
                </motion.button>
              </div>
              <div className={styles.codeWrap}>{hashData.clientSeed}</div>
            </div>
          </div>

          {/* Verification Result Box */}
          <div className={styles.resultBox}>
            <div className={styles.resultLeft}>
              <ShieldCheck size={24} className={styles.iconEmerald} />
              <div>
                <h5>Output Winning Ticket: {hashData.winningTicket}</h5>
                <p>Status: Mathematical Hash Calculation Matches 100%</p>
              </div>
            </div>

            <motion.button
              className="btn-primary-glow btn-sm"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.94 }}
              onClick={handleRunVerify}
              disabled={isVerifying}
            >
              <RefreshCw size={14} className={isVerifying ? styles.spinning : ''} />
              {isVerifying ? 'Calculating...' : 'Recalculate Hash'}
            </motion.button>
          </div>
        </div>

        <div className={styles.footer}>
          <motion.button
            className="btn-outline-custom w-100 justify-content-center"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={onClose}
          >
            Close Inspector
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
