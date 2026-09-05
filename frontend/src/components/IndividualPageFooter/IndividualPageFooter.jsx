import React from 'react';
import { Link } from 'react-router-dom';
import {
  Gift,
  HelpCircle,
  FileText,
  ShieldCheck,
  Lock,
  Mail,
  ExternalLink,
  ChevronRight,
  Headphones
} from 'lucide-react';
import styles from './IndividualPageFooter.module.css';

export default function IndividualPageFooter({ onOpenRules, onOpenTerms, onOpenSupport }) {
  return (
    <footer className={styles.compactFooter} aria-label="Individual Giveaway Page Footer">
      <div className={styles.footerContainer}>
        {/* Top Support Banner: Have questions? Contact VELOOP Rewards support. */}
        <div className={styles.supportBanner}>
          <div className={styles.supportLeft}>
            <div className={styles.supportIconWrap}>
              <Headphones size={20} className={styles.supportIcon} />
            </div>
            <div className={styles.supportTextWrap}>
              <strong className={styles.supportHeading}>Have questions?</strong>
              <p className={styles.supportSub}>
                Contact VELOOP Rewards support for help with entries, odds, or prize claims.
              </p>
            </div>
          </div>

          <a
            href="mailto:support@veloop.io?subject=Giveaway%20Support%20Inquiry"
            className={styles.supportContactBtn}
            onClick={(e) => {
              if (onOpenSupport) {
                e.preventDefault();
                onOpenSupport();
              }
            }}
            aria-label="Contact VELOOP Rewards support"
          >
            <Mail size={15} />
            <span>Contact Support</span>
          </a>
        </div>

        {/* Main Compact Row: Branding + Nav Links */}
        <div className={styles.mainFooterRow}>
          {/* VELOOP Rewards Branding */}
          <div className={styles.brandCol}>
            <Link to="/" className={styles.brandLink}>
              <div className={styles.logoBadge}>
                <Gift size={18} className={styles.logoIcon} />
              </div>
              <div className={styles.brandText}>
                <span className={styles.brandName}>
                  VELOOP <span className={styles.brandAccent}>REWARDS</span>
                </span>
                <span className={styles.brandSub}>Provably Fair Loyalty Ecosystem</span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className={styles.footerNav} aria-label="Footer Navigation">
            <Link to="/" className={styles.navLink} aria-label="Giveaway Home">
              Giveaway Home
            </Link>
            <span className={styles.navDivider} aria-hidden="true">•</span>

            <button
              type="button"
              className={styles.navBtn}
              onClick={() => {
                if (onOpenRules) onOpenRules();
                else {
                  const rulesEl = document.getElementById('details-tabs-section');
                  if (rulesEl) rulesEl.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              aria-label="Giveaway Rules"
            >
              Rules
            </button>
            <span className={styles.navDivider} aria-hidden="true">•</span>

            <button
              type="button"
              className={styles.navBtn}
              onClick={() => {
                if (onOpenTerms) onOpenTerms();
                else {
                  const termsEl = document.getElementById('details-tabs-section');
                  if (termsEl) termsEl.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              aria-label="Terms of Service"
            >
              Terms
            </button>
            <span className={styles.navDivider} aria-hidden="true">•</span>

            <a
              href="#privacy"
              className={styles.navLink}
              onClick={(e) => {
                e.preventDefault();
                alert('VELOOP Rewards Privacy Policy: We respect your privacy. User data is encrypted and never sold to third parties.');
              }}
              aria-label="Privacy Policy"
            >
              Privacy
            </a>
            <span className={styles.navDivider} aria-hidden="true">•</span>

            <a
              href="mailto:support@veloop.io"
              className={styles.navLink}
              onClick={(e) => {
                if (onOpenSupport) {
                  e.preventDefault();
                  onOpenSupport();
                }
              }}
              aria-label="Support Desk"
            >
              Support
            </a>
          </nav>
        </div>

        {/* Bottom Micro Bar: Security & Copyright */}
        <div className={styles.bottomBar}>
          <div className={styles.securityPills}>
            <span className={styles.secPill}>
              <Lock size={12} /> SSL 256-Bit Secured
            </span>
            <span className={styles.secPill}>
              <ShieldCheck size={12} /> SHA-256 Provably Fair
            </span>
          </div>

          <p className={styles.copyrightText}>
            © {new Date().getFullYear()} VELOOP Rewards Inc. All rights reserved. 100% Free Daily Sweepstakes.
          </p>
        </div>
      </div>
    </footer>
  );
}
