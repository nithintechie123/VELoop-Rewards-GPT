import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, Sparkles, Flame, Zap, Shield, Gift } from 'lucide-react';
import PrizeCard from '../PrizeCard/PrizeCard';
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

  const filterTabs = [
    { id: 'all', label: 'All Giveaways', icon: <Gift size={14} /> },
    { id: 'active', label: '● Live Active', icon: <Flame size={14} /> },
    { id: 'ended', label: '🏆 Concluded / Ended', icon: <Sparkles size={14} /> },
    { id: 'upcoming', label: '⏳ Upcoming Starts In', icon: <Zap size={14} /> },
    { id: 'high-value', label: 'High Value (₹1L+)', icon: <Shield size={14} /> }
  ];

  // Filtering & Sorting
  let filtered = giveaways.filter(item => {
    // Exclude hero if it's already shown in hero banner
    if (item.isHero) return false;

    if (selectedFilter === 'high-value') {
      if (item.valueUSD < 100000) return false;
    } else if (selectedFilter !== 'all' && item.status !== selectedFilter && item.filterTag !== selectedFilter) {
      return false;
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
    filtered.sort((a, b) => new Date(a.endsAt) - new Date(b.endsAt));
  } else {
    filtered.sort((a, b) => b.totalTicketsEntered - a.totalTicketsEntered);
  }

  return (
    <section className={styles.section} id="active-giveaways">
      <div className="container-custom">
        {/* Section Header */}
        <div className={styles.sectionHeader}>
          <div className={styles.titleWrap}>
            <span className={styles.sectionTag}>
              <Sparkles size={14} /> ACTIVE PRIZE VAULT
            </span>
            <h2 className={styles.sectionTitle}>Featured Live Giveaways</h2>
            <p className={styles.sectionSubtitle}>
              100% free participation tier available for every draw. Verified by cryptographic hash.
            </p>
          </div>
        </div>

        {/* Filter & Search Toolbar */}
        <div className={styles.toolbar}>
          {/* Tabs */}
          <div className={styles.tabsList}>
            {filterTabs.map(tab => (
              <button
                key={tab.id}
                className={`${styles.tabBtn} ${selectedFilter === tab.id ? styles.tabActive : ''}`}
                onClick={() => setSelectedFilter(tab.id)}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Controls (Search & Sort) */}
          <div className={styles.controlsRow}>
            {/* Search */}
            <div className={styles.searchWrap}>
              <Search size={15} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search prizes or tech..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
            </div>

            {/* Sort Selector */}
            <div className={styles.sortWrap}>
              <SlidersHorizontal size={14} className={styles.sortIcon} />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={styles.sortSelect}
              >
                <option value="popular">Most Popular</option>
                <option value="value">Highest Value</option>
                <option value="ending">Ending Soonest</option>
              </select>
            </div>
          </div>
        </div>

        {/* Mobile Swipe Carousel Hint */}
        <div className={styles.swipeHint}>
          <Sparkles size={12} />
          <span>← Swipe prizes horizontally →</span>
        </div>

        {/* Giveaways Grid / Mobile Snap Carousel */}
        <div className={styles.grid}>
          <AnimatePresence>
            {filtered.map(gw => (
              <PrizeCard
                key={gw.id}
                giveaway={{ ...gw, isLoggedIn }}
                userEntryCount={userEntries[gw.id]?.tickets || 0}
                onEnter={onEnterGiveaway}
                onViewDetails={onViewDetails}
              />
            ))}
          </AnimatePresence>
        </div>

        {filtered.length === 0 && (
          <div className={styles.emptyState}>
            <Gift size={40} className={styles.emptyIcon} />
            <h4>No Giveaways Match Your Filter</h4>
            <p>Try clearing your search term or switching to "All Giveaways".</p>
            <button className="btn-outline-custom" onClick={() => { setSelectedFilter('all'); setSearchQuery(''); }}>
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
