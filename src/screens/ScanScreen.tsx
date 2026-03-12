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
import { useNavigation, useFocusEffect, useIsFocused } from '@react-navigation/native';
import { ARWordScene } from '../components/ar/ARWordScene';
import { OCROverlay } from '../components/ar/OCROverlay';
import { SyllablePlayer } from '../components/ar/SyllablePlayer';
import { SpellCorrectionBadge } from '../components/ar/SpellCorrectionBadge';
import { matchWord, MatchResult, detectUnknownWord } from '../utils/wordMatcher';
import { recognizeTextInImage } from '../utils/visionOCR';
import { MODEL_REGISTRY, getModel } from '../utils/modelRegistry';
import { recordScan, removeScan, getProgress } from '../utils/achievementStore';
import { wishWord, isWished } from '../utils/wishlistStore';
import { Achievement } from '../utils/achievementRegistry';
import { AchievementToast } from '../components/AchievementToast';
import { WishConfirmModal } from '../components/WishConfirmModal';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { getRandomFact } from '../utils/wordFacts';



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
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [unknownWord, setUnknownWord] = useState<string | null>(null);
  const [showWishModal, setShowWishModal] = useState(false);
  const [sceneKey, setSceneKey] = useState(0);

  // Reset wish modal whenever a new unknown word appears
  useEffect(() => { setShowWishModal(false); }, [unknownWord]);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [isWordSaved, setIsWordSaved] = useState(false);
  const cardAnim = useRef(new Animated.Value(400)).current;
  // Achievement toast queue
  const [achievementQueue, setAchievementQueue] = useState<Achievement[]>([]);

  const isScanning = useRef(false);
  const scanTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [isAppActive, setIsAppActive] = useState(AppState.currentState === 'active');
  const [isScreenFocused, setIsScreenFocused] = useState(true);
  const isFocused = useIsFocused(); // True native navigation focus state
  
  // Debounce: pack word must appear in REQUIRED_CONSECUTIVE frames before triggering
  const lastCandidateRef = useRef<string | null>(null);
  const consecutiveCountRef = useRef(0);
  const firstCandidateResultRef = useRef<import('../utils/wordMatcher').MatchResult | null>(null);
  const REQUIRED_CONSECUTIVE = 3;

  // Debounce: unknown word chip requires the SAME word in 3 consecutive frames
  const lastUnknownCandidateRef = useRef<string | null>(null);
  const unknownConsecutiveRef = useRef(0);
  const REQUIRED_UNKNOWN_CONSECUTIVE = 3;

  // ── Stop camera & OCR when navigating away from this screen ───────────────
  useFocusEffect(
    useCallback(() => {
      setIsScreenFocused(true);
      return () => {
        // Screen is losing focus (navigating away) — stop OCR immediately
        setIsScreenFocused(false);
        if (scanTimerRef.current) {
          clearInterval(scanTimerRef.current);
          scanTimerRef.current = null;
        }
        isScanning.current = false;
      };
    }, []),
  );

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
    // Hard block if not the active screen
    if (!cameraRef.current || mode !== 'scan' || isScanning.current || !isAppActive || !isScreenFocused || !isFocused) return;
    
    isScanning.current = true;
    try {
      const snapshot = await cameraRef.current.takePhoto({ enableShutterSound: false });
      const text = await recognizeTextInImage(snapshot.path);
      const matched = matchWord(text, ALL_SUPPORTED_WORDS);

      // ── Consecutive frame debounce ────────────────────────────────────
      // A word must be detected in REQUIRED_CONSECUTIVE frames in a row
      // before we accept it. We fire with the FIRST frame's MatchResult so
      // that isCorrection:true is not lost if a later frame reads it exactly.
      if (matched?.word === lastCandidateRef.current) {
        consecutiveCountRef.current += 1;
      } else {
        lastCandidateRef.current = matched?.word ?? null;
        consecutiveCountRef.current = matched ? 1 : 0;
        firstCandidateResultRef.current = matched; // capture first result of streak
      }

      if (matched && consecutiveCountRef.current >= REQUIRED_CONSECUTIVE) {
        setMatchResult(firstCandidateResultRef.current ?? matched);
        setUnknownWord(null);
        lastUnknownCandidateRef.current = null;
        unknownConsecutiveRef.current = 0;
      } else if (!matched) {
        setMatchResult(null);

        // Unknown word debounce — same token must appear REQUIRED_UNKNOWN_CONSECUTIVE times
        const unknown = detectUnknownWord(text, ALL_SUPPORTED_WORDS);
        if (unknown && unknown === lastUnknownCandidateRef.current) {
          unknownConsecutiveRef.current += 1;
        } else {
          lastUnknownCandidateRef.current = unknown;
          unknownConsecutiveRef.current = unknown ? 1 : 0;
        }

        if (unknown && unknownConsecutiveRef.current >= REQUIRED_UNKNOWN_CONSECUTIVE) {
          setUnknownWord(unknown);
        } else if (!unknown) {
          setUnknownWord(null);
        }
        // else: still building up the streak — don't update chip yet
      }
    } catch {
      // Silently ignore — camera unavailable when backgrounded/locked
    } finally {
      isScanning.current = false;
    }
  }, [mode, isAppActive, isScreenFocused]);

  useEffect(() => {
    // Only set the interval if we are fully active and focused in scan mode
    if (mode === 'scan' && isAppActive && isScreenFocused && isFocused) {
      scanTimerRef.current = setInterval(runOCR, SCAN_INTERVAL_MS);
    } else {
      // Clear immediately if focus is lost
      if (scanTimerRef.current) {
        clearInterval(scanTimerRef.current);
        scanTimerRef.current = null;
      }
    }
    return () => {
      if (scanTimerRef.current) {
        clearInterval(scanTimerRef.current);
        scanTimerRef.current = null;
      }
    };
  }, [mode, isAppActive, isScreenFocused, isFocused, runOCR]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleViewInAR = useCallback(async (word?: string) => {
    const target = word ?? matchResult?.word ?? activeWord;
    setActiveWord(target);
    setSceneKey(k => k + 1);
    setModelLoaded(false);
    cardAnim.setValue(400);

    // Check if word is already saved
    const progress = await getProgress();
    setIsWordSaved(progress.scannedWords.includes(target));

    setMode('ar');
  }, [matchResult, activeWord]);

  const handleBackToScan = useCallback(() => {
    setMode('scan');
    setMatchResult(null);
    setModelLoaded(false);
    cardAnim.setValue(400);
  }, []);

  const handleSaveWord = useCallback(async () => {
    if (isWordSaved) {
      // Unsave logic: remove from storage and revert button state
      setIsWordSaved(false);
      await removeScan(activeWord);
      return;
    }
    
    // Save logic: Mark as saved immediately for UI responsiveness
    setIsWordSaved(true);

    const isCorrection = matchResult?.isCorrection ?? false;
    const newAchievements = await recordScan(activeWord, isCorrection);
    if (newAchievements.length > 0) {
      setAchievementQueue(prev => [...prev, ...newAchievements]);
    }
  }, [activeWord, matchResult, isWordSaved]);

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

  const fact = getRandomFact(activeWord);

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
          detectedWord={matchResult?.word ?? null}
          onViewInAR={() => handleViewInAR()}
        />

        {/* Unknown word chip */}
        {!matchResult && unknownWord && mode === 'scan' && (
          <View style={styles.unknownChip}>
            <Text style={styles.unknownChipText}>
              ❓ <Text style={styles.unknownWord}>
                {unknownWord.charAt(0).toUpperCase() + unknownWord.slice(1)}
              </Text>{' '}isn't in our collection yet
            </Text>
            <TouchableOpacity
              style={styles.wishBtn}
              activeOpacity={0.8}
              onPress={async () => {
                await wishWord(unknownWord);
                setShowWishModal(true);
              }}
            >
              <Text style={styles.wishBtnText}>⭐ Wish for it!</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Wish confirmation modal */}
        <WishConfirmModal
          word={unknownWord ?? ''}
          visible={showWishModal}
          onClose={() => setShowWishModal(false)}
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
            <Text style={styles.resultPack}>Fruits Pack</Text>
          </View>
        </View>
        {/* Pronunciation + syllable chips */}
        <SyllablePlayer entry={getModel(activeWord)} />
        {/* Spell correction badge — only shows on Levenshtein distance=2 matches */}
        {matchResult?.isCorrection && (
          <SpellCorrectionBadge
            scannedAs={matchResult.scannedAs}
            correct={matchResult.word}
          />
        )}
        <View style={styles.factBox}>
          <Text style={styles.factText}>{fact}</Text>
        </View>
        <View style={styles.cardActions}>
          <TouchableOpacity style={styles.dismissBtn} onPress={dismissCard}>
            <Ionicons name="close" size={20} color="#5B2DC0" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.saveBtn, isWordSaved && styles.saveBtnDisabled]}
            onPress={handleSaveWord}
            activeOpacity={0.8}
          >
            <Ionicons name="star" size={18} color={isWordSaved ? '#A78BFA' : '#fff'} />
            <Text style={[styles.saveBtnText, isWordSaved && styles.saveBtnTextDisabled]}>
              {isWordSaved ? 'Saved' : 'Save Word'}
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Achievement unlock toast */}
      <AchievementToast
        queue={achievementQueue}
        onDismissed={() =>
          setAchievementQueue(prev => prev.slice(1))
        }
      />
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#5B2DC0',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
  },
  saveBtnDisabled: {
    backgroundColor: 'rgba(91, 45, 192, 0.3)',
    borderColor: 'rgba(139, 92, 246, 0.4)',
    borderWidth: 1,
  },
  saveBtnText: {
    fontFamily: 'Fredoka-SemiBold',
    fontSize: 15,
    color: '#fff',
  },
  saveBtnTextDisabled: {
    color: '#A78BFA',
  },

  // ── Unknown word chip
  unknownChip: {
    position: 'absolute',
    bottom: 160,
    alignSelf: 'center',
    backgroundColor: 'rgba(20,10,50,0.88)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.4)',
    maxWidth: '90%',
  },
  unknownChipText: {
    fontFamily: 'Fredoka-Regular',
    fontSize: 14,
    color: '#C4B5FD',
    flexShrink: 1,
  },
  unknownWord: {
    fontFamily: 'Fredoka-Bold',
    color: '#FFFFFF',
  },
  wishBtn: {
    backgroundColor: '#5B2DC0',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  wishBtnDone: {
    backgroundColor: '#059669',
  },
  wishBtnText: {
    fontFamily: 'Fredoka-SemiBold',
    fontSize: 13,
    color: '#FFF',
  },
});
