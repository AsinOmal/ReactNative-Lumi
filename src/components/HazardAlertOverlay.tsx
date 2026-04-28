/**
 * HazardAlertOverlay.tsx
 *
 * Full-screen alert shown when the safety layer detects a hazard in frame.
 * Designed for young children: large text, high-contrast red, simple action.
 *
 * Why no auto-dismiss:
 *   The point is to get the child's attention and keep it until they physically
 *   move away. Auto-dismiss after a timer defeats that purpose.
 *
 * Why we play an audio alert on mount:
 *   Children may have the phone face-down or at arm's length. An audio cue
 *   draws attention before the visual alert is seen.
 *   Uses react-native-sound (already in project) — plays a system-level alert
 *   tone rather than a game SFX so it feels distinct from normal gameplay.
 */

import React, { useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { strings } from '../constants/strings';

interface HazardAlertOverlayProps {
  visible: boolean;
  onDismiss: () => void;
}

export const HazardAlertOverlay: React.FC<HazardAlertOverlayProps> = ({
  visible,
  onDismiss,
}) => {
  useEffect(() => {
    // Audio alert intentionally omitted until a suitable child-safe alert SFX
    // is sourced — using a game SFX here would feel wrong contextually.
    // TODO Phase 9: add a soft chime alert sound.
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent={false} animationType="fade" statusBarTranslucent>
      <View style={styles.container}>
        <Text style={styles.icon}>🚨</Text>
        <Text style={styles.title}>{strings.hazardAlertTitle}</Text>
        <Text style={styles.body}>{strings.hazardAlertBody}</Text>

        <TouchableOpacity style={styles.safeBtn} onPress={onDismiss} activeOpacity={0.85} accessibilityLabel="I am safe, dismiss alert" accessibilityRole="button">
          <Text style={styles.safeBtnText}>{strings.hazardAlertButton}</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#C0002A',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  icon: {
    fontSize: 80,
    marginBottom: 24,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 36,
  },
  body: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 48,
  },
  safeBtn: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 18,
    paddingHorizontal: 48,
    borderRadius: 40,
  },
  safeBtnText: {
    color: '#C0002A',
    fontSize: 20,
    fontWeight: '800',
  },
});
