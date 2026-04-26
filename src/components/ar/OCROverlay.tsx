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
import LottieView from 'lottie-react-native';

interface OCROverlayProps {
  detectedWord: string | null;
  onViewInAR: () => void;
}

/**
 * OCROverlay — camera viewfinder with animated scan line.
 *
 * Reticle dimensions (70% × 30%) match LumiVisionOCR.swift's crop zone exactly.
 * The scan line sweeps top-to-bottom to show active OCR processing.
 * Corners and line shift from purple → green when a word is locked in.
 */
export const OCROverlay: React.FC<OCROverlayProps> = ({ detectedWord, onViewInAR }) => {
  const { width, height } = useWindowDimensions();

  const RETICLE_W = width * 0.82;
  const RETICLE_H = height * 0.18;

  const pulseAnim    = useRef(new Animated.Value(1)).current;
  const scanLineAnim = useRef(new Animated.Value(0)).current;
  const chipAnim     = useRef(new Animated.Value(-60)).current;
  const lottieAnim   = useRef(new Animated.Value(1)).current;
  const prevWord     = useRef<string | null>(null);
  const lottieRef    = useRef<LottieView>(null);

  // Subtle scale pulse on the reticle border
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.008, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,     duration: 1200, useNativeDriver: true }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  // Scan line sweeps top → bottom of the reticle on a 2s loop
  useEffect(() => {
    const sweep = Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, { toValue: 1, duration: 1800, useNativeDriver: true }),
        Animated.timing(scanLineAnim, { toValue: 0, duration: 0,    useNativeDriver: true }),
      ]),
    );
    sweep.start();
    return () => sweep.stop();
  }, []);

  // Explicitly start Lottie — autoPlay alone can silently no-op on first mount in v5
  useEffect(() => { lottieRef.current?.play(); }, []);

  // Chip slides in from above; Lottie fades out on detection, back in when lost
  useEffect(() => {
    if (detectedWord && detectedWord !== prevWord.current) {
      prevWord.current = detectedWord;
      chipAnim.setValue(-60);
      Animated.parallel([
        Animated.spring(chipAnim,   { toValue: 0, useNativeDriver: true, tension: 80, friction: 9 }),
        Animated.timing(lottieAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
      ]).start();
    } else if (!detectedWord) {
      prevWord.current = null;
      chipAnim.setValue(-60);
      Animated.timing(lottieAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
      lottieRef.current?.play();
    }
  }, [detectedWord]);

  const scanLineY = scanLineAnim.interpolate({
    inputRange:  [0, 1],
    outputRange: [0, RETICLE_H - 2],
  });

  // Corners glow purple while scanning, green on detection
  const cornerColor = detectedWord ? 'rgba(74,222,128,0.95)' : 'rgba(138,92,246,0.95)';
  const lineColor   = detectedWord ? 'rgba(74,222,128,0.5)'  : 'rgba(138,92,246,0.45)';

  return (
    <View style={styles.overlay} pointerEvents="box-none">

      {/* Dark vignette outside the scan zone */}
      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        <View style={[styles.mask, { height: (height - RETICLE_H) / 2 }]} />
        <View style={{ flexDirection: 'row', height: RETICLE_H }}>
          <View style={[styles.mask, { flex: 1 }]} />
          <View style={{ width: RETICLE_W }} />
          <View style={[styles.mask, { flex: 1 }]} />
        </View>
        <View style={[styles.mask, { flex: 1 }]} />
      </View>

      {/* Reticle — corners + scan line */}
      <Animated.View
        style={[styles.reticle, { width: RETICLE_W, height: RETICLE_H, transform: [{ scale: pulseAnim }] }]}
        pointerEvents="none"
      >
        {/* Corner brackets */}
        <View style={[styles.corner, styles.cornerTL, { borderColor: cornerColor }]} />
        <View style={[styles.corner, styles.cornerTR, { borderColor: cornerColor }]} />
        <View style={[styles.corner, styles.cornerBL, { borderColor: cornerColor }]} />
        <View style={[styles.corner, styles.cornerBR, { borderColor: cornerColor }]} />

        {/* Sweeping scan line */}
        {!detectedWord && (
          <Animated.View
            style={[styles.scanLine, { backgroundColor: lineColor, transform: [{ translateY: scanLineY }] }]}
          />
        )}
      </Animated.View>

      {/* Hint text just below the reticle */}
      <Text style={[styles.reticleHint, { marginTop: RETICLE_H / 2 + 14 }]}>
        {detectedWord ? 'Word found!' : 'Hold a word inside the box'}
      </Text>

      {/* Scanning Lottie — sits above the reticle, fades out on word lock */}
      <Animated.View
        style={[styles.lottieWrapper, { top: height / 2 - RETICLE_H / 2 - 196, opacity: lottieAnim }]}
        pointerEvents="none"
      >
        <LottieView
          ref={lottieRef}
          source={require('../../assets/lottie/glass_scan.json')}
          autoPlay
          loop
          style={styles.lottie}
        />
      </Animated.View>

      {/* Detected word chip + AR button — anchored above the reticle so the user
          never has to move the phone to reach the button */}
      {detectedWord && (
        <Animated.View
          style={[
            styles.detectedRow,
            { top: height / 2 - RETICLE_H / 2 - 80, transform: [{ translateY: chipAnim }] },
          ]}
          pointerEvents="box-none"
        >
          <View style={styles.wordChip}>
            <Ionicons name="checkmark-circle" size={16} color="rgba(255,255,255,0.85)" />
            <Text style={styles.wordChipText}>
              {detectedWord.charAt(0).toUpperCase() + detectedWord.slice(1)}
            </Text>
          </View>
          <TouchableOpacity style={styles.arButton} onPress={onViewInAR} activeOpacity={0.85}>
            <Ionicons name="cube-outline" size={20} color="#fff" />
            <Text style={styles.arButtonText}>View in AR</Text>
            <Ionicons name="arrow-forward" size={17} color="#fff" />
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
};

const CORNER_SIZE      = 32;
const CORNER_THICKNESS = 4;

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mask: { backgroundColor: 'rgba(0,0,0,0.6)' },

  reticle: {
    position: 'absolute',
    borderRadius: 14,
    overflow: 'hidden',
  },

  corner: {
    position: 'absolute',
    width: CORNER_SIZE,
    height: CORNER_SIZE,
  },
  cornerTL: { top: 0, left: 0, borderTopWidth: CORNER_THICKNESS, borderLeftWidth: CORNER_THICKNESS, borderTopLeftRadius: 8 },
  cornerTR: { top: 0, right: 0, borderTopWidth: CORNER_THICKNESS, borderRightWidth: CORNER_THICKNESS, borderTopRightRadius: 8 },
  cornerBL: { bottom: 0, left: 0, borderBottomWidth: CORNER_THICKNESS, borderLeftWidth: CORNER_THICKNESS, borderBottomLeftRadius: 8 },
  cornerBR: { bottom: 0, right: 0, borderBottomWidth: CORNER_THICKNESS, borderRightWidth: CORNER_THICKNESS, borderBottomRightRadius: 8 },

  scanLine: {
    position: 'absolute',
    left: 0, right: 0,
    height: 2,
    borderRadius: 1,
  },

  reticleHint: {
    position: 'absolute',
    fontFamily: 'Fredoka-SemiBold',
    fontSize: 17,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    letterSpacing: 0.3,
  },

  detectedRow: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  lottieWrapper: {
    position: 'absolute',
    alignItems: 'center',
  },
  lottie: {
    width: 180,
    height: 180,
  },
  wordChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(74,222,128,0.25)',
    borderWidth: 1.5, borderColor: 'rgba(74,222,128,0.7)',
    borderRadius: 22,
    paddingHorizontal: 14, paddingVertical: 9,
  },
  wordChipText: {
    fontFamily: 'Fredoka-Bold',
    fontSize: 20,
    color: '#fff',
  },
  arButton: {
    flexDirection: 'row', alignItems: 'center', gap: 7,
    backgroundColor: '#5B2DC0',
    borderRadius: 26,
    paddingHorizontal: 18, paddingVertical: 12,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 14,
    elevation: 8,
  },
  arButtonText: {
    fontFamily: 'Fredoka-SemiBold',
    fontSize: 16,
    color: '#fff',
  },
});
