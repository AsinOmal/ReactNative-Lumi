/**
 * ScreenTimeLimitModal.tsx
 *
 * Full-screen soft lock shown when a child has reached their daily screen time limit.
 *
 * The child cannot dismiss this — only a parent PIN can. There are two outcomes
 * after a successful PIN entry, picked by which button the parent tapped:
 *   - "Add 5 minutes" → calls onGrant5Min(). Modal hides until the grace
 *     window expires, then it returns automatically (useScreenTime schedules
 *     a re-render at the expiry instant).
 *   - "Unlock with PIN" → calls onUnlocked(). Modal stays hidden for the rest
 *     of the session (until cold restart).
 *
 * Why PIN is required for both:
 *   Without PIN on +5, the child can tap +5 every five minutes forever and
 *   the lock has no teeth. The PIN adds ~2 s of parent friction — enough to
 *   make the grant intentional.
 */

import React, { useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../constants/colors';
import { useStrings } from '../hooks/useStrings';
import { PINEntryModal } from './PINEntryModal';
import { PinLockoutModal } from './PinLockoutModal';
import { useParentAuth } from '../hooks/useParentAuth';
import { useParentalControlsStore } from '../store/useParentalControlsStore';

type PendingAction = 'grant5' | 'unlock' | null;

interface ScreenTimeLimitModalProps {
  visible: boolean;
  todayMinutes: number;
  limitMinutes: number;
  onUnlocked: () => void;
  onGrant5Min: () => void;
}

export const ScreenTimeLimitModal: React.FC<ScreenTimeLimitModalProps> = ({
  visible,
  todayMinutes,
  limitMinutes,
  onUnlocked,
  onGrant5Min,
}) => {
  const strings = useStrings();
  const { verifyPin, isLocked, lockSecondsRemaining } = useParentAuth();
  const setParentUnlocked = useParentalControlsStore(
    (s) => s.setParentUnlocked
  );
  const [pinError, setPinError] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);

  const handlePinSubmit = (pin: string) => {
    const ok = verifyPin(pin);
    if (!ok) {
      setPinError(true);
      setTimeout(() => setPinError(false), 1500);
      return;
    }
    // verifyPin sets isParentUnlocked=true as a side effect. That's the right
    // behaviour for the "unlock" branch; for "+5" we undo it so the gate
    // returns once the grace expires.
    if (pendingAction === 'grant5') {
      setParentUnlocked(false);
      onGrant5Min();
    } else if (pendingAction === 'unlock') {
      onUnlocked();
    }
    setPendingAction(null);
  };

  if (!visible) {
    return null;
  }

  return (
    <Modal visible={visible} transparent={false} animationType="fade">
      <View style={styles.container}>
        <Text style={styles.emoji}>⏰</Text>
        <Text style={styles.title}>{strings.screenTimeLimitTitle}</Text>
        <Text style={styles.body}>
          {strings.screenTimeLimitBody(Math.round(todayMinutes), limitMinutes)}
        </Text>
        <Text style={styles.parentNote}>
          {strings.screenTimeLimitParentNote}
        </Text>

        <TouchableOpacity
          style={styles.primaryButton}
          activeOpacity={0.85}
          onPress={() => setPendingAction('unlock')}
          accessibilityRole="button"
        >
          <Text style={styles.primaryButtonText}>
            {strings.screenTimeLimitUnlock}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          activeOpacity={0.85}
          onPress={() => setPendingAction('grant5')}
          accessibilityRole="button"
        >
          <Text style={styles.secondaryButtonText}>
            {strings.screenTimeLimitGrant5}
          </Text>
        </TouchableOpacity>

        <PINEntryModal
          visible={pendingAction !== null && !isLocked}
          mode="verify"
          onSubmit={handlePinSubmit}
          onCancel={() => setPendingAction(null)}
          hasError={pinError}
        />
        <PinLockoutModal
          visible={isLocked}
          lockSecondsRemaining={lockSecondsRemaining}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundPurple,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emoji: {
    fontSize: 72,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 16,
  },
  body: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 12,
  },
  parentNote: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 30,
    minWidth: 240,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 30,
    minWidth: 240,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: 'transparent',
  },
  secondaryButtonText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '700',
  },
});
