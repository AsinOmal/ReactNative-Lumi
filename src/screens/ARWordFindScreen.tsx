/**
 * ARWordFindScreen.tsx
 *
 * AR Word Find Game — tap the correct 3D model.
 *
 * Root cause of previous crashes:
 *   ViroNode.js and Viro3DObject.js both do `{...this.props}` which
 *   leaks the `onClick` JS prop to native. Modern RN no longer filters
 *   unknown props, so the bridge calls `setOnClick:` → unrecognized selector crash.
 *
 * Fix:
 *   Create a direct requireNativeComponent('VRTViewContainer') binding.
 *   We pass ONLY the props registered in VRTNode.h:
 *     - canClick  (BOOL)  → enables Viro's input hit-testing on this node
 *     - onClickViro (RCTDirectEventBlock) → fires {clickState, position, source}
 *   `Viro3DObject` is nested inside (no onClick prop on it) → no crash.
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
  requireNativeComponent,
} from 'react-native';
import {
  ViroARScene,
  ViroARSceneNavigator,
  ViroAmbientLight,
  ViroDirectionalLight,
  Viro3DObject,
  ViroText,
} from '@reactvision/react-viro';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { MODEL_REGISTRY } from '../utils/modelRegistry';

// ── Direct native binding ─────────────────────────────────────────────────────
// Bypasses ViroNode.js which spreads {…this.props} (leaking onClick to native).
// VRTViewContainer extends VRTNode which has canClick + onClickViro registered.
const VRTClickNode = requireNativeComponent('VRTViewContainer') as any;

// ── Viro ClickState enum (from ViroReact EventDelegate) ───────────────────────
const CLICK_STATE_CLICKED = 1; // "up" / confirmed tap

// ── AR positions: 10 models genuinely scattered around the player ─────────────
// Varied x (left↔right), y (height), and z (depth) so no two models
// sit at the same level — the child has to look around in all directions.
const POSITIONS: [number, number, number][] = [
  [-2.2,  0.6, -1.6],  // far left, high
  [-1.8, -0.5, -2.2],  // left, low, far
  [-0.8,  0.4, -1.2],  // near-left, mid-high, close
  [ 0.0,  0.8, -2.0],  // center, high up, far
  [-0.4, -0.5, -1.7],  // near-center, low
  [ 0.7,  0.5, -1.3],  // center-right, mid, close
  [ 1.3, -0.4, -2.3],  // right, low, far
  [ 1.9,  0.3, -1.5],  // far right, mid-height
  [ 2.4, -0.5, -1.9],  // very far right, low
  [ 0.4,  0.1, -2.6],  // center-right, mid, very far back
];

// ── Utilities ─────────────────────────────────────────────────────────────────
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── AR Scene ──────────────────────────────────────────────────────────────────
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
      <ViroAmbientLight color="#ffffff" intensity={600} />
      <ViroDirectionalLight color="#ffffff" direction={[0, -1, -0.2]} intensity={600} castsShadow={false} />
      <ViroDirectionalLight color="#fff5e0" direction={[1, -0.5, -1]} intensity={400} castsShadow={false} />

      {entries.map(([word, model], idx) => {
        const isFound = foundWords.includes(word);
        const pos = POSITIONS[idx] ?? [0, 0, -1.5];

        return (
          // VRTClickNode is a direct native binding — we control exactly
          // which props reach native. canClick + onClickViro are registered
          // on VRTNode (parent of VRTViewContainer). No onClick leak → no crash.
          <VRTClickNode
            key={word}
            position={pos}
            animation={{ name: 'rotate', run: !isFound, loop: true }}
            canClick={!isFound}
            onClickViro={(event: any) => {
              if (event.nativeEvent.clickState !== CLICK_STATE_CLICKED) return;
              if (isFound) return;
              if (word === targetWord) onCorrect(word);
              else onWrong(word);
            }}
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
                color: isFound ? '#6EE7B7' : word === targetWord ? '#FDE68A' : '#FFFFFF',
                textAlign: 'center',
              } as any}
            />
          </VRTClickNode>
        );
      })}
    </ViroARScene>
  );
};

// ── Main Screen ───────────────────────────────────────────────────────────────
export const ARWordFindScreen = () => {
  const navigation = useNavigation();
  const allWords = Object.keys(MODEL_REGISTRY);

  const [wordQueue]   = useState<string[]>(() => shuffle(allWords));
  const [currentIdx, setCurrentIdx]   = useState(0);
  const [foundWords, setFoundWords]   = useState<string[]>([]);
  const [score, setScore]             = useState(0);
  const [wrongCount, setWrongCount]   = useState(0);
  const [feedback, setFeedback]       = useState<'correct' | 'wrong' | null>(null);
  const [gameOver, setGameOver]       = useState(false);

  // 200ms gate before mounting ViroARSceneNavigator — lets native parent
  // view establish first, preventing the parentNode crash on fast navigation.
  const [arReady, setArReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setArReady(true), 200);
    return () => clearTimeout(t);
  }, []);

  const isTapping    = useRef(false);
  const feedbackAnim = useRef(new Animated.Value(0)).current;

  // Stable callback refs — prevents stale closure issues in viroAppProps
  const onCorrectRef = useRef<(w: string) => void>(() => {});
  const onWrongRef   = useRef<(w: string) => void>(() => {});

  const targetWord  = wordQueue[currentIdx] ?? '';
  const targetModel = MODEL_REGISTRY[targetWord];

  // ── Feedback animation ───────────────────────────────────────────────────
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
    if (isTapping.current) return;
    isTapping.current = true;
    setScore(s => s + 10);
    setFoundWords(prev => [...prev, word]);
    flashFeedback('correct', () => {
      isTapping.current = false;
      if (currentIdx + 1 >= wordQueue.length) {
        setGameOver(true);
      } else {
        setCurrentIdx(i => i + 1);
      }
    });
  }, [currentIdx, wordQueue.length, flashFeedback]);

  // ── Wrong tap ────────────────────────────────────────────────────────────
  const handleWrong = useCallback((word: string) => {
    if (isTapping.current) return;
    isTapping.current = true;
    setScore(s => Math.max(0, s - 5));
    setWrongCount(c => c + 1);
    flashFeedback('wrong', () => { isTapping.current = false; });
  }, [flashFeedback]);

  // Keep refs current
  useEffect(() => { onCorrectRef.current = handleCorrect; }, [handleCorrect]);
  useEffect(() => { onWrongRef.current   = handleWrong;   }, [handleWrong]);

  const stableOnCorrect = useRef((w: string) => onCorrectRef.current(w)).current;
  const stableOnWrong   = useRef((w: string) => onWrongRef.current(w)).current;

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

      {/* AR Scene — kept mounted throughout (Modal for game-over overlay) */}
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

      {/* UI Overlay */}
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
            <Text style={styles.tapThe}>TAP THE</Text>
            <Text style={styles.targetEmoji}>{targetModel?.emoji ?? '❓'}</Text>
            <Text style={styles.targetWord}>{targetWord.toUpperCase()}</Text>
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

        {/* Hint */}
        {!gameOver && (
          <View style={styles.hintRow} pointerEvents="none">
            <Text style={styles.hintText}>Tap the correct 3D model in front of you</Text>
          </View>
        )}

      </SafeAreaView>

      {/* Game Over Modal */}
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
    alignItems: 'center', justifyContent: 'center',
  },
  loadingText: { fontFamily: 'Fredoka-Regular', fontSize: 20, color: '#C4B5FD' },

  overlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center' },

  header: {
    flexDirection: 'row', alignItems: 'center',
    width: '100%', paddingHorizontal: 16, paddingTop: 8, gap: 10,
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
    marginLeft: 'auto', backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6,
  },
  progressText: { fontFamily: 'Fredoka-SemiBold', fontSize: 16, color: '#E2E8F0' },

  targetCard: {
    marginTop: 14,
    backgroundColor: 'rgba(15,7,40,0.90)',
    borderRadius: 26, paddingVertical: 14, paddingHorizontal: 28,
    alignItems: 'center',
    borderWidth: 1.5, borderColor: 'rgba(196,181,253,0.35)',
    gap: 2,
  },
  tapThe: { fontFamily: 'Fredoka-Regular', fontSize: 12, color: '#C4B5FD', letterSpacing: 2 },
  targetEmoji: { fontSize: 52 },
  targetWord: { fontFamily: 'Fredoka-Bold', fontSize: 30, color: '#FFF' },

  feedbackBanner: {
    marginTop: 12, borderRadius: 22, paddingHorizontal: 24, paddingVertical: 10,
  },
  feedbackGreen: { backgroundColor: 'rgba(5,150,105,0.92)' },
  feedbackRed:   { backgroundColor: 'rgba(220,38,38,0.92)' },
  feedbackText:  { fontFamily: 'Fredoka-Bold', fontSize: 18, color: '#FFF' },

  hintRow: { position: 'absolute', bottom: 32, alignSelf: 'center' },
  hintText: {
    fontFamily: 'Fredoka-Regular', fontSize: 13,
    color: 'rgba(255,255,255,0.5)', textAlign: 'center',
  },

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
  scoreRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginTop: 4 },
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
