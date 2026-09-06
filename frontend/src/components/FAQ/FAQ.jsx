import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle, MessageCircleQuestion } from 'lucide-react';
import { soundFx } from '../../utils/soundFx';
import styles from './FAQ.module.css';

/**
 * Requirement 45: Compact FAQ Section with Expandable Accordions
 * Covers:
 * 1. How do I participate?
 * 2. How are winners selected?
 * 3. When are winners announced?
 * 4. What happens if I win?
 * 5. How do I claim my prize?
 * 6. Can I participate in multiple giveaways?
 * 7. What happens after the giveaway ends?
 */

const FAQ_DATA = [
  {
    id: 'how-participate',
    category: 'Participation',
    q: 'How do I participate?',
    a: 'Participating is simple and 100% free. Browse any active giveaway pool on the dashboard, click "Enter Giveaway", and claim your guaranteed Free Daily Ticket. You can also complete quick community quests or redeem VELoop loyalty coins for optional bonus entries.'
  },
  {
    id: 'winner-selection',
    category: 'Fairness',
    q: 'How are winners selected?',
    a: 'Winners are determined through an unalterable HMAC SHA-256 Provably Fair algorithm. When the countdown expires, our automated system combines a pre-committed server seed with a public blockchain block hash to choose a winning ticket with mathematical randomness. You can independently verify every draw in the Provably Fair Verifier.'
  },
  {
    id: 'when-announced',
    category: 'Schedule',
    q: 'When are winners announced?',
    a: 'Winners are announced instantly when the giveaway countdown timer reaches zero (00:00:00). The dashboard immediately updates with the winning ticket ID, obfuscated winner username, and verified proof hash.'
  },
  {
    id: 'what-if-win',
    category: 'Winner Portal',
    q: 'What happens if I win?',
    a: 'If your ticket matches the winning draw, a prominent Winner Claim Banner will appear on your dashboard along with an email notification. You will have a 14-day claim window to enter your delivery or digital voucher details.'
  },
  {
    id: 'how-to-claim',
    category: 'Fulfillment',
    q: 'How do I claim my prize?',
    a: 'Click "Claim Prize" on your winner banner to launch the Claim Wizard. For physical prizes (e.g. Apple Watch, iPhone), enter your shipping address for insured FedEx/DHL delivery. For gift cards and digital game codes, enter your recipient email to receive your voucher code within 24–48 hours.'
  },
  {
    id: 'multiple-giveaways',
    category: 'Rules',
    q: 'Can I participate in multiple giveaways?',
    a: 'Yes! You can enter every active giveaway pool simultaneously. Each pool provides its own separate Free Daily Entry every 24 hours, so you can maximize your chances across flagship tech prizes, instant gift cards, and game passes.'
  },
  {
    id: 'after-giveaway-ends',
    category: 'Lifecycle',
    q: 'What happens after the giveaway ends?',
    a: 'Once a giveaway concludes and winners are verified, the draw is archived in the "Previous Winners" history ledger with full cryptographic proof. A brand new giveaway pool cycle begins immediately so you can start collecting tickets for the next round.'
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  const toggle = (idx) => {
    soundFx.playClick();
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className={styles.section} id="faq" aria-label="Frequently Asked Questions">
      <div className="container-custom">
        {/* Section Header */}
        <div className={styles.header}>
          <span className={styles.tag}>
            <HelpCircle size={14} /> KNOWLEDGE & SUPPORT
          </span>
          <h2 className={styles.title}>Frequently Asked Questions</h2>
          <p className={styles.subtitle}>
            Clear answers to everything about entries, provably fair drawings, and prize fulfillment.
          </p>
        </div>

        {/* Compact Accordion List */}
        <div className={styles.accordion}>
          {FAQ_DATA.map((faq, idx) => {
            const isOpen = openIndex === idx;

            return (
              <motion.div
                key={faq.id}
                className={`${styles.item} ${isOpen ? styles.itemOpen : ''}`}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
              >
                <button
                  className={styles.questionBtn}
                  onClick={() => toggle(idx)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-ans-${faq.id}`}
                  id={`faq-btn-${faq.id}`}
                >
                  <div className={styles.questionContent}>
                    <span className={styles.categoryPill}>{faq.category}</span>
                    <span className={styles.questionText}>{faq.q}</span>
                  </div>
                  <ChevronDown
                    size={18}
                    className={`${styles.chevron} ${isOpen ? styles.chevronRotated : ''}`}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={`faq-ans-${faq.id}`}
                      role="region"
                      aria-labelledby={`faq-btn-${faq.id}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      className={styles.answerWrapper}
                    >
                      <div className={styles.answerBox}>
                        <p>{faq.a}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Still Have Questions Strip */}
        <div className={styles.supportStrip}>
          <div className={styles.supportInfo}>
            <MessageCircleQuestion size={18} className={styles.supportIcon} />
            <span>Still have questions about sweepstakes verification or courier delivery?</span>
          </div>
          <a href="mailto:support@veloop-rewards.io" className={styles.supportLink}>
            Contact Support →
          </a>
        </div>
      </div>
    </section>
  );
}
