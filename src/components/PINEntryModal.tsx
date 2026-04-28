/**
 * PINEntryModal.tsx
 *
 * 4-digit PIN pad modal for parent authentication and PIN setup.
 *
 * Mode 'set': shown when no PIN exists yet. Parent enters a PIN to register it.
 * Mode 'verify': shown when a PIN is already set. Parent must match it to unlock.
 *
 * Why we don't show the PIN as text:
 *   Dots only — prevents shoulder-surfing by children watching the parent unlock.
 *   The PIN hash lives in Firestore; this component never sees the raw stored hash.
 */

import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';
import { strings } from '../constants/strings';
import { config } from '../constants/config';
import { styles } from './PINEntryModalStyles';

interface PINEntryModalProps {
  visible: boolean;
  mode: 'set' | 'verify';
  onSubmit: (pin: string) => void;
  onCancel: () => void;
  hasError?: boolean;
}

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'];

export const PINEntryModal: React.FC<PINEntryModalProps> = ({
  visible, mode, onSubmit, onCancel, hasError = false,
}) => {
  const [pin, setPin] = useState('');

  const handleKey = (key: string) => {
    if (key === '⌫') {
      setPin(p => p.slice(0, -1));
      return;
    }
    if (key === '') return;
    const next = pin + key;
    if (next.length > config.PARENT_PIN_LENGTH) return;
    setPin(next);
    if (next.length === config.PARENT_PIN_LENGTH) {
      onSubmit(next);
      setPin('');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>
            {mode === 'set' ? strings.pinSetTitle : strings.pinVerifyTitle}
          </Text>
          <Text style={styles.subtitle}>
            {mode === 'set' ? strings.pinSetSubtitle : strings.pinVerifySubtitle}
          </Text>

          {/* Dot indicators */}
          <View style={styles.dots}>
            {Array.from({ length: config.PARENT_PIN_LENGTH }).map((_, i) => (
              <View
                key={i}
                style={[styles.dot, i < pin.length && styles.dotFilled, hasError && styles.dotError]}
              />
            ))}
          </View>

          {hasError && <Text style={styles.error}>{strings.pinIncorrect}</Text>}

          {/* Numpad */}
          <View style={styles.grid}>
            {KEYS.map((key, idx) => (
              <TouchableOpacity
                key={idx}
                style={[styles.key, key === '' && styles.keyEmpty]}
                onPress={() => handleKey(key)}
                disabled={key === ''}
                accessibilityLabel={key === '⌫' ? 'Backspace' : key === '' ? undefined : key}
                accessibilityRole="button"
              >
                <Text style={styles.keyText}>{key}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity onPress={onCancel} style={styles.cancelBtn} accessibilityLabel="Cancel PIN entry" accessibilityRole="button">
            <Text style={styles.cancelText}>{strings.cancel}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
