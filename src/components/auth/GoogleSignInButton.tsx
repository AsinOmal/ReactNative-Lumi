/**
 * GoogleSignInButton.tsx
 *
 * Drop-in Google CTA used by Login + Register. Disabled state matches the
 * primary button so the form feels consistent when any auth request is
 * in flight, regardless of which provider the user picked.
 */

import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { playUI } from '../../utils/uiSound';
import { useStrings } from '../../hooks/useStrings';
import { styles } from '../../screens/LoginScreenStyles';

interface Props {
  onPress: () => void;
  loading: boolean;
  disabled?: boolean;
}

export const GoogleSignInButton: React.FC<Props> = ({
  onPress,
  loading,
  disabled,
}) => {
  const strings = useStrings();
  return (
    <TouchableOpacity
      style={[
        styles.googleBtn,
        (disabled || loading) && styles.primaryBtnDisabled,
      ]}
      onPress={() => {
        playUI('tap');
        onPress();
      }}
      disabled={disabled || loading}
      activeOpacity={0.85}
    >
      {loading ? (
        <ActivityIndicator color="#222" />
      ) : (
        <>
          <Ionicons name="logo-google" size={20} color="#222" />
          <Text style={styles.googleBtnText}>
            {strings.AUTH_CONTINUE_GOOGLE}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};
