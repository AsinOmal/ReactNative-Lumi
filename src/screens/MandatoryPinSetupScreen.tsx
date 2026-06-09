import React, { useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { sha256 } from 'js-sha256';
import { PINEntryModal } from '../components/PINEntryModal';
import { useAuthStore } from '../store/useAuthStore';
import { useParentalControlsStore } from '../store/useParentalControlsStore';
import { useStrings } from '../hooks/useStrings';
import { styles } from './MandatoryPinSetupScreenStyles';

export const MandatoryPinSetupScreen = () => {
  const strings = useStrings();
  const user = useAuthStore((s) => s.user);
  const updateSettings = useParentalControlsStore((s) => s.updateSettings);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (pin: string) => {
    if (!user || saving) {
      return;
    }
    setSaving(true);
    await updateSettings(user.uid, { pinHash: sha256(pin) });
    setSaving(false);
  };

  return (
    <View style={styles.root}>
      <Text style={styles.brand}>Lumi</Text>
      <Text style={styles.title}>{strings.mandatoryPinTitle}</Text>
      <Text style={styles.body}>{strings.mandatoryPinSubtitle}</Text>
      {saving ? <ActivityIndicator size="large" color="#FF9A2E" /> : null}
      <PINEntryModal
        visible
        mode="set"
        onSubmit={handleSubmit}
        onCancel={() => {}}
        titleOverride={strings.mandatoryPinTitle}
        subtitleOverride={strings.mandatoryPinSubtitle}
        showCancel={false}
      />
    </View>
  );
};
