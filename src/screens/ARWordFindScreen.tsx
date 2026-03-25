/**
 * ARWordFindScreen.tsx
 *
 * AR Word Find Game — all 10 fruit models float in AR space.
 * A target word + emoji is displayed. The child finds the matching
 * model visually, then confirms by tapping the correct word chip
 * from 4 options (1 correct, 3 wrong). +10 correct, -5 wrong.
 *
 * NOTE: ViroReact onClick is not compiled in this native build.
 *       All tap interaction goes through React Native 2D chips.
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
  ScrollView,
} from 'react-native';
import {
  ViroARScene,
  ViroARSceneNavigator,
  ViroAmbientLight,
  ViroDirectionalLight,
  ViroNode,
  Viro3DObject,
  ViroText,
} from '@reactvision/react-viro';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { MODEL_REGISTRY } from '../utils/modelRegistry';

// ── AR positions: 2 rows of 5, spread in arc in front of player ──────────────
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

// ── Utility ───────────────────────────────────────────────────────────────────
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Pick `n` random items from arr that are NOT equal to `exclude` */
function pickDistractors(arr: string[], exclude: string, n: number): string[] {
  return shuffle(arr.filter(w => w !== exclude)).slice(0, n);
}

// ── AR Scene — display only, no click handlers ────────────────────────────────
const WordFindScene = (props: any) => {
  const { foundWords = [] }: { foundWords: string[] } =
    props.sceneNavigator.viroAppProps ?? {};

  const entries = Object.entries(MODEL_REGISTRY);

  return (
    <ViroARScene>
      {/* Lighting */}
      <ViroAmbientLight color="#ffffff" intensity={600} />
      <ViroDirectionalLight color="#ffffff" direction={[0, -1, -0.2]} intensity={600} castsShadow={false} />
      <ViroDirectionalLight color="#fff5e0" direction={[1, -0.5, -1]} intensity={400} castsShadow={false} />

      {entries.map(([word, model], idx) => {
        const isFound = foundWords.includes(word);
        const pos = POSITIONS[idx] ?? [0, 0, -1.5];

        return (
          <ViroNode
            key={word}
            position={pos}
            animation={{ name: 'rotate', run: !isFound, loop: true }}
          >
            <Viro3DObject
              source={model.source}
              scale={model.scale}
              type="GLB"
              opacity={isFound ? 0.22 : 1}
            />
            <ViroText
              text={isFound ? '✓' : word.toUpperCase()}
              position={[0, -0.13, 0]}
              scale={[0.09, 0.09, 0.09]}
              style={{
                fontFamily: 'Arial',
                fontSize: 20,
                color: isFound ? '#6EE7B7' : '#FFFFFF',
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

  // Game state
  const [wordQueue]   = useState<string[]>(() => shuffle(allWords));
  const [currentIdx, setCurrentIdx]   = useState(0);
  const [foundWords, setFoundWords]   = useState<string[]>([]);
  const [score, setScore]             = useState(0);
  const [wrongCount, setWrongCount]   = useState(0);
  const [feedback, setFeedback]       = useState<'correct' | 'wrong' | null>(null);
  const [gameOver, setGameOver]       = useState(false);

  // AR mount gate — wait 200 ms before mounting ViroARSceneNavigator
  // so the native parent view is fully established first (prevents crash)
  const [arReady, setArReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setArReady(true), 200);
    return () => clearTimeout(t);
  }, []);

  const isTapping       = useRef(false);
  const feedbackAnim    = useRef(new Animated.Value(0)).current;

  const targetWord  = wordQueue[currentIdx] ?? '';
  const targetModel = MODEL_REGISTRY[targetWord];

  // Build 4 answer chips: correct + 3 random distractors, shuffled
  const [choices, setChoices] = useState<string[]>([]);
  useEffect(() => {
    if (!targetWord) return;
    const distractors = pickDistractors(allWords, targetWord, 3);
    setChoices(shuffle([targetWord, ...distractors]));
  }, [targetWord]);   // eslint-disable-line react-hooks/exhaustive-deps

  // ── Feedback animation ───────────────────────────────────────────────────
  const flashFeedback = useCallback((type: 'correct' | 'wrong', cb?: () => void) => {
    setFeedback(type);
    Animated.sequence([
      Animated.timing(feedbackAnim, { toValue: 1, duration: 120, useNativeDriver: true }),
      Animated.delay(type === 'correct' ? 600 : 400),
      Animated.timing(feedbackAnim, { toValue: 0, duration: 180, useNativeDriver: true }),
    ]).start(() => { setFeedback(null); cb?.(); });
  }, [feedbackAnim]);

  // ── Chip tap handler ─────────────────────────────────────────────────────
  const handleChipTap = useCallback((word: string) => {
    if (isTapping.current || gameOver) return;
    isTapping.current = true;

    if (word === targetWord) {
      setScore(s => s + 10);
      setFoundWords(prev => [...prev, targetWord]);
      flashFeedback('correct', () => {
        isTapping.current = false;
        if (currentIdx + 1 >= wordQueue.length) {
          setGameOver(true);
        } else {
          setCurrentIdx(i => i + 1);
        }
      });
    } else {
      setScore(s => Math.max(0, s - 5));
      setWrongCount(c => c + 1);
      flashFeedback('wrong', () => { isTapping.current = false; });
    }
  }, [targetWord, currentIdx, wordQueue.length, gameOver, flashFeedback]);

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <StatusBar hidden />

      {/* Loading gate */}
      {!arReady && (
        <View style={styles.loadingOverlay}>
          <Text style={styles.loadingText}>Loading AR… ✨</Text>
        </View>
      )}

      {/* AR Scene — display only, no click handlers */}
      {arReady && (
        <ViroARSceneNavigator
          autofocus
          initialScene={{ scene: WordFindScene as any }}
          viroAppProps={{ foundWords }}
          style={StyleSheet.absoluteFill}
        />
      )}

      {/* ── UI Overlay ── */}
      <SafeAreaView style={styles.overlay} pointerEvents="box-none">

        {/* Header */}
        <View style={styles.header} pointerEvents="box-none">
          <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="close" size={22} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.scorePill} pointerEvents="none">
            <Text style={styles.scorePillText}>⭐ {score}</Text>
          </View>
          <View style={styles.progressPill} pointerEvents="none">
            <Text style={styles.progressText}>{foundWords.length}/{wordQueue.length}</Text>
          </View>
        </View>

        {/* Target word card */}
        {!gameOver && (
          <View style={styles.targetCard} pointerEvents="none">
            <Text style={styles.tapThe}>FIND THE</Text>
            <Text style={styles.targetEmoji}>{targetModel?.emoji ?? '❓'}</Text>
            <Text style={styles.targetWord}>{targetWord.toUpperCase()}</Text>
            <Text style={styles.targetHint}>…then tap the correct word below</Text>
          </View>
        )}

        {/* Feedback banner */}
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

        {/* ── Answer chips (2 × 2 grid) ── */}
        {!gameOver && (
          <View style={styles.chipsContainer}>
            {choices.map(word => {
              const m = MODEL_REGISTRY[word];
              return (
                <TouchableOpacity
                  key={word}
                  style={[
                    styles.chip,
                    foundWords.includes(word) && styles.chipFound,
                  ]}
                  activeOpacity={0.75}
                  onPress={() => handleChipTap(word)}
                  disabled={foundWords.includes(word)}
                >
                  <Text style={styles.chipEmoji}>{m?.emoji ?? '❓'}</Text>
                  <Text style={[
                    styles.chipText,
                    foundWords.includes(word) && styles.chipTextFound,
                  ]}>
                    {word.charAt(0).toUpperCase() + word.slice(1)}
                  </Text>
                </TouchableOpacity>
              );
            })}
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

  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0F0728',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontFamily: 'Fredoka-Regular', fontSize: 20, color: '#C4B5FD',
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'space-between',
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
    backgroundColor: '#5B2DC0', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 6,
  },
  scorePillText: { fontFamily: 'Fredoka-Bold', fontSize: 17, color: '#FFF' },
  progressPill: {
    marginLeft: 'auto',
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6,
  },
  progressText: { fontFamily: 'Fredoka-SemiBold', fontSize: 16, color: '#E2E8F0' },

  // Target card
  targetCard: {
    backgroundColor: 'rgba(15,7,40,0.90)',
    borderRadius: 26,
    paddingVertical: 12, paddingHorizontal: 28,
    alignItems: 'center',
    borderWidth: 1.5, borderColor: 'rgba(196,181,253,0.35)',
    gap: 1,
  },
  tapThe: {
    fontFamily: 'Fredoka-Regular', fontSize: 12,
    color: '#C4B5FD', letterSpacing: 2,
  },
  targetEmoji: { fontSize: 48 },
  targetWord: { fontFamily: 'Fredoka-Bold', fontSize: 28, color: '#FFF' },
  targetHint: {
    fontFamily: 'Fredoka-Regular', fontSize: 12, color: '#7C5CBF', marginTop: 2,
  },

  // Feedback
  feedbackBanner: {
    borderRadius: 22, paddingHorizontal: 24, paddingVertical: 10,
  },
  feedbackGreen: { backgroundColor: 'rgba(5,150,105,0.92)' },
  feedbackRed:   { backgroundColor: 'rgba(220,38,38,0.92)' },
  feedbackText:  { fontFamily: 'Fredoka-Bold', fontSize: 18, color: '#FFF' },

  // Answer chips: 2 × 2 grid
  chipsContainer: {
    width: '100%',
    paddingHorizontal: 16,
    paddingBottom: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    width: '47%',
    backgroundColor: 'rgba(20,10,50,0.90)',
    borderRadius: 20,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(196,181,253,0.35)',
    gap: 4,
  },
  chipFound: {
    backgroundColor: 'rgba(5,150,105,0.25)',
    borderColor: '#6EE7B7',
  },
  chipEmoji: { fontSize: 32 },
  chipText: {
    fontFamily: 'Fredoka-Bold', fontSize: 16, color: '#FFF',
  },
  chipTextFound: { color: '#6EE7B7' },

  // Game Over Modal
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
  gameOverEmoji: { fontSize: 72, marginBottom: 4 },
  gameOverTitle: { fontFamily: 'Fredoka-Bold', fontSize: 30, color: '#FFF' },
  scoreRow: {
    flexDirection: 'row', alignItems: 'baseline', gap: 8, marginTop: 4,
  },
  scoreLabel: { fontFamily: 'Fredoka-Regular', fontSize: 17, color: '#A78BFA' },
  scoreNum:   { fontFamily: 'Fredoka-Bold', fontSize: 40, color: '#C4B5FD' },
  mistakesText: { fontFamily: 'Fredoka-Regular', fontSize: 15, color: '#6B7280' },
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
