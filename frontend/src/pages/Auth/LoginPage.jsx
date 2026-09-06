import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lock,
  Mail,
  User,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  LogIn,
  UserPlus,
  Zap,
  Eye,
  EyeOff,
  AlertCircle,
  Gift
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { soundFx } from '../../utils/soundFx';
import styles from './LoginPage.module.css';

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const redirectUrl = searchParams.get('redirect') ? decodeURIComponent(searchParams.get('redirect')) : '/';
  const initialMode = searchParams.get('mode') === 'signup' || searchParams.get('mode') === 'register' ? 'signup' : 'login';

  const [mode, setMode] = useState(initialMode);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Compute password strength for registration
  const calculateStrength = (pass) => {
    if (!pass) return { score: 0, label: '', color: '#e2e8f0' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 2) return { score: 33, label: 'Weak', color: '#ef4444' };
    if (score <= 3) return { score: 66, label: 'Medium', color: '#f59e0b' };
    return { score: 100, label: 'Strong', color: '#10b981' };
  };

  const strength = calculateStrength(password);

  const [infoNotice, setInfoNotice] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setInfoNotice('');

    if (mode === 'signup') {
      if (!fullName.trim()) {
        setErrorMessage('Please enter your full name.');
        return;
      }
      if (password.length < 6) {
        setErrorMessage('Password must be at least 6 characters long.');
        return;
      }
      if (!agreeTerms) {
        setErrorMessage('Please accept the Terms of Service & Sweepstakes Rules.');
        return;
      }
    }

    setIsLoading(true);

    if (mode === 'login') {
      const res = await login(email, password, rememberMe);
      setIsLoading(false);
      if (res.success) {
        navigate(redirectUrl);
      } else {
        // If user is not found in database, redirect to register mode
        if (res.notFound || res.status === 404 || res.error?.toLowerCase().includes('no account')) {
          soundFx.playClick();
          setMode('signup');
          setInfoNotice(`No account found for "${email}". We've redirected you to create your account — enter your full name below to get your +500 VEs signup bonus!`);
          navigate(`/login?mode=signup&redirect=${encodeURIComponent(redirectUrl)}`, { replace: true });
        } else {
          setErrorMessage(res.error);
        }
      }
    } else {
      const res = await register({ fullName, email, password, rememberMe });
      setIsLoading(false);
      if (res.success) {
        navigate(redirectUrl);
      } else {
        setErrorMessage(res.error);
      }
    }
  };

  return (
    <div className={styles.loginPageWrap}>
      <div className={styles.ambientBackdrop}></div>

      {/* Top Bar Navigation */}
      <div className={styles.topBar}>
        <Link to={redirectUrl} className={styles.backBtn} onClick={() => soundFx.playClick()}>
          <ArrowLeft size={16} /> Return to Giveaway
        </Link>
        <span className={styles.securityTag}>
          <ShieldCheck size={14} className={styles.iconEmerald} /> 256-Bit SSL Secured & MongoDB Cloud Verified
        </span>
      </div>

      <div className={styles.loginCardContainer}>
        <motion.div
          className={styles.loginCard}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          {/* Logo & Header */}
          <div className={styles.brandHeader}>
            <div className={styles.logoBadge}>
              <Sparkles size={24} className={styles.iconGold} />
            </div>
            <h1 className={styles.brandTitle}>VELOOP Rewards</h1>
            <p className={styles.brandSubtitle}>
              {mode === 'login'
                ? 'Sign in to access your real giveaway entries, coins & prize vault'
                : 'Create your verified account stored securely in our database'}
            </p>

            {mode === 'signup' && (
              <motion.div
                className={styles.welcomeBonusPill}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                <Gift size={14} /> +500 VEs Welcome Signup Bonus!
              </motion.div>
            )}
          </div>

          {/* Mode Switcher Tabs */}
          <div className={styles.modeTabs}>
            <button
              type="button"
              className={`${styles.tabBtn} ${mode === 'login' ? styles.tabBtnActive : ''}`}
              onClick={() => {
                soundFx.playClick();
                setMode('login');
                setErrorMessage('');
              }}
            >
              <LogIn size={15} /> Sign In
            </button>
            <button
              type="button"
              className={`${styles.tabBtn} ${mode === 'signup' ? styles.tabBtnActive : ''}`}
              onClick={() => {
                soundFx.playClick();
                setMode('signup');
                setErrorMessage('');
              }}
            >
              <UserPlus size={15} /> Register Free
            </button>
          </div>

          {/* Info Notice (Redirected from Login) */}
          <AnimatePresence>
            {infoNotice && (
              <motion.div
                className={styles.infoNoticeAlert}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                style={{
                  background: 'rgba(56, 189, 248, 0.12)',
                  border: '1px solid rgba(56, 189, 248, 0.35)',
                  color: '#7dd3fc',
                  padding: '0.85rem 1rem',
                  borderRadius: '12px',
                  fontSize: '0.85rem',
                  lineHeight: '1.4',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.6rem'
                }}
              >
                <Sparkles size={18} style={{ color: '#38bdf8', flexShrink: 0, marginTop: '2px' }} />
                <span>{infoNotice}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error Alert */}
          <AnimatePresence>
            {errorMessage && (
              <motion.div
                className={styles.errorAlert}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
              >
                <AlertCircle size={16} />
                <span>{errorMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Auth Form */}
          <form onSubmit={handleSubmit} className={styles.authForm}>
            {mode === 'signup' && (
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Full Name</label>
                <div className={styles.inputWrap}>
                  <User size={16} className={styles.inputIcon} />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className={styles.textInput}
                    placeholder="Enter your full name"
                  />
                </div>
              </div>
            )}

            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>Email Address</label>
              <div className={styles.inputWrap}>
                <Mail size={16} className={styles.inputIcon} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={styles.textInput}
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <div className={styles.labelRow}>
                <label className={styles.inputLabel}>Password</label>
                {mode === 'login' && (
                  <span
                    className={styles.forgotLink}
                    onClick={() => {
                      soundFx.playClick();
                      alert('Please contact support or register a new account.');
                    }}
                  >
                    Forgot password?
                  </span>
                )}
              </div>
              <div className={styles.inputWrap}>
                <Lock size={16} className={styles.inputIcon} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={styles.textInput}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className={styles.togglePasswordBtn}
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Password strength indicator on register */}
              {mode === 'signup' && password.length > 0 && (
                <div className={styles.strengthMeterWrap}>
                  <div className={styles.strengthBarTrack}>
                    <div
                      className={styles.strengthBarFill}
                      style={{ width: `${strength.score}%`, backgroundColor: strength.color }}
                    />
                  </div>
                  <div className={styles.strengthText}>
                    <span style={{ color: strength.color }}>Password: {strength.label}</span>
                    <span style={{ color: '#94a3b8' }}>Min 6 chars</span>
                  </div>
                </div>
              )}
            </div>

            {/* Options Row */}
            <div className={styles.optionsRow}>
              {mode === 'login' ? (
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className={styles.checkboxInput}
                  />
                  <span>Remember my session</span>
                </label>
              ) : (
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className={styles.checkboxInput}
                  />
                  <span>I agree to Sweepstakes Rules & Privacy Policy</span>
                </label>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={styles.submitBtn}
            >
              {isLoading ? (
                <span>Connecting to Server...</span>
              ) : mode === 'login' ? (
                <>
                  <LogIn size={18} />
                  <span>Sign In & Continue</span>
                </>
              ) : (
                <>
                  <Zap size={18} />
                  <span>Create Account & Claim 500 VEs</span>
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
