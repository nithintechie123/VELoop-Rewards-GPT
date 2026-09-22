import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Gift, Users, Trophy, Clock, Sparkles, Activity, ShieldCheck } from 'lucide-react';
import styles from './GiveawayStats.module.css';

export default function GiveawayStats() {
  const [timeLeft, setTimeLeft] = useState({ days: 12, hours: 8, minutes: 45, seconds: 18 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const stats = [
    {
      id: 'giveaways',
      label: 'TOTAL PRIZE VAULTS',
      val: '24',
      unit: 'Active & Verified',
      color: 'purple',
      icon: <Gift size={22} />
    },
    {
      id: 'participants',
      label: 'ACTIVE MEMBERS',
      val: '8,500+',
      unit: 'Participating Today',
      color: 'blue',
      icon: <Users size={22} />
    },
    {
      id: 'prizes',
      label: 'VERIFIED REWARDS WON',
      val: '1,200+',
      unit: '100% Fulfilled',
      color: 'green',
      icon: <Trophy size={22} />
    },
    {
      id: 'endsIn',
      label: 'NEXT DRAWING IN',
      val: `${timeLeft.days}d ${String(timeLeft.hours).padStart(2, '0')}h ${String(timeLeft.minutes).padStart(2, '0')}m`,
      unit: 'Countdown Live',
      color: 'orange',
      icon: <Clock size={22} />
    }
  ];

  return (
    <section className={styles.statsSection} aria-label="Platform Statistics and Live Metrics">
      <div className="container-custom">
        {/* Live Network Activity Bar */}
        <div className={styles.liveActivityRow}>
          <div className={styles.liveBadge}>
            <span className={styles.liveDot} />
            <Activity size={13} />
            <span>LIVE NETWORK METRICS</span>
          </div>
          <div className={styles.liveNoticeText}>
            <ShieldCheck size={14} className={styles.iconGreen} />
            <span>All draws cryptographically sealed with SHA-256 seed commitments.</span>
          </div>
        </div>

        <div className={styles.statsGrid}>
          {stats.map((item, idx) => (
            <motion.div
              key={item.id}
              className={`${styles.statCard} ${styles[`card_${item.color}`]}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.4 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              <div className={`${styles.iconWrapper} ${styles[`icon_${item.color}`]}`}>
                {item.icon}
                <div className={styles.iconGlow} />
              </div>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>{item.label}</span>
                <div className={styles.valRow}>
                  <h4 className={styles.statNumber}>{item.val}</h4>
                  <span className={`${styles.statUnit} ${styles[`unit_${item.color}`]}`}>
                    {item.unit}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
