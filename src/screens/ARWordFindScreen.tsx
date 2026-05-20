import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Animated,
  Alert,
} from 'react-native';
import { ViroARSceneNavigator } from '@reactvision/react-viro';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { MODEL_REGISTRY, ModelEntry } from '../utils/modelRegistry';
import { usePackDownloadStore } from '../store/usePackDownloadStore';
import { useRemoteContentStore } from '../store/useRemoteContentStore';
import { useLanguageStore } from '../store/useLanguageStore';
import { getWordEmoji } from '../constants/packAccents';
import { loadGameSounds, releaseGameSounds } from '../utils/gameSound';
import { shuffleArray } from '../utils/arrayUtils';
import { getModelUriForViro, getAudioUriForPlayback } from '../utils/packStorage';

import { GameLoadingOverlay } from '../components/ar/GameLoadingOverlay';
import { GameOverModal } from '../components/ar/GameOverModal';
import { WordFindScene } from '../components/ar/WordFindScene';
import { useARGameLoop } from '../hooks/useARGameLoop';
import { useAmbientPauseOnFocus } from '../hooks/useAmbientPauseOnFocus';
import { styles } from './ARWordFindScreenStyles';

const POSITIONS: [number, number, number][] = [
  [-2.2, 0.6, -1.6],
  [-1.8, -0.5, -2.2],
  [-0.8, 0.4, -1.2],
  [0.0, 0.8, -2.0],
  [-0.4, -0.5, -1.7],
  [0.7, 0.5, -1.3],
  [1.3, -0.4, -2.3],
  [1.9, 0.3, -1.5],
  [2.4, -0.5, -1.9],
  [0.4, 0.1, -2.6],
];

