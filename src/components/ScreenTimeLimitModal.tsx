/**
 * ScreenTimeLimitModal.tsx
 *
 * Full-screen soft lock shown when a child has reached their daily screen time limit.
 * Displayed at game-start boundaries only — never mid-round, to avoid interrupting play
 * in a way that loses progress.
 *
 * Why the child cannot dismiss this:
 *   The modal is a parental control gate. Allowing the child to close it would
 *   defeat the purpose. Only a parent PIN verifies and unlocks temporarily.
 *   "Temporarily" = sets isParentUnlocked for the session — on next game start,
 *   the parent sees it again.
 *
 * The PINEntryModal is rendered inline here so this component is self-contained.
 */

import React, { useState } from 'react';
import { Modal, View, Text, StyleSheet, Image } from 'react-native';
import { colors } from '../constants/colors';
import { useStrings } from '../hooks/useStrings';
import { PINEntryModal } from './PINEntryModal';
import { PinLockoutModal } from './PinLockoutModal';
import { useParentAuth } from '../hooks/useParentAuth';

interface ScreenTimeLimitModalProps {
  visible: boolean;
  todayMinutes: number;
  limitMinutes: number;
  onUnlocked: () => void;
}

export const ScreenTimeLimitModal: React.FC<ScreenTimeLimitModalProps> = ({
  visible,
  todayMinutes,
  limitMinutes,
  onUnlocked,
}) => {
  const strings = useStrings();
  const { verifyPin, isLocked, lockSecondsRemaining } = useParentAuth();
  const [pinError, setPinError] = useState(false);
  const [showPin, setShowPin] = useState(false);

  const handlePinSubmit = (pin: string) => {
    const ok = verifyPin(pin);
    if (ok) {
      setShowPin(false);
      onUnlocked();
    } else {
      setPinError(true);
      setTimeout(() => setPinError(false), 1500);
    }
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent={false} animationType="fade">
      <View style={styles.container}>
        <Text style={styles.emoji}>⏰</Text>
        <Text style={styles.title}>{strings.screenTimeLimitTitle}</Text>
        <Text style={styles.body}>
          {strings.screenTimeLimitBody(Math.round(todayMinutes), limitMinutes)}
        </Text>
        <Text style={styles.parentNote}>{strings.screenTimeLimitParentNote}</Text>

        <View style={styles.parentButton}>
          <Text
            style={styles.parentButtonText}
            onPress={() => setShowPin(true)}
          >
            {strings.screenTimeLimitUnlock}
          </Text>
        </View>

        <PINEntryModal
          visible={showPin && !isLocked}
          mode="verify"
          onSubmit={handlePinSubmit}
          onCancel={() => setShowPin(false)}
          hasError={pinError}
        />
        <PinLockoutModal visible={isLocked} lockSecondsRemaining={lockSecondsRemaining} />
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
    marginBottom: 40,
  },
  parentButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 30,
  },
  parentButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
});
