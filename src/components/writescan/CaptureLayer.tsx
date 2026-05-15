// 📖 Single-shot OCR capture for Write & Scan.
// Unlike Scan Mode (continuous interval loop), this layer mounts the
// camera once, shows a paper-shaped reticle, and only fires OCR on a
// manual button tap. Keeps capture intentional — no accidental scans
// while the kid is positioning their paper.

import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
} from 'react-native-vision-camera';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { recognizeTextInImage } from '../../utils/visionOCR';
import { styles } from '../../screens/WriteAndScanScreenStyles';

interface Props {
  targetWord: string;
  onCaptured: (ocrText: string | null) => void;
  onCancel: () => void;
}

export const CaptureLayer = ({ targetWord, onCaptured, onCancel }: Props) => {
  const device = useCameraDevice('back');
  const { hasPermission, requestPermission } = useCameraPermission();
  const cameraRef = useRef<Camera>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!hasPermission) requestPermission();
  }, [hasPermission, requestPermission]);

  const handleCapture = async () => {
    if (!cameraRef.current || busy) return;
    setBusy(true);
    try {
      const snap = await cameraRef.current.takePhoto({ enableShutterSound: false });
      const text = await recognizeTextInImage(snap.path);
      onCaptured(text || null);
    } catch (e) {
      console.error('[CaptureLayer] capture failed:', e);
      onCaptured(null);
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={StyleSheet.absoluteFill}>
      {device && hasPermission ? (
        <Camera
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          device={device}
          isActive
          photo
        />
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.capNoCam]}>
          <Ionicons name="camera-off-outline" size={42} color="rgba(255,255,255,0.5)" />
          <Text style={styles.capNoCamText}>Camera permission needed</Text>
        </View>
      )}

      <View style={styles.capDim} pointerEvents="none" />

      <TouchableOpacity
        style={styles.closeBtnDark}
        onPress={onCancel}
        accessibilityLabel="Cancel scan"
        accessibilityRole="button"
      >
        <Ionicons name="chevron-back" size={22} color="#FFF" />
      </TouchableOpacity>

      <View style={styles.capPrompt} pointerEvents="none">
        <Text style={styles.capPromptLabel}>POINT AT YOUR PAPER</Text>
        <Text style={styles.capPromptWord}>{targetWord.toUpperCase()}</Text>
      </View>

      <View style={styles.capReticle} pointerEvents="none" />

      <TouchableOpacity
        style={[styles.capBtn, busy && styles.capBtnBusy]}
        onPress={handleCapture}
        disabled={busy}
        accessibilityLabel="Capture your handwriting"
        accessibilityRole="button"
      >
        {busy ? (
          <ActivityIndicator color="#FFF" size="small" />
        ) : (
          <Ionicons name="camera" size={32} color="#FFF" />
        )}
      </TouchableOpacity>
      <Text style={styles.capHint}>Tap to scan your answer</Text>
    </View>
  );
};
