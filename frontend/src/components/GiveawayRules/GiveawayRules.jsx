import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Scale,
  UserCheck,
  CheckCircle2,
  Ticket,
  Cpu,
  Clock,
  Ban,
  AlertTriangle,
  Search,
  BookOpen,
  ChevronDown,
  Printer,
  ShieldAlert
} from 'lucide-react';
import styles from './GiveawayRules.module.css';

/**
 * Requirement 44: Giveaway Rules & Guidelines
 * Visually accessible rules covering:
 * - Eligibility
 * - Participation requirements
 * - Entry rules
 * - Winner selection
 * - Prize claim period
 * - Disqualification conditions
 * - Fraud/abuse policy
 */

const RULES_DATA = [
  {
    id: 'eligibility',
    title: '1. Eligibility & Age Restrictions',
    badge: 'MANDATORY',
    badgeType: 'blue',
    icon: <UserCheck size={18} className={styles.iconBlue} />,
    summary: 'Open to verified members aged 18+ worldwide where legally permitted.',
    details: [
      'Participants must be at least eighteen (18) years of age or the age of legal majority in their state, province, or territory of residence at the time of entry.',
      'Giveaways are open worldwide to legal residents where not prohibited or restricted by applicable sweepstakes or consumer protection laws.',
      'Employees, contractors, affiliates, and immediate family members of VELoop Rewards Inc. and partner co-sponsors are ineligible to claim grand prizes.'
    ]
  },
  {
    id: 'participation',
    title: '2. Participation Requirements',
    badge: 'PREREQUISITE',
    badgeType: 'cyan',
    icon: <CheckCircle2 size={18} className={styles.iconCyan} />,
    summary: 'Requires a valid verified VELoop account and confirmed contact credentials.',
    details: [
      'Each participant must maintain a single, authentic VELoop account verified via email and two-factor authentication (where required).',
      'Contact information provided during participation (name, email, and phone) must be accurate to ensure prize fulfillment notifications can be delivered.',
      'No account sharing or proxy registration is permitted.'
    ]
  },
  {
    id: 'entry-rules',
    title: '3. Entry Rules & No Purchase Necessary',
    badge: 'CORE POLICY',
    badgeType: 'gold',
    icon: <Ticket size={18} className={styles.iconGold} />,
    summary: '100% Free Daily Entry provided for every draw. No purchase required.',
    details: [
      'NO PURCHASE OR PAYMENT OF ANY KIND IS NECESSARY TO ENTER OR WIN. A purchase or coin top-up will not increase the odds of winning of any individual entry ticket.',
      'Every active member is entitled to one (1) free standard entry ticket per giveaway pool every 24-hour cycle.',
      'Bonus entries earned through loyalty quests or coin conversions represent individual entries with equal probability in the randomized selection pool.'
    ]
  },
  {
    id: 'winner-selection',
    title: '4. Winner Selection & Cryptographic Verification',
    badge: 'PROVABLY FAIR',
    badgeType: 'emerald',
    icon: <Cpu size={18} className={styles.iconEmerald} />,
    summary: 'Automated draw executed with unalterable HMAC SHA-256 cryptographic beacon.',
    details: [
      'Drawings occur automatically upon the conclusion of the giveaway countdown timer.',
      'Winners are picked via an open-source HMAC SHA-256 pseudo-random number generator combining a pre-committed Server Seed and public Client Seed block hash.',
      'All drawing seeds, winning ticket numbers, and hash calculations are publicly auditable via the in-app Provably Fair Verifier.'
    ]
  },
  {
    id: 'claim-period',
    title: '5. Prize Claim Period & Fulfillment',
    badge: '14-DAY WINDOW',
    badgeType: 'orange',
    icon: <Clock size={18} className={styles.iconOrange} />,
    summary: 'Winners must claim within 14 calendar days. Free insured global shipping.',
    details: [
      'Winners will be notified via their account dashboard banner and registered email within 1 hour of drawing completion.',
      'Physical Prizes: Winners must submit complete courier delivery details within fourteen (14) calendar days. VELoop covers 100% of air express shipping and transit insurance.',
      'Gift Cards & Digital Keys: Delivered electronically to the verified recipient email or platform handle within 24–48 hours of claim submission.',
      'Unclaimed prizes after 14 calendar days are automatically forfeited and recycled into the Community Reserve Giveaway Pool.'
    ]
  },
  {
    id: 'disqualification',
    title: '6. Disqualification Conditions',
    badge: 'ENFORCED',
    badgeType: 'red',
    icon: <Ban size={18} className={styles.iconRed} />,
    summary: 'Violations of terms, proxy submissions, or invalid identity void entries.',
    details: [
      'Submitting falsified identity documents or unauthorized third-party shipping addresses will void winning tickets immediately.',
      'Automated script execution, bot usage, macro manipulation, or headless browser entry attempts are strictly disqualified.',
      'Creation of disposable emails, burner accounts, or multiple identity farming leads to immediate pool removal.'
    ]
  },
  {
    id: 'fraud-policy',
    title: '7. Fraud, Abuse & Anti-Cheat Policy',
    badge: 'ZERO TOLERANCE',
    badgeType: 'purple',
    icon: <ShieldAlert size={18} className={styles.iconPurple} />,
    summary: 'Permanent account blacklist, token forfeiture, and legal reporting for malicious acts.',
    details: [
      'VELoop employs proprietary behavioral heuristics and IP cluster analysis to detect coordinated syndicate fraud.',
      'Any member attempting to exploit bugs, reverse-engineer RNG seeds, or manipulate the platform will face permanent account termination and forfeiture of all accumulated rewards.',
      'VELoop reserves the right to report malicious cyber activity to relevant law enforcement jurisdictions.'
    ]
  }
];

