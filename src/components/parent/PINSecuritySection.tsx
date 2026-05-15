// 📖 What this does:
// Renders the "PIN SECURITY" section in the Time tab of Parent Dashboard.
// Change PIN: verifies current PIN first, then allows setting a new one.
// Forgot PIN: since the parent is already authenticated, allows setting a new PIN directly.
// Both flows reuse PINEntryModal with context-specific title overrides.

import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useParentAuth } from '../../hooks/useParentAuth';
import { useStrings } from '../../hooks/useStrings';
import { PINEntryModal } from '../PINEntryModal';
import { styles } from './PINSecuritySectionStyles';

type PINFlow = 'idle' | 'verify_current' | 'set_new' | 'done';

export const PINSecuritySection: React.FC = () => {
  const strings = useStrings();
  const { verifyPin, updatePin } = useParentAuth();
  const [flow, setFlow] = useState<PINFlow>('idle');
  const [pinError, setPinError] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleVerifySubmit = (pin: string) => {
    const ok = verifyPin(pin);
    if (ok) {
      setFlow('set_new');
    } else {
      setPinError(true);
      setTimeout(() => setPinError(false), 1500);
    }
  };

  const handleSetNewSubmit = async (pin: string) => {
    setSaving(true);
    try {
      await updatePin(pin);
      setFlow('done');
      setTimeout(() => setFlow('idle'), 2000);
    } catch {
      setFlow('idle');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setPinError(false);
    setFlow('idle');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionLabel}>{strings.pinSecuritySectionLabel}</Text>

      <View style={styles.card}>
        <TouchableOpacity style={styles.row} onPress={() => setFlow('verify_current')} accessibilityRole="button">
          <View style={styles.iconWrap}>
            <Ionicons name="lock-closed-outline" size={20} color="#FF9A2E" />
          </View>
          <View style={styles.rowText}>
            <Text style={styles.rowLabel}>{strings.pinChangePinLabel}</Text>
            <Text style={styles.rowSub}>{strings.pinChangePinSub}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#C4A882" />
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity style={styles.row} onPress={() => setFlow('set_new')} accessibilityRole="button">
          <View style={styles.iconWrap}>
            <Ionicons name="key-outline" size={20} color="#FF9A2E" />
          </View>
          <View style={styles.rowText}>
            <Text style={styles.rowLabel}>{strings.pinForgotPinLabel}</Text>
            <Text style={styles.rowSub}>{strings.pinForgotPinSub}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#C4A882" />
        </TouchableOpacity>
      </View>

      {flow === 'done' && (
        <Text style={styles.successText}>{strings.pinUpdateSuccess}</Text>
      )}

      <PINEntryModal
        visible={flow === 'verify_current'}
        mode="verify"
        onSubmit={handleVerifySubmit}
        onCancel={handleCancel}
        hasError={pinError}
        titleOverride={strings.pinVerifyCurrentTitle}
        subtitleOverride={strings.pinVerifyCurrentSubtitle}
      />
      <PINEntryModal
        visible={flow === 'set_new' && !saving}
        mode="set"
        onSubmit={handleSetNewSubmit}
        onCancel={handleCancel}
        titleOverride={strings.pinSetNewTitle}
        subtitleOverride={strings.pinSetNewSubtitle}
      />
    </View>
  );
};