const fmt = (s: number) =>
  `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

// 📖 Orchestrates the AR Word Hunt game. Delegates timer/score to useARGameLoop.
export const ARWordFindScreen = () => {
  useAmbientPauseOnFocus();
  const navigation = useNavigation();
  const [randomizedPositions] = useState(() => shuffleArray(POSITIONS));
  // Pre-compute (word, ModelEntry) pairs once in React context so the Viro
  // scene receives already-resolved entries — no store access inside the scene.
  // Only bundled words (require() sources) are included: pack GLBs load from
  // remote URLs inside ViroReact unreliably. This guarantees all spawned models
  // are local bundled assets that ViroReact can always load.
  const [[wordQueue, modelEntries]] = useState<[string[], ModelEntry[]]>(() => {
    // usePackStore is NOT persisted — it starts empty on every launch, so we
    // cannot call getState().packs here. usePackDownloadStore IS persisted and
    // has localModelPaths keyed by word, making it the reliable source of truth
    // for which words have local GLBs ready to load.
    const dlStore = usePackDownloadStore.getState().packs;
    const remoteModels = useRemoteContentStore.getState().remoteModels;

    // Bundled words — always available, no download required.
    const bundledPairs: Array<[string, ModelEntry]> = Object.entries(MODEL_REGISTRY)
      .map(([w, e]) => [w, e] as [string, ModelEntry]);

    // Downloaded pack words — build ModelEntry directly from local file paths
    // so we never touch HTTPS (unreliable in ViroReact Old Arch).
    const downloadedPairs: Array<[string, ModelEntry]> = [];
    for (const dl of Object.values(dlStore)) {
      if (dl.status !== 'downloaded') continue;
      for (const [word, modelPath] of Object.entries(dl.localModelPaths)) {
        if (MODEL_REGISTRY[word]) continue; // bundled already covers this word
        const remote = remoteModels[word];
        const scale: [number, number, number] = remote
          ? [remote.scale, remote.scale, remote.scale]
          : [0.1, 0.1, 0.1];
        const position: [number, number, number] = remote
          ? [0, remote.positionY, remote.positionZ ?? -1.0]
          : [0, 0, -1.0];
        const audioPath = dl.localAudioPaths[word];
        downloadedPairs.push([word, {
          source: { uri: getModelUriForViro(modelPath, dl.assetVersion) },
          scale,
          position,
          syllables: remote?.syllables ?? [word],
          audio: '',
          audioUrl: audioPath ? getAudioUriForPlayback(audioPath) : remote?.audioUrl,
          emoji: '',
          sinhalaLabel: remote?.sinhalaLabel,
        }]);
      }
    }

    const all = shuffleArray([...bundledPairs, ...downloadedPairs]);
    const capped = all.slice(0, POSITIONS.length);
    return [capped.map(p => p[0]), capped.map(p => p[1])];
  });

  const [loadedWords, setLoadedWords] = useState<string[]>([]);
  const [allLoaded, setAllLoaded] = useState(false);
  const loadFadeAnim = useRef(new Animated.Value(1)).current;
  const [isLeaving, setIsLeaving] = useState(false);

  const {
    currentIdx,
    targetWord,
    foundWords,
    score,
    wrongCount,
    gameOver,
    timedOut,
    gameStarted,
    setGameStarted,
    timeLeft,
    feedback,
    feedbackAnim,
    handleCorrect,
    handleWrong,
    stopTimer,
  } = useARGameLoop({ wordQueue });

  const targetModel = modelEntries[wordQueue.indexOf(targetWord)] ?? null;
  const language = useLanguageStore((s) => s.language);

  useEffect(() => {
    loadGameSounds();
    return () => releaseGameSounds();
  }, []);

  const safeGoBack = useCallback(() => {
    stopTimer();
    releaseGameSounds();
    setIsLeaving(true);
    setTimeout(() => navigation.goBack(), 350); // wait for native cleanup
  }, [navigation, stopTimer]);

  const handleModelLoaded = useCallback((word: string) => {
    setLoadedWords((prev) => {
      if (prev.includes(word)) return prev;
      const next = [...prev, word];
      // Use wordQueue.length — only the words actually spawned need to load
      if (next.length >= wordQueue.length) setAllLoaded(true);
      return next;
    });
  }, [wordQueue.length]);

  const onCorrectRef = useRef<(w: string) => void>(() => {});
  const onWrongRef = useRef<(w: string) => void>(() => {});
  const onModelLoadedRef = useRef<(w: string) => void>(() => {});
  useEffect(() => {
    onCorrectRef.current = handleCorrect;
  }, [handleCorrect]);
  useEffect(() => {
    onWrongRef.current = handleWrong;
  }, [handleWrong]);
  useEffect(() => {
    onModelLoadedRef.current = handleModelLoaded;
  }, [handleModelLoaded]);
  const stableOnCorrect = useRef((w: string) =>
    onCorrectRef.current(w)
  ).current;
  const stableOnWrong = useRef((w: string) => onWrongRef.current(w)).current;
  const stableOnModelLoaded = useRef((w: string) =>
    onModelLoadedRef.current(w)
  ).current;

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <View style={[StyleSheet.absoluteFill, isLeaving && { opacity: 0 }]}>
        <ViroARSceneNavigator
          autofocus
          initialScene={{ scene: WordFindScene as any }}
          viroAppProps={{
            targetWord: gameOver ? '' : targetWord,
            foundWords,
            onCorrect: stableOnCorrect,
            onWrong: stableOnWrong,
            onModelLoaded: stableOnModelLoaded,
            randomizedPositions,
            wordPool: wordQueue,
            modelEntries,
          }}
          style={StyleSheet.absoluteFill}
        />
      </View>
      <SafeAreaView style={styles.overlay} pointerEvents="box-none">
        <View style={styles.header} pointerEvents="box-none">
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => {
              Alert.alert('Quit Game?', 'Your progress will be lost.', [
                { text: 'Keep Playing', style: 'cancel' },
                { text: 'Quit', style: 'destructive', onPress: safeGoBack },
              ]);
            }}
            accessibilityLabel="Quit game"
            accessibilityRole="button"
          >
            <Ionicons name="close" size={22} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.scorePill} pointerEvents="none">
            <Text style={styles.scorePillText}>⭐ {score}</Text>
          </View>
          {gameStarted && !gameOver && (
            <View
              style={[
                styles.timerPill,
                timeLeft <= 10 && styles.timerPillUrgent,
              ]}
              pointerEvents="none"
            >
              <Text
                style={[
                  styles.timerText,
                  timeLeft <= 10 && styles.timerTextUrgent,
                ]}
              >
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
        {gameStarted && !gameOver && (
          <View style={styles.targetCard} pointerEvents="none">
            <Text style={styles.tapThe}>TAP THE</Text>
            <Text style={styles.targetEmoji}>{targetModel?.emoji ?? getWordEmoji(targetWord)}</Text>
            <Text style={styles.targetWord}>{targetWord.toUpperCase()}</Text>
            {language === 'si' && targetModel?.sinhalaLabel ? (
              <Text style={styles.targetSinhala}>
                {targetModel.sinhalaLabel}
              </Text>
            ) : null}
          </View>
        )}
        {feedback !== null && (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.feedbackBanner,
              feedback === 'correct'
                ? styles.feedbackGreen
                : styles.feedbackRed,
              { opacity: feedbackAnim },
            ]}
          >
            <View
              style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
            >
              <Ionicons
                name={
                  feedback === 'correct' ? 'checkmark-circle' : 'close-circle'
                }
                size={18}
                color="#FFF"
              />
              <Text style={styles.feedbackText}>
                {feedback === 'correct' ? 'Correct!  +10' : 'Wrong!  -5'}
              </Text>
            </View>
          </Animated.View>
        )}
      </SafeAreaView>
      {!gameStarted && (
        <GameLoadingOverlay
          loadFadeAnim={loadFadeAnim}
          loadedWords={loadedWords}
          allLoaded={allLoaded}
          totalModels={wordQueue.length}
          allWords={wordQueue}
          onStartPlay={() => {
            Animated.timing(loadFadeAnim, {
              toValue: 0,
              duration: 600,
              useNativeDriver: true,
            }).start(() => setGameStarted(true));
          }}
        />
      )}
      <GameOverModal
        gameOver={gameOver}
        timedOut={timedOut}
        wrongCount={wrongCount}
        score={score}
        foundCount={foundWords.length}
        totalCount={wordQueue.length}
        onPlayAgain={() => (navigation as any).replace('ARWordFind')}
        onDone={safeGoBack}
      />
    </View>
  );
};
