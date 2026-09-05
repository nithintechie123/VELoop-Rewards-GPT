import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PackageCheck, Trophy, Calendar, Sparkles, LayoutGrid, List, ShieldCheck } from 'lucide-react';
import EmptyState from '../EmptyState/EmptyState';
import styles from './PreviousWinnerCard.module.css';

export default function PreviousWinnerCard({ archiveWinners = [] }) {
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'table'

  return (
    <div className={styles.winnerListWrapper}>
      {/* Header & View Mode Switcher */}
      <div className={styles.topBar}>
        <div className={styles.listHeadingRow}>
          <div className={styles.trophyCircle}>
            <Trophy size={18} className={styles.trophyGold} />
          </div>
          <div>
            <h3 className={styles.listMainTitle}>🏆 Official Winner Register</h3>
            <span className={styles.listSubText}>Verified blockchain & courier fulfilled recipients</span>
          </div>
        </div>

        <div className={styles.viewToggleGroup}>
          <button
            className={`${styles.toggleBtn} ${viewMode === 'cards' ? styles.toggleActive : ''}`}
            onClick={() => setViewMode('cards')}
            title="Card Grid View"
            aria-label="Card Grid View"
          >
            <LayoutGrid size={15} />
            <span>Cards</span>
          </button>
          <button
            className={`${styles.toggleBtn} ${viewMode === 'table' ? styles.toggleActive : ''}`}
            onClick={() => setViewMode('table')}
            title="Data Table View"
            aria-label="Data Table View"
          >
            <List size={15} />
            <span>Table</span>
          </button>
        </div>
      </div>

      {/* Cards View (Requirement 60 Winner List Structure) */}
      {viewMode === 'cards' ? (
        <div className={styles.cardsGrid}>
          {archiveWinners.map((item, idx) => (
            <motion.div
              key={item.id || idx}
              className={styles.winnerItemCard}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05, duration: 0.3 }}
              whileHover={{ y: -4, scale: 1.01 }}
            >
              <div className={styles.cardHeader}>
                <div className={styles.userBadgeWrap}>
                  <span className={styles.userAvatarCircle}>
                    {item.user.slice(0, 2)}
                  </span>
                  <div>
                    <span className={styles.userLabel}>WINNER</span>
                    <h4 className={styles.maskedUserName}>{item.user}</h4>
                  </div>
                </div>

                <span className={styles.statusPillBadge}>
                  <PackageCheck size={12} /> {item.status.includes('Digital') ? 'Digital Sent' : 'Delivered'}
                </span>
              </div>

              <div className={styles.prizeDetailsBlock}>
                <span className={styles.prizeMiniTag}>
                  <Sparkles size={11} /> {item.category || 'Lifestyle Reward'}
                </span>
                <h4 className={styles.cardPrizeName}>{item.prize}</h4>
                <div className={styles.valCampaignRow}>
                  <span className={styles.cardPrizeVal}>{item.val}</span>
                  <span className={styles.cardCampaignName}>• {item.giveawayName}</span>
                </div>
              </div>

              <div className={styles.cardFooter}>
                <div className={styles.dateMeta}>
                  <Calendar size={13} className={styles.calendarIcon} />
                  <span>{item.date}</span>
                </div>
                <div className={styles.ticketMeta}>
                  <ShieldCheck size={13} className={styles.shieldIcon} />
                  <span><code>{item.ticket || '#VEL-SHA256'}</code></span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        /* Table View */
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>User / Masked ID</th>
                <th>Prize Won</th>
                <th>Giveaway Campaign</th>
                <th>Prize Category</th>
                <th>Draw Date</th>
                <th>Retail Value</th>
                <th>Winner Status</th>
              </tr>
            </thead>
            <tbody>
              {archiveWinners.map((item, idx) => (
                <tr key={idx}>
                  <td>
                    <div className={styles.userCell}>
                      <div className={styles.avatarMini}>
                        <PackageCheck size={13} />
                      </div>
                      <span className={styles.maskedUser}>{item.user}</span>
                    </div>
                  </td>
                  <td className={styles.prizeCell}>
                    <strong>{item.prize}</strong>
                  </td>
                  <td className={styles.giveawayCell}>
                    <span className={styles.giveawayTitle}>{item.giveawayName || 'Previous Giveaway'}</span>
                  </td>
                  <td>
                    <span className={styles.categoryPill}>{item.category || 'Lifestyle Rewards'}</span>
                  </td>
                  <td className={styles.dateCell}>{item.date}</td>
                  <td className={styles.valCell}>{item.val}</td>
                  <td>
                    <span
                      className={`${styles.statusBadge} ${
                        item.status.includes('Digital') ? styles.statusDigital : styles.statusDelivered
                      }`}
                    >
                      <PackageCheck size={12} /> {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {archiveWinners.length === 0 && (
        <EmptyState
          type="no_previous_winners"
          onAction={() => {
            const el = document.getElementById('active-giveaways') || document.querySelector('#featured-giveaways');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        />
      )}
    </div>
  );
}
