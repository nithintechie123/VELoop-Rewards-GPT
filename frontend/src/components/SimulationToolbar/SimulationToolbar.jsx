import React from 'react';
import { PlusCircle, Trophy, RefreshCw, Radio, UserCheck, LogOut, Layers, Sparkles, CheckCircle2, ChevronDown } from 'lucide-react';
import styles from './SimulationToolbar.module.css';

/**
 * Requirement 54: 7 Distinct User States
 * State 1: Visitor (Logged-Out Guest)
 * State 2: Logged-in non-participant (0 Tickets)
 * State 3: Logged-in participant (Active Tickets > 0)
 * State 4: Winner (Current User Matches Declared Winner)
 * State 5: Non-winner (Didn't win this time)
 * State 6: Giveaway ended (Status: Ended, Countdown: 0)
 * State 7: Upcoming giveaway (Status: Upcoming, Starts In 3 Days)
 */

export default function SimulationToolbar({
  isLoggedIn,
  currentUserId = 'VE10025',
  currentStage = 1,
  claimState = 'not_submitted',
  activeUserStatePreset = 4,
  onCycleLifecycleStage,
  onCycleUserIdentity,
  onCycleClaimState,
  onToggleAuth,
  onAddCoins,
  onResetData,
  onOpenReveal,
  onSelectUserState
}) {
  const userStateLabels = {
    1: 'State 1: Visitor (Guest)',
    2: 'State 2: Logged-In (0 Tickets)',
    3: 'State 3: Participant (Active Tickets)',
    4: 'State 4: Winner (Claim Banner)',
    5: 'State 5: Non-Winner (Explore Next)',
    6: 'State 6: Giveaway Ended (Archived)',
    7: 'State 7: Upcoming (Pre-Register)'
  };

  const claimStateLabels = {
    not_submitted: 'Claim: Not Submitted',
    submitted: 'Claim: Submitted ✓',
    processing: 'Claim: Processing ⏳',
    completed: 'Claim: Delivered ✓',
    expired: 'Claim: Expired ⚠️'
  };

  return (
    <div className={styles.simBar}>
      <div className="container-custom">
        <div className={styles.simContainer}>
          <div className={styles.simBrand}>
            <span className={styles.simBadge}>DEMO SANDBOX</span>
            <span className={styles.simText}>Simulation Suite</span>
          </div>

          <div className={styles.simActions}>
            {/* 7 User States Master Switcher (Requirement 54) */}
            {onSelectUserState && (
              <button
                className={styles.simBtn}
                onClick={onSelectUserState}
                title="Click to cycle through all 7 required User States: 1. Visitor -> 2. Logged-in non-participant -> 3. Participant -> 4. Winner -> 5. Non-winner -> 6. Ended -> 7. Upcoming"
                style={{ background: 'rgba(16, 185, 129, 0.2)', borderColor: 'rgba(16, 185, 129, 0.55)' }}
              >
                <CheckCircle2 size={14} className={styles.emeraldIcon} />
                <span style={{ fontWeight: 800, color: '#34d399' }}>
                  {userStateLabels[activeUserStatePreset] || 'User State'}
                </span>
              </button>
            )}

            {/* Winner Reveal Sequence (Requirement 47) */}
            {onOpenReveal && (
              <button
                className={styles.simBtn}
                onClick={onOpenReveal}
                title="Launch the controlled Winner Reveal Animation sequence"
                style={{ background: 'rgba(245, 158, 11, 0.22)', borderColor: 'rgba(245, 158, 11, 0.6)' }}
              >
                <Trophy size={14} className={styles.goldIcon} />
                <span style={{ fontWeight: 800, color: '#fbbf24' }}>🎬 Winner Reveal</span>
              </button>
            )}

            {/* User Identity Switcher (Req 33 & 34) */}
            <button
              className={styles.simBtn}
              onClick={onCycleUserIdentity}
              title="Switch between Winner (VE10025 Physical), Winner (VE20088 Gift Card), and Non-Winner (VE99999)"
            >
              <UserCheck size={14} className={styles.emeraldIcon} />
              <span>User: <strong>{currentUserId}</strong></span>
            </button>

            {/* Claim State Switcher (Req 32) */}
            <button
              className={styles.simBtn}
              onClick={onCycleClaimState}
              title="Cycle through: Not Submitted -> Submitted -> Processing -> Completed -> Expired"
              style={{ background: 'rgba(245, 158, 11, 0.18)', borderColor: 'rgba(245, 158, 11, 0.5)' }}
            >
              <Layers size={14} className={styles.goldIcon} />
              <span style={{ fontWeight: 800, color: '#fbbf24' }}>{claimStateLabels[claimState] || 'Claim State'}</span>
            </button>

            {/* Auth State Toggle */}
            <button className={styles.simBtn} onClick={onToggleAuth} title="Toggle logged-in and logged-out state">
              {isLoggedIn ? (
                <>
                  <UserCheck size={14} className={styles.emeraldIcon} />
                  <span>Logged In</span>
                </>
              ) : (
                <>
                  <LogOut size={14} className={styles.goldIcon} />
                  <span>Logged Out</span>
                </>
              )}
            </button>

            {/* Add Coins */}
            <button className={styles.simBtn} onClick={onAddCoins} title="Add 1,000 VELoop Loyalty Coins">
              <PlusCircle size={14} className={styles.emeraldIcon} />
              +1k Coins
            </button>

            {/* Reset */}
            <button className={styles.simBtnGhost} onClick={onResetData} title="Reset demo state">
              <RefreshCw size={13} />
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
