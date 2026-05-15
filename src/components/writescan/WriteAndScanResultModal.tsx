// 📖 End-of-round modal. Two states:
//  - Correct: celebrate mascot + checkmark + green palette.
//  - Wrong:   sad mascot + diff of what the child wrote vs the target + amber palette.
// Both states share the same Play Again / Done CTAs.

import React from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { LumiMascot } from '../common/LumiMascot';
import { RoundResult } from '../../hooks/useWriteAndScan';
import { styles } from '../../screens/WriteAndScanScreenStyles';

interface Props {
  visible: boolean;
  result: RoundResult | null;
  targetWord: string | null;
  onPlayAgain: () => void;
  onDone: () => void;
}

export const WriteAndScanResultModal = ({
  visible,
  result,
  targetWord,
  onPlayAgain,
  onDone,
}: Props) => {
  if (!result || !targetWord) {
    return null;
  }
  const correct = result.isCorrect;
  const shown = (result.ocrText ?? '').trim().toUpperCase() || '—';

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.resultBg}>
        <View
          style={[
            styles.resultCard,
            correct ? styles.resultCardOk : styles.resultCardBad,
          ]}
        >
          <View style={styles.resultMascot}>
            <LumiMascot state={correct ? 'celebrate' : 'sad'} size={120} />
          </View>

          <Text style={styles.resultTitle}>
            {correct ? 'Spelled it!' : 'Not quite!'}
          </Text>
          <Text style={styles.resultSubtitle}>
            {correct
              ? 'You wrote it perfectly.'
              : 'Look at the correct spelling below.'}
          </Text>

          <View style={styles.resultRow}>
            <View style={styles.resultBlock}>
              <Text style={styles.resultBlockLabel}>YOU WROTE</Text>
              <Text
                style={[
                  styles.resultBlockWord,
                  !correct && styles.resultBlockWordWrong,
                ]}
              >
                {shown}
              </Text>
            </View>
            <Ionicons
              name={correct ? 'checkmark-circle' : 'arrow-forward'}
              size={28}
              color={correct ? '#10B981' : '#F59E0B'}
            />
            <View style={styles.resultBlock}>
              <Text style={styles.resultBlockLabel}>ANSWER</Text>
              <Text
                style={[styles.resultBlockWord, styles.resultBlockWordTarget]}
              >
                {targetWord.toUpperCase()}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.resultBtn,
              correct ? styles.resultBtnOk : styles.resultBtnBad,
            ]}
            activeOpacity={0.85}
            onPress={onPlayAgain}
            accessibilityLabel="Play another round"
            accessibilityRole="button"
          >
            <Ionicons name="refresh" size={20} color="#FFF" />
            <Text style={styles.resultBtnText}>Play Again</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.resultDoneBtn}
            activeOpacity={0.85}
            onPress={onDone}
            accessibilityLabel="Exit Write and Scan"
            accessibilityRole="button"
          >
            <Text style={styles.resultDoneText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
