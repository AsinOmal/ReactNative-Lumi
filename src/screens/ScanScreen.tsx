import React, { useState, useRef, useCallback, useEffect } from 'react';
import { View, TouchableOpacity, Animated, StatusBar } from 'react-native';
import { ViroARSceneNavigator } from '@reactvision/react-viro';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { ARWordScene } from '../components/ar/ARWordScene';
import { AchievementToast } from '../components/AchievementToast';
import { ScanCameraLayer } from '../components/scan/ScanCameraLayer';
import { ScanOverlayLayer } from '../components/scan/ScanOverlayLayer';

import { useScanOCR } from '../hooks/useScanOCR';
import { useWordSaving } from '../hooks/useWordSaving';
import { useHazardDetection } from '../hooks/useHazardDetection';
import { useModelCache } from '../hooks/useModelCache';
import { MODEL_REGISTRY } from '../utils/modelRegistry';
import { wishWord } from '../utils/wishlistStore';
import { decidePackGate } from '../utils/packUtils';
import { usePackStore } from '../store/usePackStore';
import { usePackDownloadStore } from '../store/usePackDownloadStore';
import { useAuthStore } from '../store/useAuthStore';
import { logActivityEvent } from '../services/parentalControlsService';
import { ScanMode } from '../types';
import { HazardAlertOverlay } from '../components/HazardAlertOverlay';
import { styles } from './ScanScreenStyles';
const ALL_SUPPORTED_WORDS = Object.keys(MODEL_REGISTRY);

// 📖 Orchestrator for Scan Mode. Heavy logic lives in useScanOCR (camera) and
// useWordSaving (Firestore). Rendering delegated to ScanCameraLayer / ScanOverlayLayer.
export const ScanScreen = () => {
  const navigation = useNavigation();
  const [mode, setMode] = useState<ScanMode>('scan');
  const [activeWord, setActiveWord] = useState<string>('apple');
  const [showWishModal, setShowWishModal] = useState(false);
  const [sceneKey, setSceneKey] = useState(0);
  const [modelLoaded, setModelLoaded] = useState(false);
  const cardAnim = useRef(new Animated.Value(400)).current;
  const { cameraRef, device, hasPermission, isAppActive, isFocused, matchResult, unknownWord, setMatchResult, setUnknownWord } = useScanOCR({ mode, allSupportedWords: ALL_SUPPORTED_WORDS });
  const { isWordSaved, checkWordSavedStatus, handleSaveWord, achievementQueue, setAchievementQueue } = useWordSaving({ activeWord, matchResult });
  const { recordView } = useModelCache();
  const packs        = usePackStore(s => s.packs);
  const isDownloaded = usePackDownloadStore(s => s.isDownloaded);
  const uid          = useAuthStore(s => s.user?.uid);
  // Safety layer — only active in scan mode with camera live
  const { currentHazard, dismissHazard } = useHazardDetection({
    cameraRef,
    isActive: mode === 'scan' && isAppActive && isFocused,
  });

  // Reset wish modal whenever a new unknown word appears
  useEffect(() => { setShowWishModal(false); }, [unknownWord]);

  const handleViewInAR = useCallback(async (word?: string) => {
    const target = word ?? matchResult?.word ?? activeWord;

    const gate = decidePackGate(target, packs, isDownloaded);
    if (gate.status === 'gated' && gate.pack) {
      if (uid) logActivityEvent(uid, { word: target, source: 'pack_gate', flagged: false });
      (navigation as any).navigate('PackGate', { word: target, pack: gate.pack });
      return;
    }

    try {
      setActiveWord(target);
      setSceneKey(k => k + 1);
      setModelLoaded(false);
      cardAnim.setValue(400);
      await checkWordSavedStatus(target);
      recordView(target); // fire-and-forget — updates hot model rankings in background
      setMode('ar');
    } catch (e) {
      console.error('[ScanScreen] handleViewInAR:', e);
    }
  }, [matchResult, activeWord, checkWordSavedStatus, cardAnim, recordView, packs, isDownloaded, uid, navigation]);

  const handleBackToScan = useCallback(() => {
    setMode('scan');
    setMatchResult(null);
    setModelLoaded(false);
    cardAnim.setValue(400);
  }, [cardAnim, setMatchResult]);

  const handleModelLoaded = useCallback(() => {
    setModelLoaded(true);
    Animated.spring(cardAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 60,
      friction: 9,
    }).start();
  }, [cardAnim]);

  const dismissCard = useCallback(() => {
    Animated.timing(cardAnim, {
      toValue: 400,
      duration: 250,
      useNativeDriver: true,
    }).start(() => setModelLoaded(false));
  }, [cardAnim]);

  if (mode === 'scan') {
    return (
      <View style={styles.container}>
        <HazardAlertOverlay visible={!!currentHazard} onDismiss={dismissHazard} />
        <ScanCameraLayer
          device={device}
          hasPermission={hasPermission}
          isAppActive={isAppActive}
          isFocused={isFocused}
          cameraRef={cameraRef}
          matchResultWord={matchResult?.word ?? null}
          unknownWord={unknownWord}
          showWishModal={showWishModal}
          setShowWishModal={setShowWishModal}
          onViewInAR={() => handleViewInAR()}
          onWishPress={async () => {
            if (unknownWord) {
              await wishWord(unknownWord);
              setShowWishModal(true);
            }
          }}
          onBackPress={() => navigation.goBack()}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ViroARSceneNavigator key={sceneKey} initialScene={{ scene: ARWordScene as any }} viroAppProps={{ word: activeWord, onModelLoaded: handleModelLoaded }} style={styles.arView} />

      <TouchableOpacity style={styles.backButton} onPress={handleBackToScan} accessibilityLabel="Back to scan mode" accessibilityRole="button">
        <Ionicons name="chevron-back" size={22} color="#fff" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.resetButton} onPress={() => { setSceneKey(k => k + 1); setModelLoaded(false); cardAnim.setValue(400); }} accessibilityLabel="Reload AR model" accessibilityRole="button">
        <Ionicons name="refresh" size={20} color="#fff" />
      </TouchableOpacity>

      <ScanOverlayLayer
        activeWord={activeWord}
        cardAnim={cardAnim}
        matchResult={matchResult}
        isWordSaved={isWordSaved}
        onDismiss={dismissCard}
        onSave={handleSaveWord}
      />

      <AchievementToast queue={achievementQueue} onDismissed={() => setAchievementQueue(prev => prev.slice(1))} />
    </View>
  );
};
