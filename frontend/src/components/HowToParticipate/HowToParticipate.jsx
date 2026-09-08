import React from 'react';
import { motion } from 'framer-motion';
import { UserCheck, Target, Ticket, Trophy, BookOpen, Sparkles, ArrowRight } from 'lucide-react';
import { soundFx } from '../../utils/soundFx';
import styles from './HowToParticipate.module.css';

export default function HowToParticipate({ onOpenRules }) {
  const steps = [
    {
      code: '01',
      title: 'Sign Up / Login',
      desc: 'Create your VELoop account or sign in to activate your daily free entry tier.',
      color: 'purple',
      icon: <UserCheck size={18} />
    },
    {
      code: '02',
      title: 'Complete Tasks',
      desc: 'Engage in daily login streaks, community channels, and partner activities.',
      color: 'blue',
      icon: <Target size={18} />
    },
    {
      code: '03',
      title: 'Earn Entries',
      desc: 'Collect guaranteed serialized tickets (#VEL-XXXXX-IN) & coin booster packs.',
      color: 'green',
      icon: <Ticket size={18} />
    },
    {
      code: '04',
      title: 'Win Rewards',
      desc: 'Winners are selected randomly through transparent, unalterable SHA-256 draws.',
      color: 'orange',
      icon: <Trophy size={18} />
    }
  ];

  return (
    <section className={styles.section} id="how-it-works">
      <div className="container-custom">
        <div className={styles.header}>
          <div className={styles.tagWrap}>
            <span className={styles.sectionBadge}>
              <Sparkles size={13} className={styles.sparkleIcon} /> SIMPLE 4-STEP PROTOCOL
            </span>
          </div>
          <div className={styles.headerContent}>
            <div>
              <h2 className={styles.title}>
                How To <span className={styles.gradientText}>Participate & Win</span>
              </h2>
              <p className={styles.subtitle}>
                Participating in VELoop official giveaways is fast, 100% transparent, and provably fair.
              </p>
            </div>

            <button
              className={styles.rulesBtn}
              onClick={() => {
                soundFx.playClick();
                if (onOpenRules) onOpenRules();
              }}
              title="Read complete platform rules & odds specification"
            >
              <BookOpen size={16} />
              <span>Official Rules & Odds Specification</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>

        {/* 4-Step Process Grid */}
        <div className={styles.stepsGrid}>
          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              className={styles.stepCard}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <div className={styles.stepCardTop}>
                <div className={`${styles.circleNode} ${styles[`node_${step.color}`]}`}>
                  {step.icon}
                </div>
                <span className={`${styles.stepCodeBadge} ${styles[`code_${step.color}`]}`}>
                  STEP {step.code}
                </span>
              </div>

              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p className={styles.stepDesc}>{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
