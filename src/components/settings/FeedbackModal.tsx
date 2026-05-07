import React, { useState, useRef, useEffect } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getApp } from '@react-native-firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from '@react-native-firebase/firestore';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../../constants/colors';
import { config } from '../../constants/config';

interface FeedbackModalProps {
  visible: boolean;
  uid: string;
  email: string;
  onClose: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ visible, uid, email, onClose }) => {
  const insets = useSafeAreaInsets();
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const autoCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (autoCloseTimerRef.current) clearTimeout(autoCloseTimerRef.current);
    };
  }, []);

  const handleClose = () => {
    if (autoCloseTimerRef.current) {
      clearTimeout(autoCloseTimerRef.current);
      autoCloseTimerRef.current = null;
    }
    setSent(false);
    setMessage('');
    onClose();
  };

  const handleSubmit = async () => {
    if (!message.trim()) return;
    setSending(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await addDoc(collection(getFirestore(getApp()), 'feedback') as any, {
        uid, email,
        message: message.trim(),
        appVersion: config.APP_VERSION,
        submittedAt: serverTimestamp(),
        isRead: false,
      });
      setSent(true);
      setMessage('');
      autoCloseTimerRef.current = setTimeout(handleClose, 1500);
    } catch (e) {
      console.error('[FeedbackModal] submit:', e);
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={[styles.sheet, { marginTop: insets.top + 24 }]}>
          <View style={styles.header}>
            <Text style={styles.title}>Send Feedback</Text>
            <TouchableOpacity onPress={handleClose} accessibilityLabel="Close feedback">
              <Ionicons name="close" size={24} color={colors.textDark} />
            </TouchableOpacity>
          </View>

          {sent ? (
            <Text style={styles.thanks}>Thanks for your feedback!</Text>
          ) : (
            <>
              <TextInput
                style={styles.input}
                multiline
                numberOfLines={5}
                placeholder="Share a suggestion or report an issue…"
                placeholderTextColor={colors.textLight}
                value={message}
                onChangeText={setMessage}
                textAlignVertical="top"
              />
              <TouchableOpacity
                style={[styles.submit, (!message.trim() || sending) && styles.submitDisabled]}
                onPress={handleSubmit}
                disabled={!message.trim() || sending}
                accessibilityLabel="Submit feedback"
              >
                {sending
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Text style={styles.submitLabel}>Submit</Text>}
              </TouchableOpacity>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay:       { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-start' },
  sheet:         { backgroundColor: '#FFF', borderRadius: 24, padding: 24, gap: 16, marginHorizontal: 16 },
  header:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title:         { fontFamily: 'Fredoka-Bold', fontSize: 22, color: colors.textDark },
  input:         { borderWidth: 1, borderColor: colors.primaryLight, borderRadius: 12, padding: 12, fontFamily: 'Fredoka-Regular', fontSize: 15, color: colors.textDark, minHeight: 120 },
  submit:        { backgroundColor: colors.primary, borderRadius: 12, padding: 14, alignItems: 'center' },
  submitDisabled:{ opacity: 0.5 },
  submitLabel:   { fontFamily: 'Fredoka-Bold', fontSize: 16, color: '#FFF' },
  thanks:        { fontFamily: 'Fredoka-SemiBold', fontSize: 17, color: colors.primary, textAlign: 'center', paddingVertical: 32 },
});
