import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface OCROverlayProps {
  detectedWord: string | null;
  onViewInAR: () => void;
}

/**
 * OCROverlay — renders on top of the camera view during Scan Mode.
 * Shows a scanning reticle and pulses when a word is matched.
 */
export const OCROverlay: React.FC<OCROverlayProps> = ({ detectedWord, onViewInAR }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const chipAnim = useRef(new Animated.Value(0)).current;
  const prevWord = useRef<string | null>(null);

  // Pulse the reticle continuously
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
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

      {/* Scanning reticle */}
      <View style={styles.reticleContainer}>
        <Animated.View style={[styles.reticleOuter, { transform: [{ scale: pulseAnim }] }]}>
          {/* Corner brackets */}
          <View style={[styles.corner, styles.cornerTL]} />
          <View style={[styles.corner, styles.cornerTR]} />
          <View style={[styles.corner, styles.cornerBL]} />
          <View style={[styles.corner, styles.cornerBR]} />
        </Animated.View>
        <Text style={styles.reticleHint}>
          {detectedWord ? '✓ Word found!' : 'Point at a fruit word…'}
        </Text>
      </View>

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

const CORNER_SIZE = 22;
const CORNER_THICKNESS = 3;

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Reticle
  reticleContainer: {
    alignItems: 'center',
    gap: 16,
  },
  reticleOuter: {
    width: 200,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderColor: 'rgba(138, 92, 246, 0.9)',
  },
  cornerTL: {
    top: 0, left: 0,
    borderTopWidth: CORNER_THICKNESS,
    borderLeftWidth: CORNER_THICKNESS,
    borderTopLeftRadius: 4,
  },
  cornerTR: {
    top: 0, right: 0,
    borderTopWidth: CORNER_THICKNESS,
    borderRightWidth: CORNER_THICKNESS,
    borderTopRightRadius: 4,
  },
  cornerBL: {
    bottom: 0, left: 0,
    borderBottomWidth: CORNER_THICKNESS,
    borderLeftWidth: CORNER_THICKNESS,
    borderBottomLeftRadius: 4,
  },
  cornerBR: {
    bottom: 0, right: 0,
    borderBottomWidth: CORNER_THICKNESS,
    borderRightWidth: CORNER_THICKNESS,
    borderBottomRightRadius: 4,
  },
  reticleHint: {
    fontFamily: 'Fredoka-Regular',
    fontSize: 14,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
  },

  // Detected word row
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
