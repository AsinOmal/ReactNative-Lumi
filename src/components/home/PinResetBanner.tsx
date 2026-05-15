// 📖 What this does:
// Shown on the HomeScreen when pinResetPending === true in parentSettings.
// This flag is set by the admin when resetting a parent's PIN remotely.
// Tapping the banner opens a PIN setup modal in-place.
// After the new PIN is saved, clears pinResetPending in Firestore.

import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useParentalControlsStore } from '../../store/useParentalControlsStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useParentAuth } from '../../hooks/useParentAuth';
import { useStrings } from '../../hooks/useStrings';
import { PINEntryModal } from '../PINEntryModal';
import { styles } from './PinResetBannerStyles';

export const PinResetBanner: React.FC = () => {
  const strings = useStrings();
  const { settings, updateSettings } = useParentalControlsStore();
  const { user } = useAuthStore();
  const { updatePin } = useParentAuth();
  const [showModal, setShowModal] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (!settings.pinResetPending || dismissed) {
    return null;
  }

  const handleSetPin = async (pin: string) => {
    try {
      await updatePin(pin);
      if (user) {
        await updateSettings(user.uid, { pinResetPending: false });
      }
    } catch {
      /* non-blocking */
    }
    setShowModal(false);
    setDismissed(true);
  };

  return (
    <>
      <TouchableOpacity
        style={styles.banner}
        onPress={() => setShowModal(true)}
        activeOpacity={0.85}
        accessibilityRole="button"
      >
        <Ionicons
          name="key"
          size={18}
          color="#C96B00"
          style={{ marginRight: 8 }}
        />
        <Text style={styles.bannerText}>{strings.pinResetBannerMessage}</Text>
        <TouchableOpacity
          onPress={() => setDismissed(true)}
          style={styles.dismissBtn}
          accessibilityRole="button"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="close" size={16} color="#C96B00" />
        </TouchableOpacity>
      </TouchableOpacity>
      <PINEntryModal
        visible={showModal}
        mode="set"
        onSubmit={handleSetPin}
        onCancel={() => setShowModal(false)}
        titleOverride={strings.pinSetNewTitle}
        subtitleOverride={strings.pinSetNewSubtitle}
      />
    </>
  );
};
