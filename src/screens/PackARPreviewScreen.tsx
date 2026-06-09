// 📖 Pure AR model viewer — browses every model in a pack one at a time.
// ViroNode reads viroAppProps once at mount, so word changes require a full
// ViroARSceneNavigator remount via sceneKey. safeGoBack hides the view 350ms
// before navigation so Metal textures release.

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { ViroARSceneNavigator } from '@reactvision/react-viro';
import { useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { ARWordScene } from '../components/ar/ARWordScene';
import { RotateHint } from '../components/ar/RotateHint';
import { SyllablePlayer } from '../components/ar/SyllablePlayer';
import type { Pack } from '../types/pack';
import { getModel } from '../utils/modelRegistry';
import { getRandomFact } from '../utils/wordFacts';
import { useAmbientPauseOnFocus } from '../hooks/useAmbientPauseOnFocus';
import { useRotateHint } from '../hooks/useRotateHint';
import { useSwipeRotation } from '../hooks/useSwipeRotation';
import { useAuthStore } from '../store/useAuthStore';
import { logPackPreviewSession } from '../services/packPreviewAnalyticsService';
import { reportModelLoadIssue } from '../services/modelReportService';
import { styles } from './PackARPreviewScreenStyles';

const LOAD_TIMEOUT_MS = 5_000;

export const PackARPreviewScreen = () => {
  useAmbientPauseOnFocus();
  const navigation = useNavigation();
  const route = useRoute();
  const { pack } = route.params as { pack: Pack };

  const [currentIndex, setCurrentIndex] = useState(0);
  const [sceneKey, setSceneKey] = useState(0);
  const [isLeaving, setIsLeaving] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [loadTimedOut, setLoadTimedOut] = useState(false);
  const [modelFailed, setModelFailed] = useState(false);
  const [reportSending, setReportSending] = useState(false);
  const [reportSent, setReportSent] = useState(false);
  const loadAttemptRef = useRef(0);
  const showRotateHint = useRotateHint(modelLoaded);
  const { rotationApiRef, panHandlers } = useSwipeRotation();
  const uid = useAuthStore((s) => s.user?.uid);
  const email = useAuthStore((s) => s.user?.email ?? '');

  const currentWord = pack.words[currentIndex] ?? '';
  const wordDisplay =
    currentWord.charAt(0).toUpperCase() + currentWord.slice(1);
  const model = getModel(currentWord);
  const fact = getRandomFact(currentWord);
  const sessionRef = useRef<{
    word: string;
    startedAt: number;
    completedLoad: boolean;
    loadTimedOut: boolean;
  } | null>(null);

  const closeSession = useCallback(() => {
    const session = sessionRef.current;
    sessionRef.current = null;
    if (!uid || !session) {
      return;
    }
    const endedAt = Date.now();
    logPackPreviewSession(uid, {
      packId: pack.id,
      packName: pack.name,
      word: session.word,
      startedAt: session.startedAt,
      endedAt,
      durationMs: Math.max(0, endedAt - session.startedAt),
      completedLoad: session.completedLoad,
      loadTimedOut: session.loadTimedOut,
    });
  }, [pack.id, pack.name, uid]);

  useEffect(() => {
    sessionRef.current = {
      word: currentWord,
      startedAt: Date.now(),
      completedLoad: false,
      loadTimedOut: false,
    };
    return closeSession;
  }, [closeSession, currentWord]);

  // Double-ref stable callback — ViroNode reads viroAppProps once at mount
  const onLoadedRef = useRef<() => void>(() => {});
  useEffect(() => {
    onLoadedRef.current = () => {
      if (sessionRef.current) {
        sessionRef.current.completedLoad = true;
      }
      setModelLoaded(true);
      setLoadTimedOut(false);
      setModelFailed(false);
    };
  }, []);
  const stableOnLoaded = useRef(() => onLoadedRef.current()).current;
  const stableOnError = useRef(() => {
    if (sessionRef.current) {
      sessionRef.current.loadTimedOut = true;
    }
    setModelFailed(true);
  }).current;

  useEffect(() => {
    if (modelLoaded) {
      return;
    }
    const attemptId = loadAttemptRef.current;
    const t = setTimeout(() => {
      if (attemptId !== loadAttemptRef.current) {
        return;
      }
      if (sessionRef.current) {
        sessionRef.current.loadTimedOut = true;
      }
      setLoadTimedOut(true);
      setModelFailed((failed) => failed || !model);
    }, LOAD_TIMEOUT_MS);
    return () => clearTimeout(t);
  }, [currentWord, model, modelLoaded, sceneKey]);

  const safeGoBack = useCallback(() => {
    closeSession();
    setIsLeaving(true);
    setTimeout(() => navigation.goBack(), 350);
  }, [closeSession, navigation]);

  const goTo = useCallback((idx: number) => {
    loadAttemptRef.current += 1;
    setCurrentIndex(idx);
    setModelLoaded(false);
    setLoadTimedOut(false);
    setModelFailed(false);
    setReportSending(false);
    setReportSent(false);
    setSceneKey((k) => k + 1);
  }, []);

  const retry = useCallback(() => {
    closeSession();
    loadAttemptRef.current += 1;
    sessionRef.current = {
      word: currentWord,
      startedAt: Date.now(),
      completedLoad: false,
      loadTimedOut: false,
    };
    setModelLoaded(false);
    setLoadTimedOut(false);
    setModelFailed(false);
    setReportSending(false);
    setReportSent(false);
    setSceneKey((k) => k + 1);
  }, [closeSession, currentWord]);

  const canPrev = currentIndex > 0;
  const canNext = currentIndex < pack.words.length - 1;
  const skipTarget = canNext
    ? currentIndex + 1
    : canPrev
    ? currentIndex - 1
    : null;

  const handleSkip = useCallback(() => {
    if (skipTarget !== null) {
      goTo(skipTarget);
    }
  }, [goTo, skipTarget]);

  const handleReport = useCallback(async () => {
    if (!uid || reportSending || reportSent) {
      return;
    }
    setReportSending(true);
    try {
      await reportModelLoadIssue({
        uid,
        email,
        packId: pack.id,
        packName: pack.name,
        word: currentWord,
        durationMs: LOAD_TIMEOUT_MS,
        sceneKey,
      });
      setReportSent(true);
    } catch (e) {
      console.error('[PackARPreviewScreen] report model load issue:', e);
    } finally {
      setReportSending(false);
    }
  }, [
    currentWord,
    email,
    pack.id,
    pack.name,
    reportSending,
    reportSent,
    sceneKey,
    uid,
  ]);

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      {/* AR scene — full screen, hidden during exit */}
      <View style={[{ flex: 1 }, isLeaving && { opacity: 0 }]}>
        <ViroARSceneNavigator
          key={sceneKey}
          autofocus
          initialScene={{ scene: ARWordScene as any }}
          viroAppProps={{
            word: currentWord,
            onModelLoaded: stableOnLoaded,
            onModelError: stableOnError,
            rotationApiRef,
          }}
          style={{ flex: 1 }}
        />
        {/* Transparent gesture catcher above the AR view. Buttons sit higher
            in the tree (SafeAreaView overlay) so they still receive taps. */}
        <View style={StyleSheet.absoluteFillObject} {...panHandlers} />
      </View>
      <LinearGradient
        colors={['rgba(0,0,0,0.36)', 'rgba(0,0,0,0)']}
        style={styles.topGradient}
        pointerEvents="none"
      />
      <LinearGradient
        colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.42)']}
        style={styles.bottomGradient}
        pointerEvents="none"
      />

      {/* Overlay */}
      <SafeAreaView
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        pointerEvents="box-none"
      >
        {/* Header */}
        <View style={styles.header} pointerEvents="box-none">
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={safeGoBack}
            accessibilityLabel="Close AR preview"
            accessibilityRole="button"
          >
            <Ionicons name="close" size={20} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{pack.name}</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Bottom info card */}
        <View style={styles.bottomCard} pointerEvents="box-none">
          <Text style={styles.wordName}>{wordDisplay}</Text>
          <Text style={styles.packLabel}>{pack.name}</Text>

          <SyllablePlayer entry={model} />

          <View style={styles.factBox}>
            <Ionicons name="bulb-outline" size={16} color="#C8840A" />
            <Text style={styles.factText}>{fact}</Text>
          </View>

          <View style={styles.navRow} pointerEvents="auto">
            <TouchableOpacity
              style={[styles.navBtn, !canPrev && styles.navBtnDisabled]}
              onPress={() => canPrev && goTo(currentIndex - 1)}
              disabled={!canPrev}
              accessibilityLabel="Previous word"
              accessibilityRole="button"
            >
              <Ionicons name="chevron-back" size={22} color="#5B2DC0" />
            </TouchableOpacity>
            <Text style={styles.navCounter}>
              {currentIndex + 1} of {pack.words.length}
            </Text>
            <TouchableOpacity
              style={[styles.navBtn, !canNext && styles.navBtnDisabled]}
              onPress={() => canNext && goTo(currentIndex + 1)}
              disabled={!canNext}
              accessibilityLabel="Next word"
              accessibilityRole="button"
            >
              <Ionicons name="chevron-forward" size={22} color="#5B2DC0" />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      {/* Loading cover — shown until model reports onLoadEnd */}
      {!modelLoaded && (
        <View style={styles.loadingCover} pointerEvents="box-none">
          {loadTimedOut ? (
            <View style={styles.slowCard} pointerEvents="auto">
              <Ionicons name="timer-outline" size={30} color="#C96B00" />
              <Text style={styles.slowTitle}>
                This model is taking too long
              </Text>
              <Text style={styles.slowBody}>
                {modelFailed
                  ? 'This model had trouble loading. You can report it or skip to another model.'
                  : 'You can report it or skip to another model.'}
              </Text>
              {reportSent ? (
                <Text style={styles.reportSentText}>Report sent</Text>
              ) : null}
              <View style={styles.slowActions}>
                <TouchableOpacity
                  style={styles.tryAgainBtn}
                  onPress={handleReport}
                  disabled={reportSending || reportSent || !uid}
                  accessibilityRole="button"
                >
                  <Text style={styles.tryAgainText}>
                    {reportSending
                      ? 'Sending...'
                      : reportSent
                      ? 'Sent'
                      : 'Report'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.slowNavBtn,
                    skipTarget === null && styles.navBtnDisabled,
                  ]}
                  onPress={handleSkip}
                  disabled={skipTarget === null}
                  accessibilityRole="button"
                >
                  <Text style={styles.slowNavText}>Skip</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.slowNavBtn}
                  onPress={retry}
                  accessibilityRole="button"
                >
                  <Text style={styles.slowNavText}>Try again</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <>
              <ActivityIndicator size="large" color="#A78BFA" />
              <Text style={styles.loadingText}>Loading {currentWord}...</Text>
            </>
          )}
        </View>
      )}

      <RotateHint
        visible={showRotateHint}
        label={`Swipe to rotate the ${currentWord}`}
      />
    </View>
  );
};
