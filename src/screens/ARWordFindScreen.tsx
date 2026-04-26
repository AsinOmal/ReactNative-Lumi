import React, { useState, useRef, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, Animated, Alert } from 'react-native';
import { ViroARSceneNavigator } from '@reactvision/react-viro';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { MODEL_REGISTRY } from '../utils/modelRegistry';
import { loadGameSounds, releaseGameSounds } from '../utils/gameSound';
import { config } from '../constants/config';
import { shuffleArray } from '../utils/arrayUtils';

import { GameLoadingOverlay } from '../components/ar/GameLoadingOverlay';
import { GameOverModal } from '../components/ar/GameOverModal';
import { WordFindScene } from '../components/ar/WordFindScene'; // I'll extract this in a moment
import { useARGameLoop } from '../hooks/useARGameLoop';
import { styles } from './ARWordFindScreenStyles';

const ALL_WORDS = Object.keys(MODEL_REGISTRY);

const POSITIONS: [number, number, number][] = [
  [-2.2,  0.6, -1.6], [-1.8, -0.5, -2.2], [-0.8,  0.4, -1.2],
  [ 0.0,  0.8, -2.0], [-0.4, -0.5, -1.7], [ 0.7,  0.5, -1.3],
  [ 1.3, -0.4, -2.3], [ 1.9,  0.3, -1.5], [ 2.4, -0.5, -1.9],
  [ 0.4,  0.1, -2.6],
];

function fmt(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

// 📖 What this does:
// ARWordFindScreen orchestrates the AR Game. Reduced from >630 lines to ~150 lines.
// Manages the Viro AR instance, tracking loading progress, and delegating
// timer/score logic to 'useARGameLoop'.
export const ARWordFindScreen = () => {
  const navigation = useNavigation();

  // Initialize random positions for this session
  const [randomizedPositions] = useState(() => shuffleArray(POSITIONS));
  const [wordQueue] = useState<string[]>(() => shuffleArray(ALL_WORDS));

  const [loadedWords, setLoadedWords] = useState<string[]>([]);
  const [allLoaded, setAllLoaded] = useState(false);
  const loadFadeAnim = useRef(new Animated.Value(1)).current;
  const [isLeaving, setIsLeaving] = useState(false);

  const {
    currentIdx, targetWord, foundWords, score, wrongCount,
    gameOver, timedOut, gameStarted, setGameStarted,
    timeLeft, feedback, feedbackAnim,
    handleCorrect, handleWrong, stopTimer
  } = useARGameLoop({ wordQueue });

  const targetModel = MODEL_REGISTRY[targetWord];

  // Preload SFX
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
    setLoadedWords(prev => {
      if (prev.includes(word)) return prev;
      const next = [...prev, word];
      if (next.length >= config.AR_MODELS_TOTAL) setAllLoaded(true);
      return next;
    });
  }, []);

  // Stable callback refs for Viro Node (AR Component unmounts reset props)
  const onCorrectRef = useRef<(w: string) => void>(() => {});
  const onWrongRef = useRef<(w: string) => void>(() => {});
  const onModelLoadedRef = useRef<(w: string) => void>(() => {});

  useEffect(() => { onCorrectRef.current = handleCorrect; }, [handleCorrect]);
  useEffect(() => { onWrongRef.current = handleWrong; }, [handleWrong]);
  useEffect(() => { onModelLoadedRef.current = handleModelLoaded; }, [handleModelLoaded]);

  const stableOnCorrect = useRef((w: string) => onCorrectRef.current(w)).current;
  const stableOnWrong = useRef((w: string) => onWrongRef.current(w)).current;
  const stableOnModelLoaded = useRef((w: string) => onModelLoadedRef.current(w)).current;

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
          }}
          style={StyleSheet.absoluteFill}
        />
      </View>

      <SafeAreaView style={styles.overlay} pointerEvents="box-none">
        <View style={styles.header} pointerEvents="box-none">
          <TouchableOpacity style={styles.closeBtn} onPress={() => {
            Alert.alert('Quit Game?', 'Your progress will be lost.', [
              { text: 'Keep Playing', style: 'cancel' },
              { text: 'Quit', style: 'destructive', onPress: safeGoBack },
            ]);
          }}>
            <Ionicons name="close" size={22} color="#FFF" />
          </TouchableOpacity>

          <View style={styles.scorePill} pointerEvents="none"><Text style={styles.scorePillText}>⭐ {score}</Text></View>
          {gameStarted && !gameOver && (
            <View style={[styles.timerPill, (timeLeft <= 10) && styles.timerPillUrgent]} pointerEvents="none">
              <Text style={[styles.timerText, (timeLeft <= 10) && styles.timerTextUrgent]}>⏱ {fmt(timeLeft)}</Text>
            </View>
          )}
          <View style={styles.progressPill} pointerEvents="none"><Text style={styles.progressText}>{foundWords.length}/{wordQueue.length}</Text></View>
        </View>

        {gameStarted && !gameOver && (
          <View style={styles.targetCard} pointerEvents="none">
            <Text style={styles.tapThe}>TAP THE</Text>
            <Text style={styles.targetEmoji}>{targetModel?.emoji ?? '❓'}</Text>
            <Text style={styles.targetWord}>{targetWord.toUpperCase()}</Text>
          </View>
        )}

        {feedback !== null && (
          <Animated.View pointerEvents="none" style={[styles.feedbackBanner, feedback === 'correct' ? styles.feedbackGreen : styles.feedbackRed, { opacity: feedbackAnim }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name={feedback === 'correct' ? 'checkmark-circle' : 'close-circle'} size={18} color="#FFF" />
              <Text style={styles.feedbackText}>{feedback === 'correct' ? 'Correct!  +10' : 'Wrong!  -5'}</Text>
            </View>
          </Animated.View>
        )}
      </SafeAreaView>

      {!gameStarted && (
        <GameLoadingOverlay
          loadFadeAnim={loadFadeAnim} loadedWords={loadedWords}
          allLoaded={allLoaded} totalModels={config.AR_MODELS_TOTAL}
          allWords={ALL_WORDS}
          onStartPlay={() => {
            Animated.timing(loadFadeAnim, { toValue: 0, duration: 600, useNativeDriver: true }).start(() => setGameStarted(true));
          }}
        />
      )}

      <GameOverModal
        gameOver={gameOver} timedOut={timedOut} wrongCount={wrongCount}
        score={score} foundCount={foundWords.length} totalCount={wordQueue.length}
        onPlayAgain={() => (navigation as any).replace('ARWordFind')}
        onDone={safeGoBack}
      />
    </View>
  );
};
