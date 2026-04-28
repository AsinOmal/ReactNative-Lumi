// 📖 What this does:
// Pure AR model viewer — child browses every 3D model in a pack, one at a time.
// No achievements, no daily-hunt tracking, no scan scoring. Preview-only.
//
// ViroNode reads viroAppProps once at mount, so word changes require a full
// ViroARSceneNavigator remount via sceneKey (same pattern as MakeAMealScreen).
// safeGoBack hides the view for 350ms before navigation so Metal textures release.

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, SafeAreaView, StatusBar,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { ViroARSceneNavigator } from '@reactvision/react-viro';
import { useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ARWordScene } from '../components/ar/ARWordScene';
import { Pack } from '../services/packService';
import { MODEL_REGISTRY } from '../utils/modelRegistry';
import { styles } from './PackARPreviewScreenStyles';

export const PackARPreviewScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { pack } = route.params as { pack: Pack };

  const [currentIndex, setCurrentIndex] = useState(0);
  const [sceneKey, setSceneKey] = useState(0);
  const [isLeaving, setIsLeaving] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);

  const currentWord = pack.words[currentIndex];
  const model = MODEL_REGISTRY[currentWord];

  // Double-ref stable callback — ViroNode reads viroAppProps once at mount
  const onLoadedRef = useRef<() => void>(() => {});
  useEffect(() => { onLoadedRef.current = () => setModelLoaded(true); }, []);
  const stableOnLoaded = useRef(() => onLoadedRef.current()).current;

  const safeGoBack = useCallback(() => {
    setIsLeaving(true);
    setTimeout(() => navigation.goBack(), 350);
  }, [navigation]);

  const goTo = useCallback((idx: number) => {
    setCurrentIndex(idx);
    setModelLoaded(false);
    setSceneKey(k => k + 1);
  }, []);

  const canPrev = currentIndex > 0;
  const canNext = currentIndex < pack.words.length - 1;

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      {/* AR scene — full screen, hidden during exit */}
      <View style={[{ flex: 1 }, isLeaving && { opacity: 0 }]}>
        <ViroARSceneNavigator
          key={sceneKey}
          autofocus
          initialScene={{ scene: ARWordScene as any }}
          viroAppProps={{ word: currentWord, onModelLoaded: stableOnLoaded }}
          style={{ flex: 1 }}
        />
      </View>

      {/* Overlay */}
      <SafeAreaView style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} pointerEvents="box-none">
        {/* Header */}
        <View style={styles.header} pointerEvents="box-none">
          <TouchableOpacity style={styles.closeBtn} onPress={safeGoBack} accessibilityLabel="Close AR preview" accessibilityRole="button">
            <Ionicons name="close" size={20} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{pack.name}</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Bottom info card */}
        <View style={styles.bottomCard} pointerEvents="box-none">
          <Text style={styles.wordName}>
            {currentWord.charAt(0).toUpperCase() + currentWord.slice(1)}
          </Text>

          {model?.syllables && (
            <View style={styles.syllableRow}>
              {model.syllables.map((s, i) => (
                <View key={i} style={styles.syllableChip}>
                  <Text style={styles.syllableText}>{s}</Text>
                </View>
              ))}
            </View>
          )}

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
            <Text style={styles.navCounter}>{currentIndex + 1} of {pack.words.length}</Text>
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
        <View style={styles.loadingCover} pointerEvents="none">
          <ActivityIndicator size="large" color="#A78BFA" />
          <Text style={styles.loadingText}>Loading {currentWord}...</Text>
        </View>
      )}
    </View>
  );
};
