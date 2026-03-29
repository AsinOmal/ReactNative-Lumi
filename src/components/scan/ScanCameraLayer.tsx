import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { Camera, CameraDevice } from 'react-native-vision-camera';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { OCROverlay } from '../../components/ar/OCROverlay';
import { WishConfirmModal } from '../../components/WishConfirmModal';
import { styles } from '../../screens/ScanScreenStyles';
import { strings } from '../../constants/strings';

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
// Renders the underlying camera feed view, the target scanning reticle (OCROverlay), 
// and the prompt to wish for an unknown word if one is detected. 
// It also checks permissions and shows a fallback UI if none are granted.
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
  return (
    <>
      <StatusBar barStyle="light-content" />

      {/* Camera feed */}
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
          <Ionicons name="camera-off-outline" size={42} color="rgba(255,255,255,0.4)" />
          <Text style={styles.noCameraText}>
            {hasPermission ? strings.cameraUnavail : strings.cameraPermReq}
          </Text>
        </View>
      )}

      {/* OCR scanning reticle + detected word chip */}
      <OCROverlay
        detectedWord={matchResultWord}
        onViewInAR={onViewInAR}
      />

      {/* Unknown word chip */}
      {!matchResultWord && unknownWord && (
        <View style={styles.unknownChip}>
          <Text style={styles.unknownChipText}>
            {strings.unknownPrefix} <Text style={styles.unknownWord}>
              {unknownWord.charAt(0).toUpperCase() + unknownWord.slice(1)}
            </Text>{' '}{strings.unknownSuffix}
          </Text>
          <TouchableOpacity
            style={styles.wishBtn}
            activeOpacity={0.8}
            onPress={onWishPress}
          >
            <Text style={styles.wishBtnText}>{strings.wishForIt}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Wish confirmation modal */}
      <WishConfirmModal
        word={unknownWord ?? ''}
        visible={showWishModal}
        onClose={() => setShowWishModal(false)}
      />

      {/* Top HUD Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={onBackPress}>
        <Ionicons name="chevron-back" size={22} color="#fff" />
      </TouchableOpacity>

      {/* Scanning status indicator */}
      <View style={styles.statusBar}>
        <View style={styles.statusDot} />
        <Text style={styles.statusText}>{strings.scanStatus}</Text>
      </View>
    </>
  );
};
