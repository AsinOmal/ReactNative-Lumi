// 📖 What this does:
// Lets a parent update the child's first name (stored on /users/{uid}.childName).
// On save, writes to Firestore then syncs the Zustand auth store so the home
// greeting updates immediately without a full re-bootstrap.

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
import { useAuthStore } from '../../store/useAuthStore';
import { updateChildName, CHILD_NAME_MAX_LENGTH } from '../../services/userService';

interface Props {
  visible: boolean;
  uid: string;
  currentChildName: string | null;
  onClose: () => void;
}

export const EditChildNameModal: React.FC<Props> = ({
  visible,
  uid,
  currentChildName,
  onClose,
}) => {
  const insets = useSafeAreaInsets();
  const { childAge, childProfileSeen, setChildProfile } = useAuthStore();
  const [value, setValue] = useState(currentChildName ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setValue(currentChildName ?? '');
      setError(null);
    }
  }, [visible, currentChildName]);

  const handleClose = () => {
    setError(null);
    onClose();
  };

  const handleSave = async () => {
    const trimmed = value.trim();
    const finalName = trimmed || null;
    if (trimmed === (currentChildName ?? '').trim()) {
      handleClose();
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await updateChildName(uid, finalName);
      setChildProfile(finalName, childAge, childProfileSeen);
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
            <Text style={styles.title}>Child&apos;s Name</Text>
            <TouchableOpacity
              onPress={handleClose}
              accessibilityLabel="Close edit child name"
            >
              <Ionicons name="close" size={24} color={colors.textDark} />
            </TouchableOpacity>
          </View>

          <Text style={styles.hint}>
            Shown on the home screen greeting. Leave blank to remove.
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Enter child's name"
            placeholderTextColor={colors.textLight}
            value={value}
            onChangeText={setValue}
            maxLength={CHILD_NAME_MAX_LENGTH}
            autoCapitalize="words"
            autoCorrect={false}
          />

          {error && <Text style={styles.error}>{error}</Text>}

          <TouchableOpacity
            style={[styles.submit, saving && styles.submitDisabled]}
            onPress={handleSave}
            disabled={saving}
            accessibilityLabel="Save child name"
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
