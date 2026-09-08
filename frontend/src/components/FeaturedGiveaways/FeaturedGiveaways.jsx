import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  SlidersHorizontal,
  Sparkles,
  Flame,
  Zap,
  Shield,
  Gift,
  ChevronLeft,
  ChevronRight,
  Trophy,
  Layers
} from 'lucide-react';
import PrizeCard from '../PrizeCard/PrizeCard';
import EmptyState from '../EmptyState/EmptyState';
import { soundFx } from '../../utils/soundFx';
import styles from './FeaturedGiveaways.module.css';

export default function FeaturedGiveaways({
  giveaways,
  userEntries = {},
  isLoggedIn = true,
  onEnterGiveaway,
  onViewDetails
}) {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);

  const scrollRef = useRef(null);

  const filterTabs = [
    { id: 'all', label: 'All Rewards', icon: <Gift size={14} /> },
    { id: 'Flagship Mobile', label: 'Flagship Mobile', icon: <Flame size={14} /> },
    { id: 'Luxury Lifestyle', label: 'Luxury Wearables', icon: <Shield size={14} /> },
    { id: 'Audio & Accessories', label: 'Audio & Studio', icon: <Zap size={14} /> },
    { id: 'Gift Cards & Cash', label: 'VIP Mystery Vault', icon: <Sparkles size={14} /> }
  ];

  // Filtering & Sorting
  let filtered = (giveaways || []).filter(item => {
    if (item.isHero) return false;

    if (selectedFilter !== 'all') {
      if (
        item.category !== selectedFilter &&
        item.status !== selectedFilter &&
        item.filterTag !== selectedFilter
      ) {
        return false;
      }
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(q))
      );
    }
    return true;
  });

  if (sortBy === 'value') {
    filtered.sort((a, b) => b.valueUSD - a.valueUSD);
  } else if (sortBy === 'ending') {
    filtered.sort((a, b) => new Date(a.endsAt || a.endAt) - new Date(b.endsAt || b.endAt));
  } else {
    filtered.sort((a, b) => (b.totalTicketsEntered || b.totalTickets || 0) - (a.totalTicketsEntered || a.totalTickets || 0));
  }

  // Update Scroll State
  const updateScrollState = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);

    const maxScroll = scrollWidth - clientWidth;
    if (maxScroll > 0) {
      setScrollProgress((scrollLeft / maxScroll) * 100);
    } else {
      setScrollProgress(0);
    }
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', updateScrollState, { passive: true });
      updateScrollState();
      window.addEventListener('resize', updateScrollState);
      return () => {
        el.removeEventListener('scroll', updateScrollState);
        window.removeEventListener('resize', updateScrollState);
      };
    }
  }, [updateScrollState, filtered.length]);

  const handleScroll = (direction) => {
    soundFx.playClick();
    if (!scrollRef.current) return;
    const { clientWidth } = scrollRef.current;
    const scrollAmount = direction === 'left' ? -clientWidth * 0.75 : clientWidth * 0.75;
    scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  return (
    <section className={styles.section} id="active-giveaways">
      <div className={styles.ambientGlowTop}></div>
      <div className={styles.ambientGlowBottom}></div>

      <div className="container-custom">
        {/* Section Header & Interactive Navigation Controls */}
        <div className={styles.sectionHeader}>
          <div className={styles.titleWrap}>
            <div className={styles.badgeRow}>
              <span className={styles.sectionTag}>
                <Sparkles size={14} className={styles.sparkleGold} /> OFFICIAL PRIZE VAULT
              </span>
              <span className={styles.verifiedTag}>
                <Trophy size={13} /> 100% Provably Fair SHA-256
              </span>
            </div>
            <h2 className={styles.sectionTitle}>
              Featured <span className={styles.titleGradient}>Giveaway Pools</span>
            </h2>
            <p className={styles.sectionSubtitle}>
              Explore certified flagship hardware, luxury wearables, and high-tier mystery drops. Join free daily or stake VEs.
            </p>
          </div>

          {/* Desktop/Tablet Horizontal Slider Navigation Controls */}
          <div className={styles.sliderNavControls}>
            <button
              className={`${styles.navArrowBtn} ${!canScrollLeft ? styles.navArrowDisabled : ''}`}
              onClick={() => handleScroll('left')}
              disabled={!canScrollLeft}
              aria-label="Scroll giveaways left"
              title="Previous giveaways"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              className={`${styles.navArrowBtn} ${!canScrollRight ? styles.navArrowDisabled : ''}`}
              onClick={() => handleScroll('right')}
              disabled={!canScrollRight}
              aria-label="Scroll giveaways right"
              title="Next giveaways"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Filter Toolbar & Search Bar */}
        <div className={styles.toolbar}>
          {/* Category Filter Pills */}
          <div className={styles.tabsList}>
            {filterTabs.map(tab => (
              <button
                key={tab.id}
                className={`${styles.tabBtn} ${selectedFilter === tab.id ? styles.tabActive : ''}`}
                onClick={() => {
                  soundFx.playClick();
                  setSelectedFilter(tab.id);
                  if (scrollRef.current) scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
                }}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Controls (Search & Sort) */}
          <div className={styles.controlsRow}>
            <div className={styles.searchWrap}>
              <Search size={15} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search prize, phone, watch..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
            </div>

            <div className={styles.sortWrap}>
              <SlidersHorizontal size={14} className={styles.sortIcon} />
              <select
                value={sortBy}
                onChange={(e) => {
                  soundFx.playClick();
                  setSortBy(e.target.value);
                }}
                className={styles.sortSelect}
              >
                <option value="popular">Most Popular</option>
                <option value="value">Highest Value</option>
                <option value="ending">Ending Soonest</option>
              </select>
            </div>
          </div>
        </div>

        {/* Mobile Swipe Guidance Banner */}
        <div className={styles.mobileSwipeIndicator}>
          <span>← Swipe horizontally to explore prize pools →</span>
        </div>

        {/* Horizontal Kinetic Scroll Carousel Track */}
        <div className={styles.carouselContainer}>
          <div
            className={styles.horizontalTrack}
            ref={scrollRef}
          >
            <AnimatePresence mode="popLayout">
              {filtered.map((gw, idx) => (
                <div key={gw.id || idx} className={styles.cardWrapper}>
                  <PrizeCard
                    giveaway={{ ...gw, isLoggedIn }}
                    userEntryCount={userEntries[gw.id]?.tickets || 0}
                    onEnter={onEnterGiveaway}
                    onViewDetails={onViewDetails}
                  />
                </div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Scroll Progress Bar & Item Count Footer */}
        {filtered.length > 0 && (
          <div className={styles.trackFooter}>
            <div className={styles.progressBarTrack}>
              <div
                className={styles.progressBarFill}
                style={{ width: `${Math.max(15, scrollProgress)}%` }}
              />
            </div>
            <span className={styles.trackCounter}>
              Showing <strong>{filtered.length}</strong> active verified draws
            </span>
          </div>
        )}

        {/* Empty State when no items match */}
        {filtered.length === 0 && (
          <EmptyState
            type="no_current_giveaway"
            title={giveaways?.length === 0 ? 'No Current Giveaways' : 'No Matching Prize Pools'}
            description={
              giveaways?.length === 0
                ? 'The next high-tier prize pools are currently being prepared.'
                : 'Try adjusting your search keyword or switching to "All Rewards".'
            }
            actionText={giveaways?.length === 0 ? 'Notify Me When Available 🔔' : 'Reset Filters'}
            onAction={() => {
              setSelectedFilter('all');
              setSearchQuery('');
            }}
          />
        )}
      </div>
    </section>
  );
}
