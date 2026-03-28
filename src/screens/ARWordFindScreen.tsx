/**
 * ARWordFindScreen.tsx
 *
 * AR Word Find Game with:
 *  - Loading screen that tracks each model's onLoadEnd
 *  - 60-second countdown timer (starts only after all assets are ready)
 *  - Click detection via ViroNode onClick (safe: ViroNode.js patched in node_modules
 *    to strip event handler props from {…this.props} before reaching native,
 *    preventing the 'setOnClick: unrecognized selector' ObjC crash)
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Animated,
  Modal,
  Alert,
} from 'react-native';
import {
  ViroARScene,
  ViroARSceneNavigator,
  ViroAmbientLight,
  ViroDirectionalLight,
  Viro3DObject,
  ViroNode,
  ViroText,
} from '@reactvision/react-viro';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { MODEL_REGISTRY } from '../utils/modelRegistry';
import { loadGameSounds, playSound, releaseGameSounds } from '../utils/gameSound';


const TOTAL_MODELS = Object.keys(MODEL_REGISTRY).length;
const GAME_SECONDS = 60;

// ── Scattered 3D positions ────────────────────────────────────────────────────
const POSITIONS: [number, number, number][] = [
  [-2.2,  0.6, -1.6],
  [-1.8, -0.5, -2.2],
  [-0.8,  0.4, -1.2],
  [ 0.0,  0.8, -2.0],
  [-0.4, -0.5, -1.7],
  [ 0.7,  0.5, -1.3],
  [ 1.3, -0.4, -2.3],
  [ 1.9,  0.3, -1.5],
  [ 2.4, -0.5, -1.9],
  [ 0.4,  0.1, -2.6],
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function fmt(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

// ── AR Scene ──────────────────────────────────────────────────────────────────
const WordFindScene = (props: any) => {
  const {
    targetWord, foundWords, onCorrect, onWrong, onModelLoaded, randomizedPositions
  }: {
    targetWord: string;
    foundWords: string[];
    onCorrect: (w: string) => void;
    onWrong:   (w: string) => void;
    onModelLoaded: (w: string) => void;
    randomizedPositions: [number, number, number][];
  } = props.sceneNavigator.viroAppProps;

  const entries = Object.entries(MODEL_REGISTRY);

  return (
    <ViroARScene>
      <ViroAmbientLight color="#ffffff" intensity={700} />
      <ViroDirectionalLight color="#ffffff" direction={[0, -1, -0.2]} intensity={700} castsShadow={false} />
      <ViroDirectionalLight color="#fff5e0" direction={[1, -0.5, -1]} intensity={400} castsShadow={false} />

      {entries.map(([word, model], idx) => {
        const isFound = foundWords.includes(word);
        const isTarget = word === targetWord;
        const pos = randomizedPositions[idx] ?? [0, 0, -1.5];

        return (
          <ViroNode
            key={word}
            position={pos}
            animation={{ name: 'rotate', run: !isFound, loop: true }}
            onClickState={(state: number) => {
              if (state !== 1) return; // 1 = CLICKED
              if (isFound || !targetWord) return;
              if (word === targetWord) onCorrect(word);
              else onWrong(word);
            }}
          >
            <Viro3DObject
              source={model.source}
              scale={model.scale}
              type="GLB"
              opacity={isFound ? 0.22 : 1}
              onLoadEnd={() => onModelLoaded(word)}
            />
            <ViroText
              text={isFound ? '✓' : word.toUpperCase()}
              position={[0, -0.13, 0]}
              scale={[0.09, 0.09, 0.09]}
              style={{
                fontFamily: 'Arial', fontSize: 20,
                color: isFound ? '#6EE7B7' : isTarget ? '#FDE68A' : '#FFFFFF',
                textAlign: 'center',
              } as any}
            />
          </ViroNode>
        );
      })}
    </ViroARScene>
  );
};

// ── Main Screen ───────────────────────────────────────────────────────────────
export const ARWordFindScreen = () => {
  const navigation = useNavigation();
  const allWords = Object.keys(MODEL_REGISTRY);

  // Initialize random positions for this session
  const [randomizedPositions] = useState(() => shuffle(POSITIONS));

  // Safe back navigation: hide Viro first so its native teardown
  // completes before React Navigation's transition starts.
  const safeGoBack = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    releaseGameSounds();
    setIsLeaving(true);                       // unmounts ViroARSceneNavigator
    setTimeout(() => navigation.goBack(), 350); // wait for native cleanup
  }, [navigation]);

  // Game state
  const [wordQueue]   = useState<string[]>(() => shuffle(allWords));
  const [currentIdx, setCurrentIdx] = useState(0);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [score, setScore]           = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [gameOver, setGameOver]     = useState(false);
  const [timedOut, setTimedOut]     = useState(false);
  // Prevents native ViroARSceneNavigator teardown conflicting with RN navigation
  const [isLeaving, setIsLeaving]   = useState(false);

  // Loading state — tracks which models have fired onLoadEnd
  const [loadedWords, setLoadedWords] = useState<string[]>([]);
  const [allLoaded, setAllLoaded] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const loadFadeAnim = useRef(new Animated.Value(1)).current; // 1=visible, 0=hidden

  // Timer
  const [timeLeft, setTimeLeft]   = useState(GAME_SECONDS);
  const timerRef                  = useRef<ReturnType<typeof setInterval> | null>(null);

  // Tap lock
  const isTapping    = useRef(false);
  const feedbackAnim = useRef(new Animated.Value(0)).current;
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  // Preload SFX on mount, release on unmount
  useEffect(() => {
    loadGameSounds();
    return () => releaseGameSounds();
  }, []);

  // Stable callback refs
  const onCorrectRef      = useRef<(w: string) => void>(() => {});
  const onWrongRef        = useRef<(w: string) => void>(() => {});
  const onModelLoadedRef  = useRef<(w: string) => void>(() => {});

  const targetWord  = wordQueue[currentIdx] ?? '';
  const targetModel = MODEL_REGISTRY[targetWord];

  // ── Start timer when all models loaded ──────────────────────────────────
  useEffect(() => {
    if (!gameStarted) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        const next = t - 1;
        if (next <= 10 && next > 0) playSound('tick');
        if (next <= 0) {
          clearInterval(timerRef.current!);
          playSound('gameover');
          setTimedOut(true);
          setGameOver(true);
          return 0;
        }
        return next;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [gameStarted]);

  // ── Model loaded callback ────────────────────────────────────────────────
  const handleModelLoaded = useCallback((word: string) => {
    setLoadedWords(prev => {
      if (prev.includes(word)) return prev;
      const next = [...prev, word];
      if (next.length >= TOTAL_MODELS) {
        setAllLoaded(true);
      }
      return next;
    });
  }, []);

  // ── Manual Play Start ────────────────────────────────────────────────────
  const handleStartPlay = useCallback(() => {
    Animated.timing(loadFadeAnim, {
      toValue: 0, duration: 600, useNativeDriver: true,
    }).start(() => setGameStarted(true));
  }, [loadFadeAnim]);

  // ── Feedback flash ───────────────────────────────────────────────────────
  const flashFeedback = useCallback((type: 'correct' | 'wrong', cb?: () => void) => {
    setFeedback(type);
    Animated.sequence([
      Animated.timing(feedbackAnim, { toValue: 1, duration: 120, useNativeDriver: true }),
      Animated.delay(type === 'correct' ? 700 : 500),
      Animated.timing(feedbackAnim, { toValue: 0, duration: 180, useNativeDriver: true }),
    ]).start(() => { setFeedback(null); cb?.(); });
  }, [feedbackAnim]);

  // ── Correct tap ──────────────────────────────────────────────────────────
  const handleCorrect = useCallback((word: string) => {
    if (isTapping.current || gameOver) return;
    isTapping.current = true;
    setScore(s => s + 10);
    setFoundWords(prev => [...prev, word]);
    playSound('correct');
    flashFeedback('correct', () => {
      isTapping.current = false;
      if (currentIdx + 1 >= wordQueue.length) {
        if (timerRef.current) clearInterval(timerRef.current);
        playSound('victory');
        setGameOver(true);
      } else {
        setCurrentIdx(i => i + 1);
      }
    });
  }, [currentIdx, wordQueue.length, gameOver, flashFeedback]);

  // ── Wrong tap ────────────────────────────────────────────────────────────
  const handleWrong = useCallback((_word: string) => {
    if (isTapping.current || gameOver) return;
    isTapping.current = true;
    setScore(s => Math.max(0, s - 5));
    setWrongCount(c => c + 1);
    playSound('wrong');
    flashFeedback('wrong', () => { isTapping.current = false; });
  }, [gameOver, flashFeedback]);

  // Keep refs current
  useEffect(() => { onCorrectRef.current     = handleCorrect;     }, [handleCorrect]);
  useEffect(() => { onWrongRef.current       = handleWrong;       }, [handleWrong]);
  useEffect(() => { onModelLoadedRef.current = handleModelLoaded; }, [handleModelLoaded]);

  const stableOnCorrect     = useRef((w: string) => onCorrectRef.current(w)).current;
  const stableOnWrong       = useRef((w: string) => onWrongRef.current(w)).current;
  const stableOnModelLoaded = useRef((w: string) => onModelLoadedRef.current(w)).current;

  const timerUrgent = timeLeft <= 10 && gameStarted && !gameOver;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <StatusBar hidden />

      {/* AR Scene — always mounted to keep AR session stable.
          Hidden with 0 opacity only when leaving to let native teardown cleanly. */}
      <View style={[StyleSheet.absoluteFill, isLeaving && { opacity: 0 }]}>
        <ViroARSceneNavigator
          autofocus
          initialScene={{ scene: WordFindScene as any }}
          viroAppProps={{
            targetWord: gameOver ? '' : targetWord,
            foundWords,
            onCorrect: stableOnCorrect,
            onWrong:   stableOnWrong,
            onModelLoaded: stableOnModelLoaded,
            randomizedPositions,
          }}
          style={StyleSheet.absoluteFill}
        />
      </View>

      {/* ── UI Overlay ── */}
      <SafeAreaView style={styles.overlay} pointerEvents="box-none">

        {/* Header */}
        <View style={styles.header} pointerEvents="box-none">
          <TouchableOpacity style={styles.closeBtn} onPress={() => {
            Alert.alert(
              'Quit Game?',
              'Your progress will be lost.',
              [
                { text: 'Keep Playing', style: 'cancel' },
                { text: 'Quit', style: 'destructive', onPress: safeGoBack },
              ]
            );
          }}>
            <Ionicons name="close" size={22} color="#FFF" />
          </TouchableOpacity>

          <View style={styles.scorePill} pointerEvents="none">
            <Text style={styles.scorePillText}>⭐ {score}</Text>
          </View>

          {/* Timer pill — only shows after game starts */}
          {gameStarted && !gameOver && (
            <View style={[styles.timerPill, timerUrgent && styles.timerPillUrgent]} pointerEvents="none">
              <Text style={[styles.timerText, timerUrgent && styles.timerTextUrgent]}>
                ⏱ {fmt(timeLeft)}
              </Text>
            </View>
          )}

          <View style={styles.progressPill} pointerEvents="none">
            <Text style={styles.progressText}>
              {foundWords.length}/{wordQueue.length}
            </Text>
          </View>
        </View>

        {/* Target word card */}
        {gameStarted && !gameOver && (
          <View style={styles.targetCard} pointerEvents="none">
            <Text style={styles.tapThe}>TAP THE</Text>
            <Text style={styles.targetEmoji}>{targetModel?.emoji ?? '❓'}</Text>
            <Text style={styles.targetWord}>{targetWord.toUpperCase()}</Text>
          </View>
        )}

        {/* Feedback */}
        {feedback !== null && (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.feedbackBanner,
              feedback === 'correct' ? styles.feedbackGreen : styles.feedbackRed,
              { opacity: feedbackAnim },
            ]}
          >
            <Text style={styles.feedbackText}>
              {feedback === 'correct' ? '✅  Correct!  +10' : '❌  Wrong!  -5'}
            </Text>
          </Animated.View>
        )}

        {/* Hint */}
        {gameStarted && !gameOver && (
          <View style={styles.hintRow} pointerEvents="none">
            <Text style={styles.hintText}>Tap the correct 3D model in front of you</Text>
          </View>
        )}
      </SafeAreaView>

      {/* ── Loading / Instructions Overlay ── */}
      {!gameStarted && (
        <Animated.View style={[styles.loadingOverlay, { opacity: loadFadeAnim }]} pointerEvents="auto">
          <Text style={styles.loadingTitle}>How to Play!</Text>
          
          <View style={styles.instructionsBox}>
            <Text style={styles.instructionLine}>📱 Move your phone around to look</Text>
            <Text style={styles.instructionLine}>🔍 Find the 3D model that matches the word</Text>
            <Text style={styles.instructionLine}>👆 Tap the correct model to earn +10 pts</Text>
            <Text style={styles.instructionLine}>❌ Wrong taps cost you -5 pts</Text>
            <Text style={styles.instructionLine}>⏱ You have 60 seconds. Good luck!</Text>
          </View>

          {/* Progress / Play Button Area */}
          <View style={styles.loadingActionArea}>
            {!allLoaded ? (
              <View style={styles.progressContainer}>
                <Text style={styles.loadingSubtitle}>Placing objects in your room...</Text>
                <View style={styles.progressBarTrack}>
                  <Animated.View
                    style={[
                      styles.progressBarFill,
                      { width: `${(loadedWords.length / TOTAL_MODELS) * 100}%` },
                    ]}
                  />
                </View>
                <Text style={styles.progressCount}>
                  {loadedWords.length}/{TOTAL_MODELS} ready
                </Text>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.startGameBtn}
                activeOpacity={0.8}
                onPress={handleStartPlay}
              >
                <Text style={styles.startGameBtnText}>🚀 Start Playing!</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Emoji grid — lights up as each model loads */}
          <View style={styles.emojiGrid}>
            {allWords.map(word => {
              const loaded = loadedWords.includes(word);
              const m = MODEL_REGISTRY[word];
              return (
                <View
                  key={word}
                  style={[styles.emojiCell, loaded && styles.emojiCellLoaded]}
                >
                  <Text style={[styles.emojiIcon, !loaded && styles.emojiIconDim]}>
                    {m?.emoji ?? '❓'}
                  </Text>
                </View>
              );
            })}
          </View>
        </Animated.View>
      )}

      {/* ── Game Over Modal ── */}
      <Modal transparent visible={gameOver} animationType="fade" onRequestClose={() => {}}>
        <View style={styles.gameOverBg}>
          <View style={styles.gameOverCard}>
            <Text style={styles.gameOverEmoji}>
              {timedOut ? '⏰' : wrongCount === 0 ? '🏆' : '🎉'}
            </Text>
            <Text style={styles.gameOverTitle}>
              {timedOut ? "Time's Up!" : wrongCount === 0 ? 'Perfect Score!' : 'All Found!'}
            </Text>
            {timedOut && (
              <Text style={styles.timedOutSub}>
                You found {foundWords.length}/{wordQueue.length} words
              </Text>
            )}
            <View style={styles.scoreRow}>
              <Text style={styles.scoreLabel}>Score</Text>
              <Text style={styles.scoreNum}>{score}</Text>
            </View>
            {wrongCount > 0 && (
              <Text style={styles.mistakesText}>
                {wrongCount} wrong tap{wrongCount > 1 ? 's' : ''}
              </Text>
            )}
            <TouchableOpacity
              style={styles.playAgainBtn}
              activeOpacity={0.85}
              onPress={() => (navigation as any).replace('ARWordFind')}
            >
              <Text style={styles.playAgainText}>🔄 Play Again</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.doneBtn}
              activeOpacity={0.85}
              onPress={safeGoBack}
            >
              <Text style={styles.doneBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  overlay:   { ...StyleSheet.absoluteFillObject, alignItems: 'center' },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center',
    width: '100%', paddingHorizontal: 16, paddingTop: 8, gap: 8,
  },
  closeBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center', justifyContent: 'center',
  },
  scorePill: {
    backgroundColor: '#5B2DC0', borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 6,
  },
  scorePillText: { fontFamily: 'Fredoka-Bold', fontSize: 16, color: '#FFF' },

  timerPill: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 1.5, borderColor: 'rgba(196,181,253,0.4)',
  },
  timerPillUrgent: {
    backgroundColor: 'rgba(220,38,38,0.85)',
    borderColor: '#FCA5A5',
  },
  timerText: { fontFamily: 'Fredoka-Bold', fontSize: 16, color: '#E2E8F0' },
  timerTextUrgent: { color: '#FFF' },

  progressPill: {
    marginLeft: 'auto', backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6,
  },
  progressText: { fontFamily: 'Fredoka-SemiBold', fontSize: 15, color: '#E2E8F0' },

  // Target card
  targetCard: {
    marginTop: 14, backgroundColor: 'rgba(15,7,40,0.90)',
    borderRadius: 26, paddingVertical: 14, paddingHorizontal: 28,
    alignItems: 'center',
    borderWidth: 1.5, borderColor: 'rgba(196,181,253,0.35)', gap: 2,
  },
  tapThe:      { fontFamily: 'Fredoka-Regular', fontSize: 12, color: '#C4B5FD', letterSpacing: 2 },
  targetEmoji: { fontSize: 52 },
  targetWord:  { fontFamily: 'Fredoka-Bold', fontSize: 30, color: '#FFF' },

  // Feedback
  feedbackBanner: {
    marginTop: 12, borderRadius: 22, paddingHorizontal: 24, paddingVertical: 10,
  },
  feedbackGreen: { backgroundColor: 'rgba(5,150,105,0.92)' },
  feedbackRed:   { backgroundColor: 'rgba(220,38,38,0.92)' },
  feedbackText:  { fontFamily: 'Fredoka-Bold', fontSize: 18, color: '#FFF' },

  // Hint
  hintRow: { position: 'absolute', bottom: 32, alignSelf: 'center' },
  hintText: {
    fontFamily: 'Fredoka-Regular', fontSize: 13,
    color: 'rgba(255,255,255,0.5)', textAlign: 'center',
  },

  // Loading overlay
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0D0728',
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 24, gap: 20,
  },
  loadingTitle: {
    fontFamily: 'Fredoka-Bold', fontSize: 36, color: '#FFF', textAlign: 'center',
    marginTop: -20, textShadowColor: 'rgba(124,58,237,0.5)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 10,
  },
  instructionsBox: {
    backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 24,
    padding: 24, width: '100%', gap: 14,
    borderWidth: 1.5, borderColor: 'rgba(196,181,253,0.2)',
  },
  instructionLine: {
    fontFamily: 'Fredoka-SemiBold', fontSize: 17, color: '#E2E8F0',
  },
  loadingActionArea: {
    width: '100%', height: 80, justifyContent: 'center', alignItems: 'center', marginTop: 10,
  },
  progressContainer: { width: '100%', alignItems: 'center', gap: 8 },
  loadingSubtitle: {
    fontFamily: 'Fredoka-SemiBold', fontSize: 16, color: '#A78BFA',
  },
  progressBarTrack: {
    width: '100%', height: 12, backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 6, overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%', backgroundColor: '#7C3AED', borderRadius: 6,
  },
  progressCount: {
    fontFamily: 'Fredoka-Regular', fontSize: 14, color: '#7C5CBF',
  },
  startGameBtn: {
    backgroundColor: '#10B981', paddingVertical: 18, paddingHorizontal: 40,
    borderRadius: 30, width: '100%', alignItems: 'center',
    shadowColor: '#10B981', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 5,
  },
  startGameBtnText: {
    fontFamily: 'Fredoka-Bold', fontSize: 22, color: '#FFF',
  },
  emojiGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    justifyContent: 'center', gap: 12, marginTop: 10,
  },
  emojiCell: {
    width: 54, height: 54, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.08)',
  },
  emojiCellLoaded: {
    backgroundColor: 'rgba(124,58,237,0.3)',
    borderColor: '#7C3AED',
  },
  emojiIcon:    { fontSize: 28 },
  emojiIconDim: { opacity: 0.25 },

  // Game Over
  gameOverBg: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.88)',
    alignItems: 'center', justifyContent: 'center', padding: 32,
  },
  gameOverCard: {
    backgroundColor: '#1A1050', borderRadius: 32,
    paddingVertical: 40, paddingHorizontal: 36,
    alignItems: 'center', gap: 10, width: '100%',
    borderWidth: 1.5, borderColor: 'rgba(196,181,253,0.3)',
  },
  gameOverEmoji:  { fontSize: 72, marginBottom: 4 },
  gameOverTitle:  { fontFamily: 'Fredoka-Bold', fontSize: 30, color: '#FFF' },
  timedOutSub:    { fontFamily: 'Fredoka-Regular', fontSize: 16, color: '#A78BFA' },
  scoreRow:       { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginTop: 4 },
  scoreLabel:     { fontFamily: 'Fredoka-Regular', fontSize: 17, color: '#A78BFA' },
  scoreNum:       { fontFamily: 'Fredoka-Bold', fontSize: 40, color: '#C4B5FD' },
  mistakesText:   { fontFamily: 'Fredoka-Regular', fontSize: 15, color: '#6B7280' },
  playAgainBtn: {
    marginTop: 12, backgroundColor: '#5B2DC0',
    borderRadius: 20, paddingHorizontal: 36, paddingVertical: 14,
    width: '100%', alignItems: 'center',
  },
  playAgainText: { fontFamily: 'Fredoka-Bold', fontSize: 18, color: '#FFF' },
  doneBtn: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20, paddingHorizontal: 36, paddingVertical: 12,
    width: '100%', alignItems: 'center',
  },
  doneBtnText: { fontFamily: 'Fredoka-SemiBold', fontSize: 17, color: '#A78BFA' },
});
