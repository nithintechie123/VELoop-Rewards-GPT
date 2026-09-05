import React, { useState, useEffect } from 'react';
import { Gift, Users, Trophy, Clock, Sparkles } from 'lucide-react';
import styles from './GiveawayStats.module.css';

/**
 * Requirement 53: Realistic Dummy / Development Data
 * - Total Giveaways: 24
 * - Participants: 8,500+
 * - Prizes Won: 1,200+
 * - Clear development simulation framing
 */

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
      label: 'Total Giveaways',
      val: '24',
      unit: 'Pools Hosted',
      color: 'purple',
      icon: <Gift size={20} />
    },
    {
      id: 'participants',
      label: 'Total Participants',
      val: '8,500+',
      unit: 'Active Members',
      color: 'blue',
      icon: <Users size={20} />
    },
    {
      id: 'prizes',
      label: 'Prizes Won',
      val: '1,200+',
      unit: 'Verified Rewards',
      color: 'green',
      icon: <Trophy size={20} />
    },
    {
      id: 'endsIn',
      label: 'Ends In',
      val: `${timeLeft.days}d : ${String(timeLeft.hours).padStart(2, '0')}h : ${String(timeLeft.minutes).padStart(2, '0')}m`,
      unit: 'Current Cycle',
      color: 'orange',
      icon: <Clock size={20} />
    }
  ];

  return (
    <section className={styles.statsSection} aria-label="Platform Statistics and Live Metrics">
      <div className="container-custom">
        <div className={styles.statsGrid}>
          {stats.map(item => (
            <div key={item.id} className={styles.statCard}>
              <div className={`${styles.iconWrapper} ${styles[`icon_${item.color}`]}`}>
                {item.icon}
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
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
