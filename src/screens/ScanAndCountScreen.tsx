// Orchestrator for Scan & Count — loading → intro → playing → roundWon → sessionComplete.

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { ViroARSceneNavigator } from '@reactvision/react-viro';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ScanAndCountScene } from '../components/ar/ScanAndCountScene';
import { CounterOverlay } from '../components/scanAndCount/CounterOverlay';
import { RoundChallenge } from '../components/scanAndCount/RoundChallenge';
import { TimerBar } from '../components/scanAndCount/TimerBar';
import { useScanAndCount } from '../hooks/useScanAndCount';
import { useAuthStore } from '../store/useAuthStore';
import { useParentalControlsStore } from '../store/useParentalControlsStore';
import { useAmbientPauseOnFocus } from '../hooks/useAmbientPauseOnFocus';
import { shuffleArray } from '../utils/arrayUtils';
import { styles } from './ScanAndCountScreenStyles';

type GamePhase =
  | 'loading'
  | 'intro'
  | 'playing'
  | 'roundWon'
  | 'sessionComplete';

// prettier-ignore
const SPAWN_POSITIONS: [number, number, number][] = [
  [-1.5,0.3,-2.0],[0.0,0.5,-1.8],[1.5,0.3,-2.0],[-1.2,-0.3,-2.2],[1.2,-0.3,-2.2],
  [0.0,-0.2,-2.5],[-0.8,0.8,-1.5],[0.8,0.8,-1.5],[0.0,0.0,-1.5],[-1.8,0.0,-2.0],
  [1.8,0.0,-2.0],[0.0,1.0,-2.0],[-0.5,-0.6,-1.8],[0.5,0.6,-1.8],
];

export const ScanAndCountScreen = () => {
  useAmbientPauseOnFocus();
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const timedMode =
    useParentalControlsStore().settings?.timedModeEnabled ?? false;

  const [phase, setPhase] = useState<GamePhase>('loading');
  const [sceneKey, setSceneKey] = useState(0);
  const [isLeaving, setIsLeaving] = useState(false);
  const [positions, setPositions] = useState<[number, number, number][]>(() =>
    shuffleArray(SPAWN_POSITIONS)
  );
  const feedbackAnim = useRef(new Animated.Value(0)).current;

  const cbRef = useRef({
    onRound: () => {},
    onSession: () => {},
    onDistractor: () => {},
  });

  const {
    loading,
    currentRound,
    totalRounds,
    targetWord,
    targetCount,
    distractors,
    foundIndices,
    targetLoadedCount,
    advanceRound,
    stableOnTargetTap,
    stableOnDistractorTap,
    stableOnModelLoaded,
  } = useScanAndCount({
    uid: user?.uid ?? null,
    onRoundComplete: useCallback(() => cbRef.current.onRound(), []),
    onSessionComplete: useCallback(() => cbRef.current.onSession(), []),
    onDistractorTap: useCallback(() => cbRef.current.onDistractor(), []),
  });

  useEffect(() => {
    if (!loading && phase === 'loading') {
      setPhase('intro');
    }
  }, [loading, phase]);

  const safeGoBack = useCallback(() => {
    setIsLeaving(true);
    setTimeout(() => navigation.goBack(), 350);
  }, [navigation]);

  const handleRoundComplete = useCallback(() => {
    setPhase('roundWon');
    setTimeout(() => {
      advanceRound();
      setPositions(shuffleArray(SPAWN_POSITIONS));
      setSceneKey((k) => k + 1);
      setPhase('intro');
    }, 1200);
  }, [advanceRound]);

  const handleSessionComplete = useCallback(
    () => setPhase('sessionComplete'),
    []
  );

  const handleDistractorFeedback = useCallback(() => {
    feedbackAnim.setValue(1);
    Animated.timing(feedbackAnim, {
      toValue: 0,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [feedbackAnim]);

  const handleTimeout = useCallback(() => {
    if (currentRound + 1 >= totalRounds) {
      handleSessionComplete();
    } else {
      handleRoundComplete();
    }
  }, [currentRound, totalRounds, handleRoundComplete, handleSessionComplete]);

  cbRef.current = {
    onRound: handleRoundComplete,
    onSession: handleSessionComplete,
    onDistractor: handleDistractorFeedback,
  };

  const arMounted = phase !== 'loading' && phase !== 'sessionComplete';
  // Gate on target models only — distractors pop in after; child can start counting sooner
  const allLoaded = targetLoadedCount >= targetCount && targetCount > 0;

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      {arMounted && (
        <View style={[{ flex: 1 }, isLeaving && { opacity: 0 }]}>
          <ViroARSceneNavigator
            key={sceneKey}
            autofocus
            initialScene={{ scene: ScanAndCountScene as any }}
            viroAppProps={{
              targetWord,
              targetCount,
              distractors,
              foundIndices,
              positions,
              onTargetTap: stableOnTargetTap,
              onDistractorTap: stableOnDistractorTap,
              onModelLoaded: stableOnModelLoaded,
            }}
            style={{ flex: 1 }}
          />
        </View>
      )}

      <SafeAreaView
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        pointerEvents="box-none"
      >
        <View style={styles.header} pointerEvents="box-none">
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={safeGoBack}
            pointerEvents="auto"
            accessibilityLabel="Exit game"
            accessibilityRole="button"
          >
            <Ionicons name="close" size={20} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.headerSpacer} />
          {arMounted && (
            <View style={styles.roundPill}>
              <Text style={styles.roundPillText}>
                Round {currentRound + 1} / {totalRounds}
              </Text>
            </View>
          )}
        </View>

        {phase === 'playing' && (
          <>
            <CounterOverlay
              targetWord={targetWord}
              found={foundIndices.length}
              target={targetCount}
            />
            {timedMode && <TimerBar key={sceneKey} onTimeout={handleTimeout} />}
            <Animated.View
              style={[styles.wrongBanner, { opacity: feedbackAnim }]}
              pointerEvents="none"
            >
              <Text style={styles.wrongText}>❌ Not that one!</Text>
            </Animated.View>
          </>
        )}
      </SafeAreaView>

      {arMounted && !allLoaded && phase !== 'roundWon' && (
        <View style={styles.loadingCover} pointerEvents="none">
          <ActivityIndicator size="large" color="#A78BFA" />
          <Text style={styles.loadingText}>Setting up the scene...</Text>
        </View>
      )}

      {phase === 'intro' && allLoaded && (
        <RoundChallenge
          targetWord={targetWord}
          targetCount={targetCount}
          currentRound={currentRound}
          totalRounds={totalRounds}
          onDismiss={() => setPhase('playing')}
        />
      )}

      {phase === 'roundWon' && (
        <View style={styles.roundWonOverlay} pointerEvents="none">
          <Text style={styles.roundWonText}>🎉 Round Complete!</Text>
        </View>
      )}

      {phase === 'sessionComplete' && (
        <View style={styles.sessionOverlay}>
          <Text style={styles.sessionEmoji}>🏆</Text>
          <Text style={styles.sessionTitle}>Session Complete!</Text>
          <Text style={styles.sessionSub}>Amazing counting skills!</Text>
          <TouchableOpacity
            style={styles.doneBtn}
            onPress={safeGoBack}
            activeOpacity={0.85}
            accessibilityLabel="Done, exit session"
            accessibilityRole="button"
          >
            <Text style={styles.doneBtnText}>Done!</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};
