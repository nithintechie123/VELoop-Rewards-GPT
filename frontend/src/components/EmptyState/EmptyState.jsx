import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Gift, Ticket, ArrowRight } from 'lucide-react';
import styles from './EmptyState.module.css';

/**
 * Requirement 64: Empty States
 * - No Previous Winners: "Previous winners will appear here after a giveaway is completed."
 * - No Current Giveaway: "The next giveaway is being prepared."
 * - No Active Participation: "Join the giveaway to start earning entries."
 */

const PRESETS = {
  no_previous_winners: {
    icon: <Trophy size={38} className={styles.iconGold} />,
    title: 'No Previous Winners',
    description: 'Previous winners will appear here after a giveaway is completed.',
    actionText: 'View Current Giveaways →'
  },
  no_current_giveaway: {
    icon: <Gift size={38} className={styles.iconCyan} />,
    title: 'No Current Giveaway',
    description: 'The next giveaway is being prepared.',
    actionText: 'Notify Me When Available 🔔'
  },
  no_active_participation: {
    icon: <Ticket size={38} className={styles.iconEmerald} />,
    title: 'No Active Participation',
    description: 'Join the giveaway to start earning entries.',
    actionText: 'Enter Giveaway Free →'
  }
};

export default function EmptyState({
  type = 'no_previous_winners',
  title,
  description,
  icon,
  actionText,
  onAction,
  className = ''
}) {
  const preset = PRESETS[type] || PRESETS.no_previous_winners;

  const displayTitle = title || preset.title;
  const displayDescription = description || preset.description;
  const displayIcon = icon || preset.icon;
  const displayActionText = actionText || preset.actionText;

  return (
    <motion.div
      className={`${styles.emptyStateContainer} ${className}`}
      initial={{ opacity: 0, scale: 0.96, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      <div className={styles.glowRing}></div>
      <div className={styles.iconCircle}>
        {displayIcon}
      </div>

      <h3 className={styles.title}>{displayTitle}</h3>
      <p className={styles.description}>{displayDescription}</p>

      {onAction && (
        <motion.button
          className={`${styles.actionBtn} btn-primary-glow`}
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.96 }}
          onClick={onAction}
        >
          <span>{displayActionText}</span>
          <ArrowRight size={16} />
        </motion.button>
      )}
    </motion.div>
  );
}
