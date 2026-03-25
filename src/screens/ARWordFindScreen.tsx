/**
 * ARWordFindScreen.tsx
 *
 * AR Word Find Game — Stationary mode.
 * All 10 pack models are placed in AR space in front of the player.
 * The screen shows "TAP THE [WORD]". Player taps the correct 3D model.
 * +10 for correct, -5 for wrong. After all 10 found → game over card.
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
} from 'react-native';
import {
  ViroARScene,
  ViroARSceneNavigator,
  ViroNode,
  Viro3DObject,
  ViroText,
} from '@reactvision/react-viro';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { MODEL_REGISTRY } from '../utils/modelRegistry';

// ── AR positions: 2 rows of 5, spread horizontally in front of player ────────
// Row 1 (y = 0.05, z = -1.2): closer, eye-level
// Row 2 (y = -0.35, z = -1.45): slightly further, lower
const POSITIONS: [number, number, number][] = [
  [-0.80,  0.05, -1.20],
  [-0.40,  0.05, -1.15],
  [ 0.00,  0.05, -1.20],
  [ 0.40,  0.05, -1.15],
  [ 0.80,  0.05, -1.20],
  [-0.60, -0.35, -1.45],
  [-0.20, -0.35, -1.40],
  [ 0.20, -0.35, -1.40],
  [ 0.60, -0.35, -1.45],
  [ 1.00, -0.35, -1.50],
];

// ── Module-level scene component required by ViroARSceneNavigator ─────────────
const WordFindScene = (props: any) => {
  const {
    targetWord,
    foundWords,
    onCorrect,
    onWrong,
  }: {
    targetWord: string;
    foundWords: string[];
    onCorrect: (w: string) => void;
    onWrong: (w: string) => void;
  } = props.sceneNavigator.viroAppProps;

  const entries = Object.entries(MODEL_REGISTRY);

  return (
    <ViroARScene>
      {entries.map(([word, model], idx) => {
        const isFound = foundWords.includes(word);
        const isTarget = word === targetWord;
        const pos = POSITIONS[idx] ?? [0, 0, -1.5];

        return (
          <ViroNode
            key={word}
            position={pos}
          >
            {/* 3D Model — onClick must be on Viro3DObject, not ViroNode */}
            <Viro3DObject
              source={model.source}
              scale={model.scale}
              type="GLB"
              opacity={isFound ? 0.25 : 1}
              animation={{ name: 'rotate', run: !isFound, loop: true }}
              onClick={() => {
                if (isFound) return;
                if (word === targetWord) onCorrect(word);
                else onWrong(word);
              }}
            />

            {/* Word label below model */}
            <ViroText
              text={isFound ? '✓  Found!' : word.toUpperCase()}
              position={[0, -0.13, 0]}
              scale={[0.11, 0.11, 0.11]}
              style={{
                fontFamily: 'Arial',
                fontSize: 22,
                color: isFound ? '#6EE7B7' : isTarget ? '#FDE68A' : '#E2E8F0',
                fontWeight: isTarget ? 'bold' : 'normal',
                textAlign: 'center',
              } as any}
            />
          </ViroNode>
        );
      })}
    </ViroARScene>
  );
};

