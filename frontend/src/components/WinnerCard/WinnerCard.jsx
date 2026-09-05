import React from 'react';
import { Trophy, CheckCircle2, ShieldCheck, MapPin, Ticket } from 'lucide-react';
import styles from './WinnerCard.module.css';

export default function WinnerCard({ winner, onInspectProof }) {
  if (!winner) return null;

  return (
    <div className={styles.card}>
      {/* Verified Ribbon */}
      <div className={styles.ribbon}>
        <Trophy size={11} /> VERIFIED WINNER
      </div>

      {/* Profile Header */}
      <div className={styles.profileRow}>
        <div
          className={styles.avatarWrap}
          style={{ background: winner.avatarBg || '#10b981' }}
        >
          {winner.username ? winner.username.slice(0, 2) : 'VE'}
        </div>

        <div className={styles.userInfo}>
          <h4 className={styles.userName}>
            {winner.name} <CheckCircle2 size={15} className={styles.checkIcon} />
          </h4>
          <span className={styles.userHandle}>{winner.username}</span>
          <span className={styles.location}>
            <MapPin size={11} /> {winner.location}
          </span>
        </div>
      </div>

      {/* Prize Won Box */}
      <div className={styles.prizeBox}>
        <div className={styles.prizeMain}>
          <span className={styles.prizeLabel}>PRIZE CLAIMED</span>
          <h5 className={styles.prizeName}>{winner.prizeName}</h5>
        </div>
        <span className={styles.prizeVal}>{winner.prizeVal}</span>
      </div>

      {/* Quote / Testimonial */}
      {winner.quote && (
        <blockquote className={styles.quote}>
          "{winner.quote}"
        </blockquote>
      )}

      {/* Audit Meta & Verification Trigger */}
      <div className={styles.auditRow}>
        <div className={styles.ticketMeta}>
          <Ticket size={12} className={styles.ticketIcon} />
          <span className={styles.ticketNum}>{winner.winningTicket}</span>
        </div>

        <button
          className={styles.proofBtn}
          onClick={() => onInspectProof(winner)}
          title="Inspect SHA-256 cryptographic proof of draw"
        >
          <ShieldCheck size={13} /> Verify Proof
        </button>
      </div>
    </div>
  );
}
