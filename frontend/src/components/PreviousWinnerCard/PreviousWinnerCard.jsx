import React from 'react';
import { PackageCheck } from 'lucide-react';
import styles from './PreviousWinnerCard.module.css';

export default function PreviousWinnerCard({ archiveWinners = [] }) {
  return (
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

      {archiveWinners.length === 0 && (
        <div className={styles.emptyWrap}>
          <p>No historical records match your search query.</p>
        </div>
      )}
    </div>
  );
}
