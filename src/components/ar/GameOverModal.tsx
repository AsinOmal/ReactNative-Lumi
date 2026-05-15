import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import LottieView from 'lottie-react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../../constants/colors';
import { styles } from '../../screens/ARWordFindScreenStyles';

interface GameOverModalProps {
  gameOver: boolean;
  timedOut: boolean;
  wrongCount: number;
  score: number;
  foundCount: number;
  totalCount: number;
  onPlayAgain: () => void;
  onDone: () => void;
}

// 📖 What this does:
// Renders the final score modal at the end of the AR game.
// Distinguishes between 'Perfect Score', 'All Found', or 'Time's Up' states.
export const GameOverModal = ({
  gameOver,
  timedOut,
  wrongCount,
  score,
  foundCount,
  totalCount,
  onPlayAgain,
  onDone,
}: GameOverModalProps) => {
  const lottieRef = useRef<LottieView>(null);

  useEffect(() => {
    if (gameOver && !timedOut) {
      lottieRef.current?.reset();
      lottieRef.current?.play();
    }
  }, [gameOver]);

  return (
    <Modal
      transparent
      visible={gameOver}
      animationType="fade"
      onRequestClose={() => {}}
    >
      <View style={styles.gameOverBg}>
        <View style={styles.gameOverCard}>
          <View style={styles.gameOverEmoji}>
            {timedOut ? (
              <Ionicons
                name="hourglass-outline"
                size={64}
                color={colors.primaryLight}
              />
            ) : (
              <LottieView
                ref={lottieRef}
                source={require('../../assets/lottie/mascot_celebration.json')}
                loop={false}
                style={{ width: 120, height: 120 }}
              />
            )}
          </View>
          <Text style={styles.gameOverTitle}>
            {timedOut
              ? "Time's Up!"
              : wrongCount === 0
              ? 'Perfect Score!'
              : 'All Found!'}
          </Text>
          {timedOut && (
            <Text style={styles.timedOutSub}>
              You found {foundCount}/{totalCount} words
            </Text>
          )}
          <View style={styles.scoreRow}>
            <Text style={styles.scoreLabel}>Score</Text>
            <Text style={styles.scoreNum}>{score}</Text>
          </View>
          {wrongCount > 0 && (
            <Text style={styles.mistakesText}>
              {wrongCount} wrong tap{wrongCount > 1 ? 's' : ''}
            </Text>
          )}
          <TouchableOpacity
            style={styles.playAgainBtn}
            activeOpacity={0.85}
            onPress={onPlayAgain}
            accessibilityLabel="Play again"
            accessibilityRole="button"
          >
            <View
              style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
            >
              <Ionicons name="refresh" size={18} color="#FFF" />
              <Text style={styles.playAgainText}>Play Again</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.doneBtn}
            activeOpacity={0.85}
            onPress={onDone}
            accessibilityLabel="Done, exit game"
            accessibilityRole="button"
          >
            <Text style={styles.doneBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