// ── Utility: Fisher-Yates shuffle ─────────────────────────────────────────────
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Main Screen ───────────────────────────────────────────────────────────────
export const ARWordFindScreen = () => {
  const navigation = useNavigation();

  // Shuffle once on mount
  const [wordQueue] = useState<string[]>(() => shuffle(Object.keys(MODEL_REGISTRY)));
  const [currentIdx, setCurrentIdx] = useState(0);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [gameOver, setGameOver] = useState(false);
  // Mount gate — wait one frame before showing ViroARSceneNavigator so the
  // native view hierarchy is fully established (prevents parentNode crash)
  const [arReady, setArReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setArReady(true), 200);
    return () => clearTimeout(t);
  }, []);

  // Tap lock — prevents double-fire during feedback animation
  const isTapping = useRef(false);
  // Stable callback refs so viroAppProps always gets fresh handlers
  const onCorrectRef = useRef<(w: string) => void>(() => {});
  const onWrongRef   = useRef<(w: string) => void>(() => {});

  const feedbackAnim = useRef(new Animated.Value(0)).current;

  const targetWord = wordQueue[currentIdx] ?? '';
  const targetModel = MODEL_REGISTRY[targetWord];

  // ── Feedback flash animation ─────────────────────────────────────────────
  const flashFeedback = useCallback((type: 'correct' | 'wrong') => {
    setFeedback(type);
    Animated.sequence([
      Animated.timing(feedbackAnim, { toValue: 1, duration: 120, useNativeDriver: true }),
      Animated.delay(type === 'correct' ? 600 : 400),
      Animated.timing(feedbackAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => setFeedback(null));
  }, [feedbackAnim]);

  // ── Correct tap handler ──────────────────────────────────────────────────
  const handleCorrect = useCallback((word: string) => {
    if (isTapping.current) return;
    isTapping.current = true;
    flashFeedback('correct');
    setScore(s => s + 10);
    setFoundWords(prev => [...prev, word]);
    setTimeout(() => {
      isTapping.current = false;
      if (currentIdx + 1 >= wordQueue.length) {
        setGameOver(true);
      } else {
        setCurrentIdx(i => i + 1);
      }
    }, 900);
  }, [currentIdx, wordQueue.length, flashFeedback]);

  // ── Wrong tap handler ────────────────────────────────────────────────────
  const handleWrong = useCallback(() => {
    if (isTapping.current) return;
    isTapping.current = true;
    flashFeedback('wrong');
    setScore(s => Math.max(0, s - 5));
    setWrongCount(c => c + 1);
    setTimeout(() => { isTapping.current = false; }, 700);
  }, [flashFeedback]);

  // Keep refs current so stable viroAppProps wrappers always call fresh handlers
  useEffect(() => { onCorrectRef.current = handleCorrect; }, [handleCorrect]);
  useEffect(() => { onWrongRef.current = handleWrong; }, [handleWrong]);

  // Stable wrappers — defined once, always delegate to the current ref
  const stableOnCorrect = useRef((w: string) => onCorrectRef.current(w)).current;
  const stableOnWrong   = useRef((w: string) => onWrongRef.current(w)).current;

  // ── Game screen (always rendered — game over shown as Modal overlay) ─────
  return (
    <View style={styles.container}>
      <StatusBar hidden />

      {/* Full-screen AR scene — kept mounted throughout to avoid ViroReact
          native view teardown issues when game over state changes */}
      {arReady && (
        <ViroARSceneNavigator
          autofocus
          initialScene={{ scene: WordFindScene as any }}
          viroAppProps={{
            targetWord: gameOver ? '' : targetWord,
            foundWords,
            onCorrect: stableOnCorrect,
            onWrong:   stableOnWrong,
          }}
          style={StyleSheet.absoluteFill}
        />
      )}

      {/* Loading indicator while AR initialises */}
      {!arReady && (
        <View style={styles.loadingOverlay}>
          <Text style={styles.loadingText}>Loading AR… ✨</Text>
        </View>
      )}

      {/* UI overlay — box-none so touches pass through to AR */}
      <SafeAreaView style={styles.overlay} pointerEvents="box-none">

        {/* ── Header row ── */}
        <View style={styles.header} pointerEvents="box-none">
          <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="close" size={22} color="#FFF" />
          </TouchableOpacity>

          <View style={styles.scorePill} pointerEvents="none">
            <Text style={styles.scorePillText}>⭐ {score}</Text>
          </View>

          <View style={styles.progressPill} pointerEvents="none">
            <Text style={styles.progressText}>
              {foundWords.length}/{wordQueue.length}
            </Text>
          </View>
        </View>

        {/* ── Target word card ── */}
        {!gameOver && (
          <View style={styles.targetCard} pointerEvents="none">
            <Text style={styles.tapThe}>TAP THE</Text>
            <Text style={styles.targetEmoji}>{targetModel?.emoji ?? '❓'}</Text>
            <Text style={styles.targetWord}>{targetWord.toUpperCase()}</Text>
          </View>
        )}

        {/* ── Feedback banner ── */}
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

        {/* ── Hint ── */}
        {!gameOver && (
          <View style={styles.hintRow} pointerEvents="none">
            <Text style={styles.hintText}>
              Look around — all words are in front of you
            </Text>
          </View>
        )}

      </SafeAreaView>

      {/* ── Game Over Modal ── */}
      <Modal transparent visible={gameOver} animationType="fade" onRequestClose={() => {}}>
        <View style={styles.gameOverBg}>
          <View style={styles.gameOverCard}>
            <Text style={styles.gameOverEmoji}>{wrongCount === 0 ? '🏆' : '🎉'}</Text>
            <Text style={styles.gameOverTitle}>
              {wrongCount === 0 ? 'Perfect Score!' : 'All Found!'}
            </Text>
            <View style={styles.gameOverScoreRow}>
              <Text style={styles.gameOverScoreLabel}>Score</Text>
              <Text style={styles.gameOverScoreNum}>{score}</Text>
            </View>
            {wrongCount > 0 && (
              <Text style={styles.gameOverMistakes}>
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
              onPress={() => navigation.goBack()}
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

  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 10,
  },
  closeBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center', justifyContent: 'center',
  },
  scorePill: {
    backgroundColor: '#5B2DC0',
    borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 6,
  },
  scorePillText: {
    fontFamily: 'Fredoka-Bold', fontSize: 17, color: '#FFF',
  },
  progressPill: {
    marginLeft: 'auto',
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 6,
  },
  progressText: {
    fontFamily: 'Fredoka-SemiBold', fontSize: 16, color: '#E2E8F0',
  },

  // Target card
  targetCard: {
    marginTop: 14,
    backgroundColor: 'rgba(15,7,40,0.90)',
    borderRadius: 26,
    paddingVertical: 14,
    paddingHorizontal: 30,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(196,181,253,0.35)',
    gap: 2,
  },
  tapThe: {
    fontFamily: 'Fredoka-Regular',
    fontSize: 13, color: '#C4B5FD', letterSpacing: 2,
  },
  targetEmoji: { fontSize: 52 },
  targetWord: {
    fontFamily: 'Fredoka-Bold', fontSize: 30, color: '#FFF',
  },

  // Feedback
  feedbackBanner: {
    marginTop: 12,
    borderRadius: 22,
    paddingHorizontal: 24, paddingVertical: 10,
  },
  feedbackGreen: { backgroundColor: 'rgba(5,150,105,0.92)' },
  feedbackRed:   { backgroundColor: 'rgba(220,38,38,0.92)' },
  feedbackText: {
    fontFamily: 'Fredoka-Bold', fontSize: 18, color: '#FFF',
  },

  // Hint
  hintRow: {
    position: 'absolute',
    bottom: 32,
    alignSelf: 'center',
  },
  hintText: {
    fontFamily: 'Fredoka-Regular', fontSize: 13,
    color: 'rgba(255,255,255,0.55)',
    textAlign: 'center',
  },

  // Game Over
  gameOverBg: {
    flex: 1, backgroundColor: '#0F0728',
    alignItems: 'center', justifyContent: 'center', padding: 32,
  },
  gameOverCard: {
    backgroundColor: '#1A1050', borderRadius: 32,
    paddingVertical: 40, paddingHorizontal: 36,
    alignItems: 'center', gap: 10, width: '100%',
    borderWidth: 1.5, borderColor: 'rgba(196,181,253,0.3)',
  },
  gameOverEmoji: { fontSize: 72, marginBottom: 4 },
  gameOverTitle: {
    fontFamily: 'Fredoka-Bold', fontSize: 30, color: '#FFF',
  },
  gameOverScoreRow: {
    flexDirection: 'row', alignItems: 'baseline', gap: 8, marginTop: 4,
  },
  gameOverScoreLabel: {
    fontFamily: 'Fredoka-Regular', fontSize: 17, color: '#A78BFA',
  },
  gameOverScoreNum: {
    fontFamily: 'Fredoka-Bold', fontSize: 40, color: '#C4B5FD',
  },
  gameOverMistakes: {
    fontFamily: 'Fredoka-Regular', fontSize: 15, color: '#6B7280',
  },
  playAgainBtn: {
    marginTop: 12, backgroundColor: '#5B2DC0',
    borderRadius: 20, paddingHorizontal: 36, paddingVertical: 14,
    width: '100%', alignItems: 'center',
  },
  playAgainText: {
    fontFamily: 'Fredoka-Bold', fontSize: 18, color: '#FFF',
  },
  doneBtn: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20, paddingHorizontal: 36, paddingVertical: 12,
    width: '100%', alignItems: 'center',
  },
  doneBtnText: {
    fontFamily: 'Fredoka-SemiBold', fontSize: 17, color: '#A78BFA',
  },

  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0F0728',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontFamily: 'Fredoka-Regular',
    fontSize: 20,
    color: '#C4B5FD',
  },
});