export default function GiveawayRules({ isOpen, onClose }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [expandedSection, setExpandedSection] = useState(null);

  if (!isOpen) return null;

  const filteredRules = RULES_DATA.filter(rule => {
    const matchesSearch =
      rule.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rule.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rule.details.some(d => d.toLowerCase().includes(searchQuery.toLowerCase()));

    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'eligibility' && rule.id === 'eligibility') return matchesSearch;
    if (activeTab === 'entry' && (rule.id === 'participation' || rule.id === 'entry-rules')) return matchesSearch;
    if (activeTab === 'selection' && (rule.id === 'winner-selection' || rule.id === 'claim-period')) return matchesSearch;
    if (activeTab === 'security' && (rule.id === 'disqualification' || rule.id === 'fraud-policy')) return matchesSearch;

    return matchesSearch;
  });

  const toggleSection = (id) => {
    setExpandedSection(prev => prev === id ? null : id);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <motion.div
      className={styles.overlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="rules-modal-title"
    >
      <motion.div
        className={styles.modal}
        initial={{ opacity: 0, scale: 0.94, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 24 }}
        transition={{ type: 'spring', damping: 28, stiffness: 380 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Header */}
        <div className={styles.header}>
          <div className={styles.headerTitleWrap}>
            <span className={styles.tag}>
              <Scale size={14} /> OFFICIAL POLICY DOCUMENT
            </span>
            <h3 id="rules-modal-title" className={styles.title}>
              Giveaway Rules & Guidelines
            </h3>
            <p className={styles.subtitle}>
              Clear, transparent, and fair standards governing all VELoop Rewards sweepstakes.
            </p>
          </div>

          <div className={styles.headerActions}>
            <button
              className={styles.actionBtn}
              onClick={handlePrint}
              title="Print Rules"
              aria-label="Print official rules"
            >
              <Printer size={16} />
            </button>
            <motion.button
              className={styles.closeBtn}
              whileHover={{ rotate: 90, scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={onClose}
              aria-label="Close rules modal"
            >
              <X size={18} />
            </motion.button>
          </div>
        </div>

        {/* Search & Category Filter Navigation */}
        <div className={styles.toolbar}>
          <div className={styles.searchWrap}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search rules (e.g. eligibility, claim, odds, fraud)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Filter rules and guidelines"
            />
            {searchQuery && (
              <button
                className={styles.clearSearchBtn}
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className={styles.pillTabs} role="tablist">
            <button
              className={`${styles.pillTab} ${activeTab === 'all' ? styles.activePill : ''}`}
              onClick={() => setActiveTab('all')}
            >
              All (7)
            </button>
            <button
              className={`${styles.pillTab} ${activeTab === 'eligibility' ? styles.activePill : ''}`}
              onClick={() => setActiveTab('eligibility')}
            >
              Eligibility
            </button>
            <button
              className={`${styles.pillTab} ${activeTab === 'entry' ? styles.activePill : ''}`}
              onClick={() => setActiveTab('entry')}
            >
              Entry & Participation
            </button>
            <button
              className={`${styles.pillTab} ${activeTab === 'selection' ? styles.activePill : ''}`}
              onClick={() => setActiveTab('selection')}
            >
              Selection & Claims
            </button>
            <button
              className={`${styles.pillTab} ${activeTab === 'security' ? styles.activePill : ''}`}
              onClick={() => setActiveTab('security')}
            >
              Anti-Fraud & Bans
            </button>
          </div>
        </div>

        {/* Scrollable Rules Body */}
        <div className={styles.body}>
          {filteredRules.length === 0 ? (
            <div className={styles.emptySearch}>
              <AlertTriangle size={32} className={styles.iconGold} />
              <p>No rules found matching &quot;{searchQuery}&quot;</p>
              <button
                className={styles.resetBtn}
                onClick={() => { setSearchQuery(''); setActiveTab('all'); }}
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className={styles.rulesList}>
              {filteredRules.map((rule) => {
                const isExpanded = expandedSection === rule.id;

                return (
                  <div
                    key={rule.id}
                    id={`rule-${rule.id}`}
                    className={`${styles.ruleCard} ${styles[`card_${rule.badgeType}`]}`}
                  >
                    <div
                      className={styles.cardHeader}
                      onClick={() => toggleSection(rule.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && toggleSection(rule.id)}
                      aria-expanded={isExpanded}
                    >
                      <div className={styles.cardTitleRow}>
                        <div className={`${styles.iconWrap} ${styles[`wrap_${rule.badgeType}`]}`}>
                          {rule.icon}
                        </div>
                        <div className={styles.titleContent}>
                          <div className={styles.titleBadgeRow}>
                            <h4 className={styles.ruleTitle}>{rule.title}</h4>
                            <span className={`${styles.badge} ${styles[`badge_${rule.badgeType}`]}`}>
                              {rule.badge}
                            </span>
                          </div>
                          <p className={styles.ruleSummary}>{rule.summary}</p>
                        </div>
                      </div>

                      <div className={styles.cardToggleBtn}>
                        <ChevronDown
                          size={18}
                          className={`${styles.chevron} ${isExpanded ? styles.chevronOpen : ''}`}
                        />
                      </div>
                    </div>

                    <AnimatePresence initial={false}>
                      {(isExpanded || searchQuery.length > 0) && (
                        <motion.div
                          className={styles.cardDetails}
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                        >
                          <ul className={styles.detailsList}>
                            {rule.details.map((detail, idx) => (
                              <li key={idx} className={styles.detailItem}>
                                <span className={styles.bulletDot}>•</span>
                                <span className={styles.detailText}>{detail}</span>
                              </li>
                            ))}
                          </ul>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          )}

          {/* Quick Compliance Summary Box */}
          <div className={styles.summaryBox}>
            <div className={styles.summaryBoxHeader}>
              <BookOpen size={16} className={styles.iconEmerald} />
              <span>Summary of Guaranteed Protections</span>
            </div>
            <div className={styles.summaryGrid}>
              <div className={styles.summaryItem}>
                <strong>No Purchase Necessary</strong>
                <p>Free entry ticket accessible every 24h per active pool.</p>
              </div>
              <div className={styles.summaryItem}>
                <strong>14-Day Claim Guarantee</strong>
                <p>Ample time for winners to submit verified delivery details.</p>
              </div>
              <div className={styles.summaryItem}>
                <strong>Zero Shipping Fees</strong>
                <p>All air express courier charges fully insured by VELoop.</p>
              </div>
              <div className={styles.summaryItem}>
                <strong>Cryptographic Audit</strong>
                <p>Provably fair SHA-256 draw verification available to all.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className={styles.footer}>
          <div className={styles.footerLegal}>
            <span>Version 2.4 (Updated 2026)</span>
            <span>•</span>
            <span>Governed by Fair Sweepstakes Standard</span>
          </div>
          <motion.button
            className="btn-primary-glow"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={onClose}
          >
            I Understand & Agree
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
