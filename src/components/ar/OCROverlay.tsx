import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface OCROverlayProps {
  detectedWord: string | null;
  onViewInAR: () => void;
}

/**
 * OCROverlay — renders on top of the camera view during Scan Mode.
 *
 * The reticle box dimensions (70% × 30% of screen) deliberately match
 * the center-crop zone in LumiVisionOCR.swift so what's inside the box
 * is exactly what the OCR engine reads — nothing outside is processed.
 */
export const OCROverlay: React.FC<OCROverlayProps> = ({ detectedWord, onViewInAR }) => {
  const { width, height } = useWindowDimensions();

  // Match the Swift crop: 70% width × 30% height of the captured frame.
  const RETICLE_W = width * 0.70;
  const RETICLE_H = height * 0.30;

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const chipAnim = useRef(new Animated.Value(60)).current;
  const prevWord = useRef<string | null>(null);

  // Subtle pulse on the reticle border
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.012, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  // Slide in chip when a new word is detected
  useEffect(() => {
    if (detectedWord && detectedWord !== prevWord.current) {
      prevWord.current = detectedWord;
      chipAnim.setValue(60);
      Animated.spring(chipAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 80,
        friction: 9,
      }).start();
    } else if (!detectedWord) {
      prevWord.current = null;
      chipAnim.setValue(60);
    }
  }, [detectedWord]);

  return (
    <View style={styles.overlay} pointerEvents="box-none">

      {/* Dark vignette outside the scan zone */}
      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        {/* Top mask */}
        <View style={[styles.mask, { height: (height - RETICLE_H) / 2 }]} />
        {/* Middle row: left mask | scan zone | right mask */}
        <View style={{ flexDirection: 'row', height: RETICLE_H }}>
          <View style={[styles.mask, { flex: 1 }]} />
          {/* The transparent window — exactly the scan zone */}
          <View style={{ width: RETICLE_W }} />
          <View style={[styles.mask, { flex: 1 }]} />
        </View>
        {/* Bottom mask */}
        <View style={[styles.mask, { flex: 1 }]} />
      </View>

      {/* Reticle border (corner brackets) centered on screen */}
      <Animated.View
        style={[
          styles.reticle,
          {
            width: RETICLE_W,
            height: RETICLE_H,
            transform: [{ scale: pulseAnim }],
          },
        ]}
        pointerEvents="none"
      >
        <View style={[styles.corner, styles.cornerTL]} />
        <View style={[styles.corner, styles.cornerTR]} />
        <View style={[styles.corner, styles.cornerBL]} />
        <View style={[styles.corner, styles.cornerBR]} />
      </Animated.View>

      {/* Hint text just below the reticle */}
      <Text style={[styles.reticleHint, { marginTop: RETICLE_H / 2 + 16 }]}>
        {detectedWord ? '✓ Word found!' : 'Point the word inside the box'}
      </Text>

      {/* Detected word chip + AR button */}
      {detectedWord && (
        <Animated.View
          style={[styles.detectedRow, { transform: [{ translateY: chipAnim }] }]}
          pointerEvents="box-none"
        >
          <View style={styles.wordChip}>
            <Text style={styles.wordChipText}>
              {detectedWord.charAt(0).toUpperCase() + detectedWord.slice(1)}
            </Text>
          </View>
          <TouchableOpacity style={styles.arButton} onPress={onViewInAR} activeOpacity={0.85}>
            <Ionicons name="cube-outline" size={18} color="#fff" />
            <Text style={styles.arButtonText}>View in AR</Text>
            <Ionicons name="arrow-forward" size={16} color="#fff" />
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
};

const CORNER_SIZE = 24;
const CORNER_THICKNESS = 3;

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Semi-transparent mask for areas outside scan zone
  mask: {
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  // Reticle border box
  reticle: {
    position: 'absolute',
    borderRadius: 12,
  },
  corner: {
    position: 'absolute',
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderColor: 'rgba(138, 92, 246, 0.95)',
  },
  cornerTL: { top: 0, left: 0, borderTopWidth: CORNER_THICKNESS, borderLeftWidth: CORNER_THICKNESS, borderTopLeftRadius: 6 },
  cornerTR: { top: 0, right: 0, borderTopWidth: CORNER_THICKNESS, borderRightWidth: CORNER_THICKNESS, borderTopRightRadius: 6 },
  cornerBL: { bottom: 0, left: 0, borderBottomWidth: CORNER_THICKNESS, borderLeftWidth: CORNER_THICKNESS, borderBottomLeftRadius: 6 },
  cornerBR: { bottom: 0, right: 0, borderBottomWidth: CORNER_THICKNESS, borderRightWidth: CORNER_THICKNESS, borderBottomRightRadius: 6 },

  reticleHint: {
    position: 'absolute',
    fontFamily: 'Fredoka-Regular',
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },

  // Detected word chip + AR button row
  detectedRow: {
    position: 'absolute',
    bottom: 130,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  wordChip: {
    backgroundColor: 'rgba(91, 45, 192, 0.9)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  wordChipText: {
    fontFamily: 'Fredoka-Bold',
    fontSize: 18,
    color: '#fff',
  },
  arButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#5B2DC0',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 12,
    elevation: 8,
  },
  arButtonText: {
    fontFamily: 'Fredoka-SemiBold',
    fontSize: 15,
    color: '#fff',
  },
});
