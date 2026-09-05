import React from 'react';
import styles from './Skeletons.module.css';

/**
 * Requirement 65: Skeleton Loading States
 * - Hero Giveaway
 * - Prize cards
 * - Winners (Spotlight)
 * - Previous winners (Archive)
 * - Statistics
 * - Countdown
 */

export function SkeletonBox({ width, height, borderRadius, style = {}, className = '' }) {
  return (
    <div
      className={`${styles.skeleton} ${className}`}
      style={{
        width: width || '100%',
        height: height || '20px',
        borderRadius: borderRadius || 'var(--radius-sm)',
        ...style
      }}
    />
  );
}

// 1. Hero Giveaway & Countdown Skeleton
export function HeroSkeleton() {
  return (
    <section className={styles.heroSkeletonWrapper} aria-label="Loading giveaway details...">
      <div className="container-custom">
        <div className={styles.heroSkeletonCard}>
          <div className={styles.heroLeft}>
            <div className={styles.rowGap}>
              <SkeletonBox width="140px" height="26px" borderRadius="999px" />
              <SkeletonBox width="100px" height="26px" borderRadius="999px" />
            </div>

            <SkeletonBox width="85%" height="42px" style={{ marginTop: '0.75rem' }} />
            <SkeletonBox width="60%" height="28px" />
            <SkeletonBox width="95%" height="16px" style={{ marginTop: '0.5rem' }} />
            <SkeletonBox width="80%" height="16px" />

            {/* Countdown Skeleton */}
            <div className={styles.countdownSkeleton}>
              <div className={styles.countdownPills}>
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className={styles.countItem}>
                    <SkeletonBox width="65px" height="55px" borderRadius="var(--radius-md)" />
                    <SkeletonBox width="45px" height="12px" style={{ marginTop: '0.4rem' }} />
                  </div>
                ))}
              </div>
            </div>

            {/* CTA row */}
            <div className={styles.rowGap} style={{ marginTop: '1rem' }}>
              <SkeletonBox width="200px" height="48px" borderRadius="999px" />
              <SkeletonBox width="150px" height="48px" borderRadius="999px" />
            </div>
          </div>

          <div className={styles.heroRight}>
            <SkeletonBox width="100%" height="320px" borderRadius="var(--radius-lg)" />
          </div>
        </div>
      </div>
    </section>
  );
}

// 2. Prize Card Skeleton
export function PrizeCardSkeleton() {
  return (
    <div className={styles.prizeCardSkeleton}>
      <SkeletonBox width="100%" height="190px" borderRadius="var(--radius-md)" />
      <div className={styles.cardBody}>
        <div className={styles.rowBetween}>
          <SkeletonBox width="70px" height="20px" borderRadius="999px" />
          <SkeletonBox width="90px" height="20px" borderRadius="999px" />
        </div>
        <SkeletonBox width="85%" height="24px" style={{ marginTop: '0.5rem' }} />
        <SkeletonBox width="100%" height="14px" />
        <SkeletonBox width="70%" height="14px" />

        <div className={styles.rowBetween} style={{ marginTop: '0.75rem' }}>
          <SkeletonBox width="90px" height="35px" />
          <SkeletonBox width="90px" height="35px" />
        </div>

        <SkeletonBox width="100%" height="42px" borderRadius="999px" style={{ marginTop: '1rem' }} />
      </div>
    </div>
  );
}

// 3. Spotlight Winner Card Skeleton
export function WinnerCardSkeleton() {
  return (
    <div className={styles.winnerCardSkeleton}>
      <div className={styles.rowGap}>
        <SkeletonBox width="48px" height="48px" borderRadius="50%" />
        <div style={{ flex: 1 }}>
          <SkeletonBox width="60%" height="18px" />
          <SkeletonBox width="40%" height="12px" style={{ marginTop: '0.35rem' }} />
        </div>
      </div>
      <SkeletonBox width="100%" height="65px" borderRadius="var(--radius-md)" style={{ margin: '1rem 0' }} />
      <SkeletonBox width="90%" height="14px" />
      <SkeletonBox width="75%" height="14px" style={{ marginTop: '0.3rem' }} />
      <div className={styles.rowBetween} style={{ marginTop: '1rem' }}>
        <SkeletonBox width="110px" height="16px" />
        <SkeletonBox width="90px" height="28px" borderRadius="999px" />
      </div>
    </div>
  );
}

// 4. Previous Winner Card Skeleton
export function PreviousWinnerSkeleton() {
  return (
    <div className={styles.prevWinnerSkeleton}>
      <div className={styles.rowBetween}>
        <div className={styles.rowGap}>
          <SkeletonBox width="38px" height="38px" borderRadius="50%" />
          <div>
            <SkeletonBox width="50px" height="10px" />
            <SkeletonBox width="80px" height="16px" style={{ marginTop: '0.2rem' }} />
          </div>
        </div>
        <SkeletonBox width="80px" height="22px" borderRadius="999px" />
      </div>
      <SkeletonBox width="100%" height="55px" borderRadius="var(--radius-sm)" style={{ margin: '0.85rem 0' }} />
      <div className={styles.rowBetween}>
        <SkeletonBox width="90px" height="14px" />
        <SkeletonBox width="110px" height="14px" />
      </div>
    </div>
  );
}

// 5. Statistics Skeleton Strip
export function StatsSkeleton() {
  return (
    <section className={styles.statsSkeletonWrapper}>
      <div className="container-custom">
        <div className={styles.statsGrid}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className={styles.statBox}>
              <SkeletonBox width="44px" height="44px" borderRadius="var(--radius-md)" />
              <div style={{ flex: 1 }}>
                <SkeletonBox width="80px" height="12px" />
                <SkeletonBox width="110px" height="24px" style={{ marginTop: '0.35rem' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// 6. Countdown Timer Standalone Skeleton
export function CountdownSkeleton() {
  return (
    <div className={styles.countdownStandaloneSkeleton}>
      {[1, 2, 3, 4].map(i => (
        <div key={i} className={styles.countItem}>
          <SkeletonBox width="60px" height="50px" borderRadius="var(--radius-md)" />
          <SkeletonBox width="35px" height="10px" style={{ marginTop: '0.3rem' }} />
        </div>
      ))}
    </div>
  );
}
