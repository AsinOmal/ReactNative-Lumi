// 📖 What this does:
// Full-screen AR tap-to-place experience. Three overlays based on placement state:
//   searching — pulsing hint, point at a flat surface
//   placed    — word name + "Place Again" to reset
//   timeout   — "No surface found" card with Try Again / Go Back
// ViroARSceneNavigator hidden via opacity:0 before goBack (Metal texture release pattern).

import React, { useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StatusBar,
  StyleSheet,
} from 'react-native';
import { ViroARSceneNavigator } from '@reactvision/react-viro';
import { useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { PlacementScene } from '../components/ar/PlacementScene';
import { useARPlacement } from '../hooks/useARPlacement';
import { useStrings } from '../hooks/useStrings';
import { useAmbientPauseOnFocus } from '../hooks/useAmbientPauseOnFocus';
import { useSwipeRotation } from '../hooks/useSwipeRotation';
import { colors } from '../constants/colors';
import { styles } from './ARPlacementScreenStyles';

export const ARPlacementScreen = () => {
  useAmbientPauseOnFocus();
  const strings = useStrings();
  const insets = useSafeAreaInsets();
  const route = useRoute();
  const { word } = route.params as { word: string };
  const wordDisplay = word.charAt(0).toUpperCase() + word.slice(1);
  const { state, isLeaving, sceneKey, onPlaneSelected, onReplace, safeGoBack } =
    useARPlacement();
  const { rotationApiRef, panHandlers } = useSwipeRotation();

  const pulseAnim = useRef(new Animated.Value(1)).current;
  React.useEffect(() => {
    if (state !== 'searching') {
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulseAnim, state]);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />

      <View style={[StyleSheet.absoluteFill, { opacity: isLeaving ? 0 : 1 }]}>
        <ViroARSceneNavigator
          key={sceneKey}
          autofocus
          initialScene={{ scene: PlacementScene as any }}
          viroAppProps={{ word, onPlaneSelected, rotationApiRef }}
          style={styles.arView}
        />
        {/* Swipe-to-rotate overlay only after the model is anchored — during
            'searching' the user needs to tap a plane, which would be blocked. */}
        {state === 'placed' && (
          <View style={StyleSheet.absoluteFill} {...panHandlers} />
        )}
      </View>

      <LinearGradient
        colors={['rgba(0,0,0,0.34)', 'rgba(0,0,0,0)']}
        style={styles.topGradient}
        pointerEvents="none"
      />
      <LinearGradient
        colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.45)']}
        style={styles.bottomGradient}
        pointerEvents="none"
      />

      {/* Back button — always visible */}
      <TouchableOpacity
        style={[styles.backBtn, { top: insets.top + 12 }]}
        onPress={safeGoBack}
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        <Ionicons name="chevron-back" size={26} color="#fff" />
      </TouchableOpacity>

      {/* Searching overlay */}
      {state === 'searching' && (
        <View style={styles.searchingOverlay} pointerEvents="none">
          <Animated.View
            style={[styles.pulseRing, { transform: [{ scale: pulseAnim }] }]}
          />
          <View style={styles.searchingCard}>
            <Text style={styles.searchingTitle}>
              {strings.placementMoveHint(wordDisplay)}
            </Text>
            <Text style={styles.searchingHint}>
              {strings.AR_PLACEMENT_SEARCHING}
            </Text>
          </View>
        </View>
      )}

      {state === 'placed' && (
        <View style={[styles.rotateInstruction, { top: insets.top + 18 }]}>
          <Ionicons name="swap-horizontal" size={18} color="#FFFFFF" />
          <Text style={styles.rotateInstructionText}>
            {strings.rotateWordHint(word)}
          </Text>
        </View>
      )}

      {/* Placed overlay */}
      {state === 'placed' && (
        <View
          style={[styles.placedOverlay, { paddingBottom: insets.bottom + 24 }]}
        >
          <Text style={styles.placedWord}>{wordDisplay}</Text>
          <Text style={styles.placedLabel}>{strings.AR_PLACEMENT_PLACED}</Text>
          <TouchableOpacity
            style={styles.replaceBtn}
            onPress={onReplace}
            accessibilityRole="button"
          >
            <Ionicons name="refresh" size={18} color={colors.primary} />
            <Text style={styles.replaceBtnText}>
              {strings.AR_PLACEMENT_REPLACE}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Timeout overlay */}
      {state === 'timeout' && (
        <View style={styles.timeoutOverlay}>
          <View style={styles.timeoutCard}>
            <Ionicons
              name="alert-circle-outline"
              size={40}
              color={colors.textMid}
            />
            <Text style={styles.timeoutTitle}>
              {strings.AR_PLACEMENT_TIMEOUT}
            </Text>
            <Text style={styles.timeoutSub}>
              {strings.AR_PLACEMENT_TIMEOUT_SUB}
            </Text>
            <TouchableOpacity
              style={styles.tryAgainBtn}
              onPress={onReplace}
              accessibilityRole="button"
            >
              <Text style={styles.tryAgainText}>
                {strings.AR_PLACEMENT_TRY_AGAIN}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={safeGoBack} accessibilityRole="button">
              <Text style={styles.goBackText}>{strings.packGateDismiss}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};
