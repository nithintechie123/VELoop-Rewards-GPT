import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lock,
  Mail,
  User,
  X,
  Sparkles,
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
import styles from './AuthModal.module.css';

export default function AuthModal({
  isOpen,
  initialMode = 'login',
  onClose,
  onSuccess
}) {
  const { login, register } = useAuth();

  const [mode, setMode] = useState(initialMode);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setErrorMessage('');
    }
  }, [isOpen, initialMode]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (mode === 'signup') {
      if (!fullName.trim()) {
        setErrorMessage('Please enter your full name.');
        return;
      }
      if (password.length < 6) {
        setErrorMessage('Password must be at least 6 characters.');
        return;
      }
    }

    setIsLoading(true);

    if (mode === 'login') {
      const res = await login(email, password);
      setIsLoading(false);
      if (res.success) {
        onClose();
        if (onSuccess) onSuccess(res.user);
      } else {
        setErrorMessage(res.error);
      }
    } else {
      const res = await register({ fullName, email, password });
      setIsLoading(false);
      if (res.success) {
        onClose();
        if (onSuccess) onSuccess(res.user);
      } else {
        setErrorMessage(res.error);
      }
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className={styles.overlay}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className={styles.modal}
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            className={styles.closeBtn}
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            aria-label="Close"
          >
            <X size={16} />
          </button>

          {/* Brand Header */}
          <div className={styles.brandHeader}>
            <div className={styles.logoBadge}>
              <Sparkles size={22} style={{ color: '#fbbf24' }} />
            </div>
            <h3 className={styles.brandTitle}>VELOOP Rewards</h3>
            <p className={styles.brandSubtitle}>
              {mode === 'login'
                ? 'Sign in to access your sweepstakes entries & prize vault'
                : 'Create your account stored securely in our database'}
            </p>

            {mode === 'signup' && (
              <div className={styles.welcomeBonusPill}>
                <Gift size={13} /> +500 VEs Welcome Bonus!
              </div>
            )}
          </div>

          {/* Mode Switch Tabs */}
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
              <LogIn size={14} /> Sign In
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
              <UserPlus size={14} /> Register Free
            </button>
          </div>

          {/* Error message */}
          {errorMessage && (
            <div className={styles.errorAlert}>
              <AlertCircle size={15} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className={styles.authForm}>
            {mode === 'signup' && (
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Full Name</label>
                <div className={styles.inputWrap}>
                  <User size={15} className={styles.inputIcon} />
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
                <Mail size={15} className={styles.inputIcon} />
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
              </div>
              <div className={styles.inputWrap}>
                <Lock size={15} className={styles.inputIcon} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={styles.textInput}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className={styles.togglePasswordBtn}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={styles.submitBtn}
            >
              {isLoading ? (
                <span>Connecting to Server...</span>
              ) : mode === 'login' ? (
                <>
                  <LogIn size={16} />
                  <span>Sign In</span>
                </>
              ) : (
                <>
                  <Zap size={16} />
                  <span>Create Account & Join</span>
                </>
              )}
            </button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
