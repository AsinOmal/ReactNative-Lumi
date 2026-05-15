// 📖 What this does:
// Shown when a parent has failed PIN entry MAX_PIN_ATTEMPTS times.
// Displays a countdown, then offers a "Contact Support" button that opens
// the FeedbackModal pre-filled with a PIN reset request message.
// The calling component shows this when isLocked === true from useParentAuth.

import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useStrings } from '../hooks/useStrings';
import { useAuthStore } from '../store/useAuthStore';
import { FeedbackModal } from './settings/FeedbackModal';
import { styles } from './PinLockoutModalStyles';

interface Props {
  visible: boolean;
  lockSecondsRemaining: number;
}

export const PinLockoutModal: React.FC<Props> = ({
  visible,
  lockSecondsRemaining,
}) => {
  const strings = useStrings();
  const { user } = useAuthStore();
  const [showFeedback, setShowFeedback] = useState(false);

  if (!visible) {
    return null;
  }

  const prefilledMessage = strings.pinSupportMessage(user?.email ?? '');

  return (
    <>
      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.card}>
            <View style={styles.iconWrap}>
              <Ionicons name="lock-closed" size={36} color="#FF9A2E" />
            </View>
            <Text style={styles.title}>{strings.pinLockedTitle}</Text>
            <Text style={styles.body}>
              {strings.pinLockedBody(lockSecondsRemaining)}
            </Text>
            <TouchableOpacity
              style={styles.supportBtn}
              onPress={() => setShowFeedback(true)}
              accessibilityRole="button"
            >
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={16}
                color="#fff"
                style={{ marginRight: 6 }}
              />
              <Text style={styles.supportBtnText}>
                {strings.pinContactSupport}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <FeedbackModal
        visible={showFeedback}
        uid={user?.uid ?? ''}
        email={user?.email ?? ''}
        initialMessage={prefilledMessage}
        onClose={() => setShowFeedback(false)}
      />
    </>
  );
};
