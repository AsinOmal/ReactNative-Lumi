import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
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
  return (
    <Modal transparent visible={gameOver} animationType="fade" onRequestClose={() => {}}>
      <View style={styles.gameOverBg}>
        <View style={styles.gameOverCard}>
          <Text style={styles.gameOverEmoji}>
            {timedOut ? '⏰' : wrongCount === 0 ? '🏆' : '🎉'}
          </Text>
          <Text style={styles.gameOverTitle}>
            {timedOut ? "Time's Up!" : wrongCount === 0 ? 'Perfect Score!' : 'All Found!'}
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
          >
            <Text style={styles.playAgainText}>🔄 Play Again</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.doneBtn}
            activeOpacity={0.85}
            onPress={onDone}
          >
            <Text style={styles.doneBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
