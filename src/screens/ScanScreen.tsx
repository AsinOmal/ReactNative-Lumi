import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
  StatusBar,
  AppState,
  AppStateStatus,
} from 'react-native';
import { ViroARSceneNavigator } from '@reactvision/react-viro';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import { useNavigation } from '@react-navigation/native';
import { ARWordScene } from '../components/ar/ARWordScene';
import { OCROverlay } from '../components/ar/OCROverlay';
import { matchWord } from '../utils/wordMatcher';
import { recognizeTextInImage } from '../utils/visionOCR';
import { MODEL_REGISTRY } from '../utils/modelRegistry';
import Ionicons from 'react-native-vector-icons/Ionicons';

// ── Constants ─────────────────────────────────────────────────────────────────

const WORD_FACTS: Record<string, string> = {
  apple:      'Apples float in water because they are 25% air! 🌊',
  banana:     'Bananas are technically berries, but strawberries are not! 🤯',
  cherry:     'It takes about 5 years for a cherry tree to produce fruit! 🌳',
  grape:      'Grapes can be green, red, black, yellow, or purple! 🎨',
  lemon:      'Lemons contain more sugar than strawberries! 🍬',
  mango:      'Mangoes belong to the same family as cashews and pistachios! 🥜',
  orange:     'Oranges were originally green before humans bred sweeter versions! 🌿',
  pineapple:  'A pineapple plant takes 2 years to grow just one pineapple! ⏳',
  strawberry: 'Strawberries have about 200 tiny seeds on the outside! 🔢',
  watermelon: "Watermelons are 92% water — that's how they got their name! 💧",
};

const ALL_SUPPORTED_WORDS = Object.keys(MODEL_REGISTRY);

const SCAN_INTERVAL_MS = 1000; // run OCR every 1 second

// ── Component ─────────────────────────────────────────────────────────────────

type Mode = 'scan' | 'ar';

