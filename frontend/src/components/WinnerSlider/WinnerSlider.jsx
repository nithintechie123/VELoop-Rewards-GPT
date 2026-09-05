import React from 'react';
import { Trophy, Sparkles } from 'lucide-react';
import styles from './WinnerSlider.module.css';

export default function WinnerSlider() {
  const winnerAnnouncements = [
    { text: 'User VE****72 won an iPhone 15 Pro', time: '2m ago', emoji: '🎉' },
    { text: 'User VE****49 won an Apple Watch', time: '5m ago', emoji: '🎉' },
    { text: 'User VE****15 won AirPods Pro', time: '11m ago', emoji: '🎉' },
    { text: 'User VE****88 won an Amazon Gift Card', time: '18m ago', emoji: '🎉' },
    { text: 'User VE****91 claimed Apple Studio Bundle', time: '26m ago', emoji: '🏆' },
    { text: 'User VE****63 won ₹25,000 Electronics Voucher', time: '35m ago', emoji: '🎉' }
  ];

  return (
    <div
      className={styles.tickerBar}
      role="region"
      aria-label="Live Winner Announcements"
      tabIndex="0"
    >
      <div className={styles.badgeWrap}>
        <span className={styles.liveBadge}>
          <span className={styles.pulseDot}></span>
          <Sparkles size={12} className={styles.sparkleIcon} />
          <span className={styles.badgeLabel}>WINNER ALERTS</span>
        </span>
      </div>

      <div className={styles.marqueeContainer}>
        <div className={styles.track}>
          {[...winnerAnnouncements, ...winnerAnnouncements].map((item, idx) => (
            <div key={idx} className={styles.item}>
              <span className={styles.partyEmoji} aria-hidden="true">{item.emoji}</span>
              <span className={styles.messageText}>{item.text}</span>
              <span className={styles.timeTag}>• {item.time}</span>
              <span className={styles.itemDivider} aria-hidden="true">/</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
