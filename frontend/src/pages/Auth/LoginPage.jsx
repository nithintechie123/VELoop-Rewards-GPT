import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Lock,
  Mail,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  LogIn,
  UserPlus,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { soundFx } from '../../utils/soundFx';
import { ConfettiManager } from '../../utils/confetti';
import styles from './LoginPage.module.css';

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const redirectUrl = searchParams.get('redirect') ? decodeURIComponent(searchParams.get('redirect')) : '/';
  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'login';

  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState('alex.thorne@veloop.io');
  const [password, setPassword] = useState('••••••••••••');
  const [fullName, setFullName] = useState('Alex Thorne');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    soundFx.playSuccess();

    setTimeout(() => {
      ConfettiManager.burst(window.innerWidth / 2, window.innerHeight / 2, 70);
      setIsLoading(false);
      navigate(redirectUrl);
    }, 600);
  };

  return (
    <div className={styles.loginPageWrap}>
      <div className={styles.ambientBackdrop}></div>

      {/* Top Bar */}
      <div className={styles.topBar}>
        <Link to={redirectUrl} className={styles.backBtn}>
          <ArrowLeft size={16} /> Return to Giveaway
        </Link>
        <span className={styles.securityTag}>
          <ShieldCheck size={14} className={styles.iconEmerald} /> 256-Bit SSL Encrypted
        </span>
      </div>

      <div className={styles.loginCardContainer}>
        <motion.div
          className={styles.loginCard}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Logo & Brand Header */}
          <div className={styles.brandHeader}>
            <div className={styles.logoBadge}>
              <Sparkles size={22} className={styles.iconGold} />
            </div>
            <h1 className={styles.brandTitle}>VELOOP Rewards</h1>
            <p className={styles.brandSubtitle}>
              {mode === 'login'
                ? 'Sign in to access your sweepstakes tickets and wallet'
                : 'Create your account to claim 100% free daily entries'}
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className={styles.modeTabs}>
            <button
              className={`${styles.tabBtn} ${mode === 'login' ? styles.tabBtnActive : ''}`}
              onClick={() => {
                soundFx.playClick();
                setMode('login');
              }}
            >
              <LogIn size={15} /> Sign In
            </button>
            <button
              className={`${styles.tabBtn} ${mode === 'signup' ? styles.tabBtnActive : ''}`}
              onClick={() => {
                soundFx.playClick();
                setMode('signup');
              }}
            >
              <UserPlus size={15} /> Create Account
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className={styles.authForm}>
            {mode === 'signup' && (
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Full Name</label>
                <div className={styles.inputWrap}>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className={styles.textInput}
                    placeholder="Enter full name"
                  />
                </div>
              </div>
            )}

            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>Email Address</label>
              <div className={styles.inputWrap}>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={styles.textInput}
                  placeholder="Enter email address"
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <div className={styles.labelRow}>
                <label className={styles.inputLabel}>Password</label>
                {mode === 'login' && (
                  <span className={styles.forgotLink}>Forgot password?</span>
                )}
              </div>
              <div className={styles.inputWrap}>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={styles.textInput}
                  placeholder="Enter your password"
                />
              </div>
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              disabled={isLoading}
              className={styles.submitBtn}
            >
              {isLoading ? (
                <span>Authenticating...</span>
              ) : mode === 'login' ? (
                <>
                  <LogIn size={18} />
                  <span>Sign In & Continue</span>
                </>
              ) : (
                <>
                  <Zap size={18} />
                  <span>Create Account & Join</span>
                </>
              )}
            </button>
          </form>

          {/* Demo quick credential helper */}
          <div className={styles.demoHelperCard}>
            <div className={styles.demoHelperHead}>
              <CheckCircle2 size={15} className={styles.iconEmerald} />
              <strong>Quick Demo Account Auto-filled:</strong>
            </div>
            <p>
              Account: <code>{email}</code> • Balance: <strong>850 VEs / 1,200 SVEs</strong>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
