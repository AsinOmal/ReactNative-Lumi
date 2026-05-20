import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  Animated,
  StatusBar,
  StyleSheet,
} from 'react-native';
import { ViroARSceneNavigator } from '@reactvision/react-viro';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { ARWordScene } from '../components/ar/ARWordScene';
import { RotateHint } from '../components/ar/RotateHint';
import { AchievementToast } from '../components/AchievementToast';
import { ScanCameraLayer } from '../components/scan/ScanCameraLayer';
import { ScanOverlayLayer } from '../components/scan/ScanOverlayLayer';

import { useScanOCR } from '../hooks/useScanOCR';
import { useWordSaving } from '../hooks/useWordSaving';
import { useHazardDetection } from '../hooks/useHazardDetection';
import { useModelCache } from '../hooks/useModelCache';
import { useAmbientPauseOnFocus } from '../hooks/useAmbientPauseOnFocus';
import { useRotateHint } from '../hooks/useRotateHint';
import { useSwipeRotation } from '../hooks/useSwipeRotation';
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
  useAmbientPauseOnFocus();
  const navigation = useNavigation();
  const [mode, setMode] = useState<ScanMode>('scan');
  const [activeWord, setActiveWord] = useState<string>('apple');
  const [showWishModal, setShowWishModal] = useState(false);
  const [sceneKey, setSceneKey] = useState(0);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [arLeavingForPlacement, setArLeavingForPlacement] = useState(false);
  const showRotateHint = useRotateHint(mode === 'ar' && modelLoaded);
  const { rotationApiRef, panHandlers } = useSwipeRotation();
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

  // After mode='scan' commits, ViroARSceneNavigator is unmounted and Metal
  // resource release begins — but it is asynchronous. Wait 350ms before
  // mounting ARPlacement's own navigator so the two sessions don't race
  // for the same ARKit device.
  useEffect(() => {
    if (mode === 'scan' && pendingPlacementWord.current) {
      const word = pendingPlacementWord.current;
      pendingPlacementWord.current = null;
      const t = setTimeout(() => {
        setArLeavingForPlacement(false);
        (navigation as any).navigate('ARPlacement', { word });
      }, 350);
      return () => clearTimeout(t);
    }
  }, [mode, navigation]);

  const handleViewInAR = useCallback(
    async (word?: string) => {
      const target = word ?? matchResult?.word ?? activeWord;

      const gate = decidePackGate(target, packs, isDownloaded, isPurchased);
      if (gate.status === 'gated' && gate.pack) {
        if (uid) {
          logActivityEvent(uid, {
            word: target,
            source: 'pack_gate',
            flagged: false,
          });
        }
        // Read isPremium (the visible admin toggle), not packType. A paid
        // pack with packType: 'bundled' must still hit the paywall, not the
        // download gate.
        const isPremiumUnpurchased =
          gate.pack.isPremium && !isPurchased(gate.pack.id);
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
      <View style={[styles.container, arLeavingForPlacement && { opacity: 0 }]}>
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
      <View
        style={[styles.arView, { opacity: arLeavingForPlacement ? 0 : 1 }]}
      >
        <ViroARSceneNavigator
          key={sceneKey}
          initialScene={{ scene: ARWordScene as any }}
          viroAppProps={{
            word: activeWord,
            onModelLoaded: handleModelLoaded,
            rotationApiRef,
          }}
          style={styles.arView}
        />
        {/* Transparent swipe-catcher above the AR view */}
        <View style={StyleSheet.absoluteFillObject} {...panHandlers} />
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
          // Hide Viro immediately (opacity:0) then unmount it in the same
          // render cycle by calling handleBackToScan() synchronously.
          // The useEffect above waits 350ms after unmount before navigating,
          // giving ARKit time to release its Metal session.
          setArLeavingForPlacement(true);
          pendingPlacementWord.current = activeWord;
          handleBackToScan();
        }}
      />

      <AchievementToast
        queue={achievementQueue}
        onDismissed={() => setAchievementQueue((prev) => prev.slice(1))}
      />

      <RotateHint visible={showRotateHint} />
    </View>
  );
};
