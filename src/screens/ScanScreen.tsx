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
import { usePurchaseStore } from '../store/usePurchaseStore';
import { logActivityEvent } from '../services/parentalControlsService';
import { ScanMode } from '../types';
import { HazardAlertOverlay } from '../components/HazardAlertOverlay';
import { styles } from './ScanScreenStyles';

// 📖 Orchestrator for Scan Mode. Heavy logic lives in useScanOCR (camera) and
// useWordSaving (Firestore). Rendering delegated to ScanCameraLayer / ScanOverlayLayer.
export const ScanScreen = () => {
  const navigation = useNavigation();
  const [mode, setMode] = useState<ScanMode>('scan');
  const [activeWord, setActiveWord] = useState<string>('apple');
  const [showWishModal, setShowWishModal] = useState(false);
  const [sceneKey, setSceneKey] = useState(0);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [arLeavingForPlacement, setArLeavingForPlacement] = useState(false);
  // When set, a useEffect fires navigation after mode='scan' is committed to the
  // React tree — ensures ViroARSceneNavigator is fully unmounted before ARPlacement
  // mounts its own navigator (two navigators cannot share the camera).
  const pendingPlacementWord = useRef<string | null>(null);
  const cardAnim = useRef(new Animated.Value(400)).current;
  const packs = usePackStore((s) => s.packs);
  const loadPacks = usePackStore((s) => s.loadPacks);
  useEffect(() => {
    loadPacks();
  }, []);
  // All pack words are scannable so the gate flow triggers correctly.
  // decidePackGate() decides whether to show AR or a gate screen based on
  // pack type + download/purchase state — detection must come first.
  const allSupportedWords = React.useMemo(() => {
    const base = Object.keys(MODEL_REGISTRY);
    const allPackWords = packs.flatMap((p) => p.words);
    return [...new Set([...base, ...allPackWords])];
  }, [packs]);
  const {
    cameraRef,
    device,
    hasPermission,
    isAppActive,
    isFocused,
    matchResult,
    unknownWord,
    setMatchResult,
  } = useScanOCR({ mode, allSupportedWords });
  const {
    isWordSaved,
    checkWordSavedStatus,
    handleSaveWord,
    achievementQueue,
    setAchievementQueue,
  } = useWordSaving({ activeWord, matchResult });
  const { recordView } = useModelCache();
  const isDownloaded = usePackDownloadStore((s) => s.isDownloaded);
  const isPurchased = usePurchaseStore((s) => s.isPurchased);
  const uid = useAuthStore((s) => s.user?.uid);
  // Safety layer — only active in scan mode with camera live
  const { currentHazard, dismissHazard } = useHazardDetection({
    cameraRef,
    isActive: mode === 'scan' && isAppActive && isFocused,
  });

  // Reset wish modal whenever a new unknown word appears
  useEffect(() => {
    setShowWishModal(false);
  }, [unknownWord]);

  // Navigate to ARPlacement only after mode='scan' has been committed — by this
  // point React has unmounted ViroARSceneNavigator, so the camera is free.
  useEffect(() => {
    if (mode === 'scan' && pendingPlacementWord.current) {
      const word = pendingPlacementWord.current;
      pendingPlacementWord.current = null;
      setArLeavingForPlacement(false);
      (navigation as any).navigate('ARPlacement', { word });
    }
  }, [mode, navigation]);

  const handleViewInAR = useCallback(
    async (word?: string) => {
      const target = word ?? matchResult?.word ?? activeWord;

      const gate = decidePackGate(target, packs, isDownloaded);
      if (gate.status === 'gated' && gate.pack) {
        if (uid) {
          logActivityEvent(uid, {
            word: target,
            source: 'pack_gate',
            flagged: false,
          });
        }
        const isPremiumUnpurchased =
          gate.pack.packType === 'premium' && !isPurchased(gate.pack.id);
        const screen = isPremiumUnpurchased ? 'PremiumPackGate' : 'PackGate';
        (navigation as any).navigate(screen, { word: target, pack: gate.pack });
        return;
      }

      try {
        setActiveWord(target);
        setSceneKey((k) => k + 1);
        setModelLoaded(false);
        cardAnim.setValue(400);
        await checkWordSavedStatus(target);
        recordView(target); // fire-and-forget — updates hot model rankings in background
        setMode('ar');
      } catch (e) {
        console.error('[ScanScreen] handleViewInAR:', e);
      }
    },
    [
      matchResult,
      activeWord,
      checkWordSavedStatus,
      cardAnim,
      recordView,
      packs,
      isDownloaded,
      isPurchased,
      uid,
      navigation,
    ]
  );

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
        <HazardAlertOverlay
          visible={!!currentHazard}
          onDismiss={dismissHazard}
        />
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
      {/* opacity:0 hides the navigator without unmounting it — required before
          navigating to ARPlacementScreen so Metal textures release asynchronously */}
      <View style={[styles.arView, { opacity: arLeavingForPlacement ? 0 : 1 }]}>
        <ViroARSceneNavigator
          key={sceneKey}
          initialScene={{ scene: ARWordScene as any }}
          viroAppProps={{ word: activeWord, onModelLoaded: handleModelLoaded }}
          style={styles.arView}
        />
      </View>

      <TouchableOpacity
        style={styles.backButton}
        onPress={handleBackToScan}
        accessibilityLabel="Back to scan mode"
        accessibilityRole="button"
      >
        <Ionicons name="chevron-back" size={22} color="#fff" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.resetButton}
        onPress={() => {
          setSceneKey((k) => k + 1);
          setModelLoaded(false);
          cardAnim.setValue(400);
        }}
        accessibilityLabel="Reload AR model"
        accessibilityRole="button"
      >
        <Ionicons name="refresh" size={20} color="#fff" />
      </TouchableOpacity>

      <ScanOverlayLayer
        activeWord={activeWord}
        cardAnim={cardAnim}
        matchResult={matchResult}
        isWordSaved={isWordSaved}
        onDismiss={dismissCard}
        onSave={handleSaveWord}
        onPlace={() => {
          // 1. Hide navigator (opacity:0) so the user doesn't see a flash.
          // 2. After 350ms Metal release, call handleBackToScan() which sets
          //    mode='scan' and triggers the useEffect above to navigate.
          //    Navigation happens after the React commit so ViroARSceneNavigator
          //    is truly unmounted before ARPlacementScreen mounts its own.
          setArLeavingForPlacement(true);
          pendingPlacementWord.current = activeWord;
          setTimeout(() => handleBackToScan(), 350);
        }}
      />

      <AchievementToast
        queue={achievementQueue}
        onDismissed={() => setAchievementQueue((prev) => prev.slice(1))}
      />
    </View>
  );
};
