import React from 'react';
import { UserCheck, Target, Ticket, Trophy, BookOpen, Rocket, ArrowDown } from 'lucide-react';
import { soundFx } from '../../utils/soundFx';
import styles from './HowToParticipate.module.css';

export default function HowToParticipate({ onOpenRules }) {
  const steps = [
    {
      code: '01',
      title: 'Sign Up / Login',
      desc: 'Create your VELoop account or sign in to activate your daily free entry tier.',
      color: 'purple',
      icon: <UserCheck size={15} />
    },
    {
      code: '02',
      title: 'Complete Tasks',
      desc: 'Engage in daily login streaks, community channels, and partner activities.',
      color: 'blue',
      icon: <Target size={15} />
    },
    {
      code: '03',
      title: 'Earn Entries',
      desc: 'Collect guaranteed serialized tickets (#VEL-XXXXX-IN) & coin booster packs.',
      color: 'green',
      icon: <Ticket size={15} />
    },
    {
      code: '04',
      title: 'Win Rewards',
      desc: 'Winners are selected randomly through transparent, unalterable SHA-256 draws.',
      color: 'orange',
      icon: <Trophy size={15} />
    }
  ];

  return (
    <div className={styles.containerCard} id="how-it-works">
      <div className={styles.cardHeader}>
        <div className={styles.titleRow}>
          <Rocket size={20} className={styles.rocketIcon} />
          <h3 className={styles.cardTitle}>How to Participate?</h3>
        </div>
        <p className={styles.cardSubtitle}>Follow these simple steps to join and win.</p>
      </div>

      <div className={styles.timeline}>
        {steps.map((step, idx) => (
          <div key={idx} className={styles.timelineItem}>
            {/* Left Connected Circle Node */}
            <div className={styles.nodeColumn}>
              <div className={`${styles.circleNode} ${styles[`node_${step.color}`]}`}>
                {step.icon}
              </div>
              {idx < steps.length - 1 && (
                <div className={styles.connectorWrap}>
                  <div className={styles.connectingLine} />
                  <ArrowDown size={11} className={styles.arrowDownIcon} />
                </div>
              )}
            </div>

            {/* Right Text Info */}
            <div className={styles.stepContent}>
              <div className={styles.stepHeaderRow}>
                <span className={`${styles.stepCodeBadge} ${styles[`code_${step.color}`]}`}>{step.code}</span>
                <h4 className={styles.stepHeading}>{step.title}</h4>
              </div>
              <p className={styles.stepText}>{step.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Rules Link */}
      <div className={styles.cardFooter}>
        <button
          className={styles.rulesBtn}
          onClick={() => {
            soundFx.playClick();
            if (onOpenRules) onOpenRules();
          }}
        >
          <BookOpen size={16} />
          <span>View Rules & Guidelines →</span>
        </button>
      </div>
    </div>
  );
}
