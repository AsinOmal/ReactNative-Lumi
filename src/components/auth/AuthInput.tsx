/**
 * AuthInput.tsx
 *
 * Cream-card-friendly text input used across Login / Register / Forgot.
 * Left icon container, optional right icon (e.g. password-visibility toggle),
 * built-in error state. Centralised here so a tweak to any auth field
 * propagates without per-screen edits.
 */

import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  TextInputProps,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../../constants/colors';

interface Props extends Omit<TextInputProps, 'style'> {
  iconName: string;
  isPassword?: boolean;
  error?: boolean;
  containerStyle?: ViewStyle;
}

export const AuthInput: React.FC<Props> = ({
  iconName,
  isPassword,
  error,
  containerStyle,
  secureTextEntry,
  ...rest
}) => {
  const [hidden, setHidden] = useState(true);
  const showRightIcon = isPassword;
  const effectiveSecure = isPassword ? hidden : !!secureTextEntry;

  return (
    <View
      style={[styles.wrap, error ? styles.wrapError : null, containerStyle]}
    >
      <View style={styles.iconBox}>
        <Ionicons name={iconName} size={18} color={colors.primary} />
      </View>
      <TextInput
        style={styles.input}
        placeholderTextColor="#A78D6E"
        secureTextEntry={effectiveSecure}
        {...rest}
      />
      {showRightIcon && (
        <TouchableOpacity
          style={styles.eyeBox}
          onPress={() => setHidden((h) => !h)}
          accessibilityRole="button"
          accessibilityLabel={hidden ? 'Show password' : 'Hide password'}
          hitSlop={8}
        >
          <Ionicons
            name={hidden ? 'eye-outline' : 'eye-off-outline'}
            size={18}
            color="#A78D6E"
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFDF7',
    borderRadius: 20,
    paddingHorizontal: 6,
    borderWidth: 1.5,
    borderColor: '#EFE2C9',
    shadowColor: '#3D2008',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
    minHeight: 54,
  },
  wrapError: { borderColor: colors.dangerDark },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#FFF3DE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontFamily: 'Fredoka-Medium',
    fontSize: 15.5,
    color: colors.textDark,
    paddingVertical: 12,
    paddingRight: 8,
  },
  eyeBox: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
});
