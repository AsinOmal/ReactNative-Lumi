// 📖 First screen of Write & Scan — three big difficulty buttons.
// Word length is the proxy for difficulty (easy ≤5, medium 6-7, hard 8+).
// Each tile shows the letter range so the kid (or parent) knows what
// they're signing up for.

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../../constants/colors';
import { Difficulty } from '../../hooks/useWriteAndScan';
import { LumiMascot } from '../common/LumiMascot';
import { styles } from '../../screens/WriteAndScanScreenStyles';

interface Option {
  key: Difficulty;
  label: string;
  range: string;
  iconName: string;
  gradient: [string, string];
}

const OPTIONS: Option[] = [
  { key: 'easy',   label: 'Easy',   range: 'Short words (3–5 letters)', iconName: 'leaf-outline',  gradient: ['#86EFAC', '#10B981'] },
  { key: 'medium', label: 'Medium', range: 'Medium words (6–7 letters)', iconName: 'flame-outline', gradient: ['#FCD34D', '#F59E0B'] },
  { key: 'hard',   label: 'Hard',   range: 'Long words (8+ letters)',    iconName: 'flash-outline', gradient: ['#FCA5A5', '#EF4444'] },
];

interface Props {
  onPick: (difficulty: Difficulty) => void;
  onClose: () => void;
}

export const DifficultyPicker = ({ onPick, onClose }: Props) => (
  <View style={styles.diffWrap}>
    <TouchableOpacity
      style={styles.closeBtn}
      onPress={onClose}
      accessibilityLabel="Close Write and Scan"
      accessibilityRole="button"
    >
      <Ionicons name="close" size={22} color={colors.textDark} />
    </TouchableOpacity>

    <View style={styles.diffMascot}>
      <LumiMascot state="wave" size={110} />
    </View>
    <Text style={styles.diffTitle}>Write &amp; Scan</Text>
    <Text style={styles.diffSubtitle}>Pick how hard you want it!</Text>

    <View style={styles.diffList}>
      {OPTIONS.map(opt => (
        <TouchableOpacity
          key={opt.key}
          activeOpacity={0.85}
          onPress={() => onPick(opt.key)}
          accessibilityLabel={`${opt.label} difficulty`}
          accessibilityRole="button"
          style={styles.diffBtnShadow}
        >
          <LinearGradient
            colors={opt.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.diffBtn}
          >
            <Ionicons name={opt.iconName as any} size={32} color="#FFF" />
            <View style={styles.diffBtnText}>
              <Text style={styles.diffBtnLabel}>{opt.label}</Text>
              <Text style={styles.diffBtnRange}>{opt.range}</Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color="rgba(255,255,255,0.85)" />
          </LinearGradient>
        </TouchableOpacity>
      ))}
    </View>
  </View>
);
