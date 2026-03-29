import React, { useState, useRef, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated, ScrollView, StatusBar } from 'react-native';
import { ViroARSceneNavigator } from '@reactvision/react-viro';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { ARWordScene } from '../components/ar/ARWordScene';
import { AchievementToast } from '../components/AchievementToast';
import { ScanCameraLayer } from '../components/scan/ScanCameraLayer';
import { ScanOverlayLayer } from '../components/scan/ScanOverlayLayer';

import { useScanOCR } from '../hooks/useScanOCR';
import { useWordSaving } from '../hooks/useWordSaving';
import { MODEL_REGISTRY } from '../utils/modelRegistry';
import { wishWord } from '../utils/wishlistStore';
import { ScanMode } from '../types';
import { styles } from './ScanScreenStyles';

const ALL_SUPPORTED_WORDS = Object.keys(MODEL_REGISTRY);

// 📖 What this does:
// The main orchestrator screen for Scan Mode. Reduced from 607 lines to < 100 lines.
// It uses `useScanOCR` for the heavy camera logic and `useWordSaving` for Firestore logic.
// It delegates rendering to `ScanCameraLayer` and `ScanOverlayLayer`.
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

  // Reset wish modal whenever a new unknown word appears
  useEffect(() => { setShowWishModal(false); }, [unknownWord]);

  const handleViewInAR = useCallback(async (word?: string) => {
    const target = word ?? matchResult?.word ?? activeWord;
    setActiveWord(target);
    setSceneKey(k => k + 1);
    setModelLoaded(false);
    cardAnim.setValue(400);

    await checkWordSavedStatus(target);
    setMode('ar');
  }, [matchResult, activeWord, checkWordSavedStatus, cardAnim]);

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

        {/* Word chip row — manual override */}
        <View style={styles.wordSelectorWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.wordSelectorContent}>
            {ALL_SUPPORTED_WORDS.map((word) => (
              <TouchableOpacity key={word} style={[styles.wordChip, activeWord === word && styles.wordChipActive]} onPress={() => handleViewInAR(word)} activeOpacity={0.8}>
                <Text style={[styles.wordChipText, activeWord === word && styles.wordChipTextActive]}>{word}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ViroARSceneNavigator key={sceneKey} initialScene={{ scene: ARWordScene as any }} viroAppProps={{ word: activeWord, onModelLoaded: handleModelLoaded }} style={styles.arView} />

      <TouchableOpacity style={styles.backButton} onPress={handleBackToScan}>
        <Ionicons name="chevron-back" size={22} color="#fff" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.resetButton} onPress={() => { setSceneKey(k => k + 1); setModelLoaded(false); cardAnim.setValue(400); }}>
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
