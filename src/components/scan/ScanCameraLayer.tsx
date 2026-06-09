import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  StatusBar,
} from 'react-native';
import { Camera, CameraDevice } from 'react-native-vision-camera';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { OCROverlay } from '../../components/ar/OCROverlay';
import { WishConfirmModal } from '../../components/WishConfirmModal';
import { styles } from '../../screens/ScanScreenStyles';
import { useStrings } from '../../hooks/useStrings';
import { colors } from '../../constants/colors';

interface ScanCameraLayerProps {
  device: CameraDevice | undefined;
  hasPermission: boolean;
  isAppActive: boolean;
  isFocused: boolean;
  cameraRef: React.RefObject<Camera>;
  matchResultWord: string | null;
  unknownWord: string | null;
  showWishModal: boolean;
  setShowWishModal: (visible: boolean) => void;
  onViewInAR: () => void;
  onWishPress: () => void;
  onBackPress: () => void;
}

// 📖 What this does:
// Renders the camera feed, OCR reticle, unknown-word chip, and back button.
// The status dot has a looping pulse ring to show active scanning.
export const ScanCameraLayer = ({
  device,
  hasPermission,
  isAppActive,
  isFocused,
  cameraRef,
  matchResultWord,
  unknownWord,
  showWishModal,
  setShowWishModal,
  onViewInAR,
  onWishPress,
  onBackPress,
}: ScanCameraLayerProps) => {
  const strings = useStrings();
  const ringAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(ringAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(ringAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [ringAnim]);

  const ringScale = ringAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 2.2],
  });
  const ringOpacity = ringAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.7, 0],
  });

  return (
    <>
      <StatusBar barStyle="light-content" />

      {device && hasPermission ? (
        <Camera
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={isAppActive && isFocused}
          photo
        />
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.noCamera]}>
          <Ionicons
            name="camera-off-outline"
            size={42}
            color="rgba(255,255,255,0.4)"
          />
          <Text style={styles.noCameraText}>
            {hasPermission ? strings.cameraUnavail : strings.cameraPermReq}
          </Text>
        </View>
      )}

      <OCROverlay detectedWord={matchResultWord} onViewInAR={onViewInAR} />

      {!matchResultWord && unknownWord && (
        <View style={styles.unknownCard}>
          <View style={styles.unknownIconBadge}>
            <Ionicons name="sparkles" size={18} color={colors.primary} />
          </View>
          <Text style={styles.unknownCardText}>
            {strings.unknownWordCard(
              unknownWord.charAt(0).toUpperCase() + unknownWord.slice(1)
            )}
          </Text>
          <TouchableOpacity
            style={styles.wishBtn}
            activeOpacity={0.8}
            onPress={onWishPress}
            accessibilityLabel={`Add ${unknownWord} to wishlist`}
            accessibilityRole="button"
          >
            <Text style={styles.wishBtnText}>{strings.wishForIt}</Text>
          </TouchableOpacity>
        </View>
      )}

      <WishConfirmModal
        word={unknownWord ?? ''}
        visible={showWishModal}
        onClose={() => setShowWishModal(false)}
      />

      <TouchableOpacity
        style={styles.backButton}
        onPress={onBackPress}
        accessibilityLabel="Go back from scanner"
        accessibilityRole="button"
      >
        <Ionicons name="chevron-back" size={22} color="#fff" />
      </TouchableOpacity>

      {/* Instruction card with pulsing status dot */}
      <Animated.View
        style={[
          styles.scanInstructionCard,
          {
            opacity: ringAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.82, 1],
            }),
          },
        ]}
      >
        <View style={styles.scanStepBadge}>
          <View style={styles.statusDotWrapper}>
            <Animated.View
              style={[
                styles.statusDotRing,
                { transform: [{ scale: ringScale }], opacity: ringOpacity },
              ]}
            />
            <View style={styles.statusDot} />
          </View>
          <Text style={styles.scanStepText}>{strings.scanStepLabel}</Text>
        </View>
        <Text style={styles.scanInstructionText}>
          {strings.scanInstruction}
        </Text>
      </Animated.View>
    </>
  );
};
