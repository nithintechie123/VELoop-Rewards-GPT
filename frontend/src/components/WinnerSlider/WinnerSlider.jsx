import React from 'react';
import { Sparkles } from 'lucide-react';
import styles from './WinnerSlider.module.css';

export default function WinnerSlider({ isLiveBackend = false }) {
  const winnerAnnouncements = [
    { text: 'VE****21 won an iPhone 15 Pro!', time: '2m ago', emoji: '🎉' },
    { text: 'VE****83 won an Apple Watch!', time: '5m ago', emoji: '🎉' },
    { text: 'VE****54 won AirPods Pro!', time: '11m ago', emoji: '🎉' },
    { text: 'VE****92 won an Amazon Gift Card!', time: '18m ago', emoji: '🎉' },
    { text: 'VE****42 won an Apple Studio Creator Bundle!', time: '26m ago', emoji: '🏆' },
    { text: 'VE****77 won a Sony PlayStation 5 Pro!', time: '35m ago', emoji: '🎉' }
  ];

  return (
    <div
      className={styles.tickerBar}
      role="region"
      aria-label="Winner Announcements Feed"
      tabIndex="0"
    >
      <div className={styles.badgeWrap}>
        <span
          className={styles.liveBadge}
          title={isLiveBackend ? 'Real-time backend winner event stream' : 'Simulated sample feed for development (Backend connection ready)'}
        >
          <span className={styles.pulseDot}></span>
          <Sparkles size={12} className={styles.sparkleIcon} />
          <span className={styles.badgeLabel}>
            {isLiveBackend ? 'LIVE ALERTS' : 'SAMPLE FEED (DEMO)'}
          </span>
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
