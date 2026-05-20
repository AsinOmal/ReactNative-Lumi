// 📖 Write & Scan orchestrator.
// Switches between phases via the useWriteAndScan hook:
//   difficulty → pick a bucket
//   countdown  → 3-2-1 overlay
//   reveal     → ViroReact AR scene showing the target model
//   scan       → Vision Camera single-shot capture of the kid's handwriting
//   result     → modal with correct/wrong feedback
// AR → OCR transition uses the same 350ms safe-unmount delay as
// ARWordFindScreen so Metal textures release cleanly before the camera
// hands over to react-native-vision-camera.

import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { ViroARSceneNavigator } from '@reactvision/react-viro';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useWriteAndScan } from '../hooks/useWriteAndScan';
import { useAmbientPauseOnFocus } from '../hooks/useAmbientPauseOnFocus';
import { WriteAndScanRevealScene } from '../components/ar/WriteAndScanRevealScene';
import { DifficultyPicker } from '../components/writescan/DifficultyPicker';
import { CountdownOverlay } from '../components/writescan/CountdownOverlay';
import { CaptureLayer } from '../components/writescan/CaptureLayer';
import { WriteAndScanResultModal } from '../components/writescan/WriteAndScanResultModal';
import { styles } from './WriteAndScanScreenStyles';

const AR_UNMOUNT_DELAY_MS = 350;

export const WriteAndScanScreen = () => {
  useAmbientPauseOnFocus();
  const navigation = useNavigation();
  const {
    phase,
    targetWord,
    result,
    startRound,
    onCountdownDone,
    proceedToScan,
    submitOcrText,
    playAgain,
  } = useWriteAndScan();

  // Hide the AR view (opacity: 0) before unmounting so Metal can release
  // textures async — same pattern as safeGoBack in ARWordFindScreen.
  const [arLeaving, setArLeaving] = useState(false);
  const transitionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const safeExit = useCallback(() => {
    if (transitionTimer.current) {
      clearTimeout(transitionTimer.current);
    }
    navigation.goBack();
  }, [navigation]);

  const handleScanMyAnswer = useCallback(() => {
    setArLeaving(true);
    transitionTimer.current = setTimeout(() => {
      setArLeaving(false);
      proceedToScan();
    }, AR_UNMOUNT_DELAY_MS);
  }, [proceedToScan]);

  return (
    <View style={styles.root}>
      <StatusBar hidden />

      {phase === 'difficulty' && (
        <DifficultyPicker onPick={startRound} onClose={safeExit} />
      )}

      {phase === 'countdown' && <CountdownOverlay onDone={onCountdownDone} />}

      {phase === 'reveal' && targetWord && (
        <View style={[styles.black, arLeaving && { opacity: 0 }]}>
          <ViroARSceneNavigator
            autofocus
            initialScene={{ scene: WriteAndScanRevealScene as any }}
            viroAppProps={{ word: targetWord }}
            style={StyleSheet.absoluteFill}
          />
          <TouchableOpacity
            style={styles.closeBtnDark}
            onPress={safeExit}
            accessibilityLabel="Exit Write and Scan"
            accessibilityRole="button"
          >
            <Ionicons name="close" size={22} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.revealPrompt} pointerEvents="none">
            <View style={styles.revealStepChip}>
              <Text style={styles.revealStepText}>Step 1</Text>
            </View>
            <Text style={styles.revealInstruction}>Write this word on paper</Text>
            <Text style={styles.revealWord}>
              {targetWord.charAt(0).toUpperCase() + targetWord.slice(1)}
            </Text>
          </View>
          <View pointerEvents="none">
            <Text style={styles.revealHelper}>
              Write it on paper, then scan your answer.
            </Text>
          </View>
          <TouchableOpacity
            style={styles.revealScanBtn}
            activeOpacity={0.85}
            onPress={handleScanMyAnswer}
            accessibilityLabel="Check my writing"
            accessibilityRole="button"
          >
            <Ionicons name="camera" size={22} color="#FFF" />
            <Text style={styles.revealScanBtnText}>Check My Writing</Text>
          </TouchableOpacity>
        </View>
      )}

      {phase === 'scan' && targetWord && (
        <CaptureLayer
          targetWord={targetWord}
          onCaptured={submitOcrText}
          onCancel={safeExit}
        />
      )}

      <WriteAndScanResultModal
        visible={phase === 'result'}
        result={result}
        targetWord={targetWord}
        onPlayAgain={playAgain}
        onDone={safeExit}
      />
    </View>
  );
};
