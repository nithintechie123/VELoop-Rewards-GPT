import React, { useState, useEffect } from 'react';
import { Clock, Trophy, Sparkles } from 'lucide-react';
import styles from './Countdown.module.css';

export default function Countdown({ targetDate, compact = false, onExpire, label = 'Ends In' }) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false
  });

  useEffect(() => {
    function calc() {
      const difference = new Date(targetDate).getTime() - Date.now();
      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
        if (onExpire) onExpire();
        return;
      }
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds, isExpired: false });
    }

    calc();
    const timer = setInterval(calc, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  if (timeLeft.isExpired) {
    return (
      <div className={styles.expiredBadge}>
        <span className={styles.pulseLive}></span>
        <Trophy size={14} />
        <span>Drawing Winner Live • Entries Closed</span>
      </div>
    );
  }

  if (compact) {
    return (
      <div className={styles.compactRow}>
        <Clock size={13} className={styles.clockIcon} />
        <span className={styles.compactText}>
          {timeLeft.days > 0 && `${timeLeft.days}d : `}
          {String(timeLeft.hours).padStart(2, '0')}h : {String(timeLeft.minutes).padStart(2, '0')}m : {String(timeLeft.seconds).padStart(2, '0')}s
        </span>
      </div>
    );
  }

  return (
    <div className={styles.timerWrap}>
      <div className={styles.timerHeader}>
        <Clock size={14} className={styles.clockIcon} />
        <span>{label.toUpperCase()}</span>
      </div>

      <div className={styles.boxGrid}>
        <div className={styles.box}>
          <span className={styles.num}>{String(timeLeft.days).padStart(2, '0')}</span>
          <span className={styles.unit}>DAYS</span>
        </div>
        <span className={styles.colon}>:</span>
        <div className={styles.box}>
          <span className={styles.num}>{String(timeLeft.hours).padStart(2, '0')}</span>
          <span className={styles.unit}>HOURS</span>
        </div>
        <span className={styles.colon}>:</span>
        <div className={styles.box}>
          <span className={styles.num}>{String(timeLeft.minutes).padStart(2, '0')}</span>
          <span className={styles.unit}>MINS</span>
        </div>
        <span className={styles.colon}>:</span>
        <div className={styles.box}>
          <span className={styles.num}>{String(timeLeft.seconds).padStart(2, '0')}</span>
          <span className={styles.unit}>SECS</span>
        </div>
      </div>
    </div>
  );
}
