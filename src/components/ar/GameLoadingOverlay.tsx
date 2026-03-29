import React from 'react';
import { Animated, View, Text, TouchableOpacity } from 'react-native';
import { styles } from '../../screens/ARWordFindScreenStyles';
import { MODEL_REGISTRY } from '../../utils/modelRegistry';

interface GameLoadingOverlayProps {
  loadFadeAnim: Animated.Value;
  loadedWords: string[];
  allLoaded: boolean;
  totalModels: number;
  allWords: string[];
  onStartPlay: () => void;
}

// 📖 What this does:
// Renders the glowing loading screen over the AR camera.
// Displays the 'How to play' instructions and tracks how many models 
// have successfully fired their onLoadEnd callback in Viro. 
// Enables the 'Start Playing' button once all 10 are loaded.
export const GameLoadingOverlay = ({
  loadFadeAnim,
  loadedWords,
  allLoaded,
  totalModels,
  allWords,
  onStartPlay,
}: GameLoadingOverlayProps) => {
  return (
    <Animated.View style={[styles.loadingOverlay, { opacity: loadFadeAnim }]} pointerEvents="auto">
      <Text style={styles.loadingTitle}>How to Play!</Text>
      
      <View style={styles.instructionsBox}>
        <Text style={styles.instructionLine}>📱 Move your phone around to look</Text>
        <Text style={styles.instructionLine}>🔍 Find the 3D model that matches the word</Text>
        <Text style={styles.instructionLine}>👆 Tap the correct model to earn +10 pts</Text>
        <Text style={styles.instructionLine}>❌ Wrong taps cost you -5 pts</Text>
        <Text style={styles.instructionLine}>⏱ You have 60 seconds. Good luck!</Text>
      </View>

      <View style={styles.loadingActionArea}>
        {!allLoaded ? (
          <View style={styles.progressContainer}>
            <Text style={styles.loadingSubtitle}>Placing objects in your room...</Text>
            <View style={styles.progressBarTrack}>
              <Animated.View
                style={[
                  styles.progressBarFill,
                  { width: `${(loadedWords.length / totalModels) * 100}%` },
                ]}
              />
            </View>
            <Text style={styles.progressCount}>
              {loadedWords.length}/{totalModels} ready
            </Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.startGameBtn}
            activeOpacity={0.8}
            onPress={onStartPlay}
          >
            <Text style={styles.startGameBtnText}>🚀 Start Playing!</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Emoji grid — lights up as each model loads */}
      <View style={styles.emojiGrid}>
        {allWords.map(word => {
          const loaded = loadedWords.includes(word);
          const m = MODEL_REGISTRY[word];
          return (
            <View
              key={word}
              style={[styles.emojiCell, loaded && styles.emojiCellLoaded]}
            >
              <Text style={[styles.emojiIcon, !loaded && styles.emojiIconDim]}>
                {m?.emoji ?? '❓'}
              </Text>
            </View>
          );
        })}
      </View>
    </Animated.View>
  );
};
