import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../../constants/colors';
import {
  updateUsername,
  USERNAME_MAX_LENGTH,
} from '../../services/userService';

// 📖 What this does:
// Lets a signed-in user set the editable `username` on their /users/{uid} doc. Uses the same
// top-anchored sheet + KeyboardAvoidingView pattern as FeedbackModal so the input stays visible
// when the keyboard opens. Validation is intentionally minimal — trim + length cap; uniqueness
// is not enforced (decided in the multi-bug plan).

interface EditUsernameModalProps {
  visible: boolean;
  uid: string;
  currentUsername: string;
  onClose: () => void;
}

export const EditUsernameModal: React.FC<EditUsernameModalProps> = ({
  visible,
  uid,
  currentUsername,
  onClose,
}) => {
  const insets = useSafeAreaInsets();
  const [value, setValue] = useState(currentUsername);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setValue(currentUsername);
      setError(null);
    }
  }, [visible, currentUsername]);

  const handleClose = () => {
    setError(null);
    onClose();
  };

  const handleSave = async () => {
    const trimmed = value.trim();
    if (!trimmed) {
      setError('Username cannot be empty.');
      return;
    }
    if (trimmed === currentUsername.trim()) {
      handleClose();
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await updateUsername(uid, trimmed);
      handleClose();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'Could not save. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={[styles.sheet, { marginTop: insets.top + 24 }]}>
          <View style={styles.header}>
            <Text style={styles.title}>Edit Username</Text>
            <TouchableOpacity
              onPress={handleClose}
              accessibilityLabel="Close edit username"
            >
              <Ionicons name="close" size={24} color={colors.textDark} />
            </TouchableOpacity>
          </View>

          <Text style={styles.hint}>
            This is the name shown in your profile and to admins.
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Your username"
            placeholderTextColor={colors.textLight}
            value={value}
            onChangeText={setValue}
            maxLength={USERNAME_MAX_LENGTH}
            autoCapitalize="words"
            autoCorrect={false}
          />

          {error && <Text style={styles.error}>{error}</Text>}

          <TouchableOpacity
            style={[
              styles.submit,
              (!value.trim() || saving) && styles.submitDisabled,
            ]}
            onPress={handleSave}
            disabled={!value.trim() || saving}
            accessibilityLabel="Save username"
          >
            {saving ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.submitLabel}>Save</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-start',
  },
  sheet: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 24,
    gap: 14,
    marginHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: { fontFamily: 'Fredoka-Bold', fontSize: 22, color: colors.textDark },
  hint: { fontFamily: 'Fredoka-Regular', fontSize: 14, color: colors.textMid },
  input: {
    borderWidth: 1,
    borderColor: colors.primaryLight,
    borderRadius: 12,
    padding: 12,
    fontFamily: 'Fredoka-Regular',
    fontSize: 16,
    color: colors.textDark,
  },
  error: { fontFamily: 'Fredoka-Regular', fontSize: 13, color: '#DC2626' },
  submit: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  submitDisabled: { opacity: 0.5 },
  submitLabel: { fontFamily: 'Fredoka-Bold', fontSize: 16, color: '#FFF' },
});