export const ScanScreen = () => {
  const navigation = useNavigation();
  const device = useCameraDevice('back');
  const { hasPermission, requestPermission } = useCameraPermission();
  const cameraRef = useRef<Camera>(null);

  // ── State
  const [mode, setMode] = useState<Mode>('scan');
  const [activeWord, setActiveWord] = useState<string>('apple');
  const [detectedWord, setDetectedWord] = useState<string | null>(null);
  const [sceneKey, setSceneKey] = useState(0);
  const [modelLoaded, setModelLoaded] = useState(false);
  const cardAnim = useRef(new Animated.Value(400)).current;

  const isScanning = useRef(false);
  const scanTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [isAppActive, setIsAppActive] = useState(AppState.currentState === 'active');

  // ── App State (stop camera when locked / backgrounded) ────────────────────
  useEffect(() => {
    const sub = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      const active = nextState === 'active';
      setIsAppActive(active);
      if (!active) {
        // Clear OCR loop immediately when leaving foreground
        if (scanTimerRef.current) {
          clearInterval(scanTimerRef.current);
          scanTimerRef.current = null;
        }
        isScanning.current = false;
      }
    });
    return () => sub.remove();
  }, []);

  // ── Camera Permission ────────────────────────────────────────────────────

  useEffect(() => {
    if (!hasPermission) requestPermission();
  }, []);

  // ── Snapshot OCR Loop ─────────────────────────────────────────────────────
  // Every SCAN_INTERVAL_MS, take a snapshot and run Apple Vision OCR on it.
  // Runs only in Scan mode when a camera is available.

  const runOCR = useCallback(async () => {
    if (!cameraRef.current || mode !== 'scan' || isScanning.current || !isAppActive) return;
    isScanning.current = true;
    try {
      const snapshot = await cameraRef.current.takePhoto();
      const text = await recognizeTextInImage(snapshot.path);
      const matched = matchWord(text, ALL_SUPPORTED_WORDS);
      setDetectedWord(matched);
    } catch {
      // Silently ignore — camera unavailable when backgrounded/locked
    } finally {
      isScanning.current = false;
    }
  }, [mode, isAppActive]);

  useEffect(() => {
    if (mode === 'scan' && isAppActive) {
      scanTimerRef.current = setInterval(runOCR, SCAN_INTERVAL_MS);
    }
    return () => {
      if (scanTimerRef.current) clearInterval(scanTimerRef.current);
    };
  }, [mode, isAppActive, runOCR]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleViewInAR = useCallback((word?: string) => {
    const target = word ?? detectedWord ?? activeWord;
    setActiveWord(target);
    setSceneKey(k => k + 1);
    setModelLoaded(false);
    cardAnim.setValue(400);
    setMode('ar');
  }, [detectedWord, activeWord]);

  const handleBackToScan = useCallback(() => {
    setMode('scan');
    setDetectedWord(null);
    setModelLoaded(false);
    cardAnim.setValue(400);
  }, []);

  const handleModelLoaded = useCallback(() => {
    setModelLoaded(true);
    Animated.spring(cardAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 60,
      friction: 9,
    }).start();
  }, []);

  const handleWordChipPress = useCallback((word: string) => {
    setActiveWord(word);
    handleViewInAR(word);
  }, [handleViewInAR]);

  const handleReset = useCallback(() => {
    setSceneKey(k => k + 1);
    setModelLoaded(false);
    cardAnim.setValue(400);
  }, []);

  const dismissCard = useCallback(() => {
    Animated.timing(cardAnim, {
      toValue: 400,
      duration: 250,
      useNativeDriver: true,
    }).start(() => setModelLoaded(false));
  }, []);

  const fact = WORD_FACTS[activeWord] ?? 'This is a fun word to discover! ✨';

  // ── SCAN MODE ─────────────────────────────────────────────────────────────

  if (mode === 'scan') {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />

        {/* Camera feed */}
        {device && hasPermission ? (
          <Camera
            ref={cameraRef}
            style={StyleSheet.absoluteFill}
            device={device}
            isActive={isAppActive}
            photo
          />
        ) : (
          <View style={[StyleSheet.absoluteFill, styles.noCamera]}>
            <Ionicons name="camera-off-outline" size={42} color="rgba(255,255,255,0.4)" />
            <Text style={styles.noCameraText}>
              {hasPermission ? 'Camera unavailable' : 'Camera permission required'}
            </Text>
          </View>
        )}

        {/* OCR scanning reticle + detected word chip */}
        <OCROverlay
          detectedWord={detectedWord}
          onViewInAR={() => handleViewInAR()}
        />

        {/* Top HUD */}
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </TouchableOpacity>

        {/* Scanning status indicator */}
        <View style={styles.statusBar}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>Scanning for words…</Text>
        </View>

        {/* Word chip row — manual override */}
        <View style={styles.wordSelectorWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.wordSelectorContent}
          >
            {ALL_SUPPORTED_WORDS.map((word) => (
              <TouchableOpacity
                key={word}
                style={[styles.wordChip, activeWord === word && styles.wordChipActive]}
                onPress={() => handleWordChipPress(word)}
                activeOpacity={0.8}
              >
                <Text style={[styles.wordChipText, activeWord === word && styles.wordChipTextActive]}>
                  {word}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    );
  }

  // ── AR MODE ───────────────────────────────────────────────────────────────

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <ViroARSceneNavigator
        key={sceneKey}
        initialScene={{ scene: ARWordScene as any }}
        viroAppProps={{ word: activeWord, onModelLoaded: handleModelLoaded }}
        style={styles.arView}
      />

      {/* Top HUD */}
      <TouchableOpacity style={styles.backButton} onPress={handleBackToScan}>
        <Ionicons name="chevron-back" size={22} color="#fff" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
        <Ionicons name="refresh" size={20} color="#fff" />
      </TouchableOpacity>

      {/* Word selector */}
      <View style={styles.wordSelectorWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.wordSelectorContent}
        >
          {ALL_SUPPORTED_WORDS.map((word) => (
            <TouchableOpacity
              key={word}
              style={[styles.wordChip, activeWord === word && styles.wordChipActive]}
              onPress={() => handleWordChipPress(word)}
              activeOpacity={0.8}
            >
              <Text style={[styles.wordChipText, activeWord === word && styles.wordChipTextActive]}>
                {word}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Result card */}
      <Animated.View style={[styles.resultCard, { transform: [{ translateY: cardAnim }] }]}>
        <View style={styles.resultCardHandle} />
        <View style={styles.resultCardRow}>
          <View style={styles.resultWordBlock}>
            <Text style={styles.resultWord}>
              {activeWord.charAt(0).toUpperCase() + activeWord.slice(1)}
            </Text>
            <Text style={styles.resultPack}>Fruits Pack 🍎</Text>
          </View>
          <TouchableOpacity style={styles.pronunciationBtn}>
            <Ionicons name="volume-high" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
        <View style={styles.factBox}>
          <Text style={styles.factEmoji}>💡</Text>
          <Text style={styles.factText}>{fact}</Text>
        </View>
        <View style={styles.cardActions}>
          <TouchableOpacity style={styles.dismissBtn} onPress={dismissCard}>
            <Ionicons name="close" size={20} color="#5B2DC0" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveBtn}>
            <Ionicons name="star" size={18} color="#fff" />
            <Text style={styles.saveBtnText}>Save Word</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  arView: { flex: 1 },

  noCamera: { justifyContent: 'center', alignItems: 'center', gap: 12, backgroundColor: '#0d0d0d' },
  noCameraText: { fontFamily: 'Fredoka-Regular', fontSize: 16, color: 'rgba(255,255,255,0.4)', textAlign: 'center', paddingHorizontal: 32 },

  backButton: {
    position: 'absolute', top: 56, left: 16,
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center', justifyContent: 'center',
  },
  resetButton: {
    position: 'absolute', top: 56, right: 16,
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(91,45,192,0.75)',
    alignItems: 'center', justifyContent: 'center',
  },
  packBadge: {
    position: 'absolute', top: 56,
    alignSelf: 'center', left: '50%',
    transform: [{ translateX: -70 }],
    backgroundColor: 'rgba(91,45,192,0.85)',
    borderRadius: 20, paddingHorizontal: 16, paddingVertical: 7,
  },
  packBadgeText: { fontFamily: 'Fredoka-SemiBold', fontSize: 14, color: '#fff' },

  statusBar: {
    position: 'absolute', top: 104,
    alignSelf: 'center',
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 12, paddingHorizontal: 12, paddingVertical: 4,
  },
  statusDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#4ADE80' },
  statusText: { fontFamily: 'Fredoka-Regular', fontSize: 12, color: 'rgba(255,255,255,0.8)' },

  wordSelectorWrapper: { position: 'absolute', top: 126, left: 0, right: 0 },
  wordSelectorContent: { paddingHorizontal: 16, gap: 8 },
  wordChip: {
    backgroundColor: 'rgba(0,0,0,0.45)', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 7,
    borderWidth: 1.5, borderColor: 'transparent',
  },
  wordChipActive: { backgroundColor: '#5B2DC0', borderColor: '#A78BFA' },
  wordChipText: {
    fontFamily: 'Fredoka-SemiBold', fontSize: 14,
    color: 'rgba(255,255,255,0.7)', textTransform: 'capitalize',
  },
  wordChipTextActive: { color: '#fff' },

  resultCard: {
    position: 'absolute', bottom: 24, left: 16, right: 16,
    backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20,
    shadowColor: '#5B2DC0', shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15, shadowRadius: 20, elevation: 12,
  },
  resultCardHandle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: '#E0D7F5', alignSelf: 'center', marginBottom: 16,
  },
  resultCardRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 12,
  },
  resultWordBlock: { flex: 1 },
  resultWord: { fontFamily: 'Fredoka-Bold', fontSize: 28, color: '#1A1050' },
  resultPack: { fontFamily: 'Fredoka-Regular', fontSize: 13, color: '#9B87CC', marginTop: 1 },
  pronunciationBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#5B2DC0', alignItems: 'center', justifyContent: 'center', marginLeft: 12,
  },
  factBox: {
    flexDirection: 'row', backgroundColor: '#F0EBFF',
    borderRadius: 14, padding: 12, gap: 8, marginBottom: 16, alignItems: 'flex-start',
  },
  factEmoji: { fontSize: 16, marginTop: 1 },
  factText: { fontFamily: 'Fredoka-Regular', fontSize: 14, color: '#4B3D7A', flex: 1, lineHeight: 20 },
  cardActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dismissBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#F0EBFF', alignItems: 'center', justifyContent: 'center',
  },
  saveBtn: {
    flexDirection: 'row', backgroundColor: '#5B2DC0',
    borderRadius: 24, paddingHorizontal: 20, paddingVertical: 10, alignItems: 'center', gap: 6,
  },
  saveBtnText: { fontFamily: 'Fredoka-SemiBold', fontSize: 15, color: '#fff' },
});
