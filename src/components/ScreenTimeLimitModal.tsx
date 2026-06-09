/**
 * ScreenTimeLimitModal.tsx
 *
 * Full-screen "learning break" gate shown when a child has reached their
 * daily screen-time limit. Friendly framing (cute owl + clock art, cream card,
 * sky background) rather than an alarm — the limit is a pause, not a punishment.
 *
 * The child cannot dismiss this — only a parent PIN can. Two unlock paths
 * after a successful PIN, picked by which button the parent tapped:
 *   - "Request 5 More Minutes" → onGrant5Min(). The grace window expires
 *     automatically and the gate returns (useScreenTime schedules a re-render
 *     at the expiry instant).
 *   - "Unlock with Parent PIN" → onUnlocked(). Gate stays hidden for the rest
 *     of the session.
 *
 * PIN required for both: without PIN on +5 the child could tap forever.
 */

import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, Image } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useStrings } from '../hooks/useStrings';
import { PINEntryModal } from './PINEntryModal';
import { PinLockoutModal } from './PinLockoutModal';
import { useParentAuth } from '../hooks/useParentAuth';
import { useParentalControlsStore } from '../store/useParentalControlsStore';
import { styles } from './ScreenTimeLimitModalStyles';

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
  const { setParentUnlocked } = useParentalControlsStore();
  const [pinError, setPinError] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);

  const handleAction = (action: PendingAction) => {
    setPendingAction(action);
  };

  const handlePinSubmit = (pin: string) => {
    const ok = verifyPin(pin);
    if (!ok) {
      setPinError(true);
      setTimeout(() => setPinError(false), 1500);
      return;
    }
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
      <LinearGradient
        colors={['#BFEFFF', '#DDF8FF']}
        style={styles.bg}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        <View style={styles.card}>
          <Image
            source={require('../assets/images/screen-timeout.png')}
            style={styles.art}
            resizeMode="contain"
            accessibilityLabel="A sleepy owl holding a clock"
          />
          <Text style={styles.title}>{strings.screenTimeLimitTitle}</Text>
          <Text style={styles.body}>{strings.screenTimeLimitBody}</Text>
          <Text style={styles.parentNote}>
            {strings.screenTimeLimitParentNote}
          </Text>

          <View style={styles.usagePill}>
            <Text style={styles.usagePillText}>
              {strings.screenTimeLimitUsageFmt(
                Math.round(todayMinutes),
                limitMinutes
              )}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.primaryButton}
            activeOpacity={0.85}
            onPress={() => handleAction('unlock')}
            accessibilityRole="button"
          >
            <Text style={styles.primaryButtonText}>
              {strings.screenTimeLimitUnlock}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            activeOpacity={0.85}
            onPress={() => handleAction('grant5')}
            accessibilityRole="button"
          >
            <Text style={styles.secondaryButtonText}>
              {strings.screenTimeLimitGrant5}
            </Text>
          </TouchableOpacity>
        </View>

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
      </LinearGradient>
    </Modal>
  );
};
