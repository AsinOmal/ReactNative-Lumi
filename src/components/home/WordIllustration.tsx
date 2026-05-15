// 📖 What this does:
// Placeholder illustration for the "Today's Word" card. Uses the word's pack
// gradient + icon as a colourful focal point until real Leonardo illustrations
// land. The sparkle Lottie orbits the circle. Swap the inner LinearGradient
// content for an <Image> once illustration assets are ready.

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import LottieView from 'lottie-react-native';
import { getPackGradient } from '../../constants/packAccents';
import { PACK_WORDS } from '../../constants/packWords';

const WORD_EMOJI: Record<string, string> = {
  apple: '🍎',
  banana: '🍌',
  cherry: '🍒',
  grape: '🍇',
  lemon: '🍋',
  mango: '🥭',
  orange: '🍊',
  pineapple: '🍍',
  strawberry: '🍓',
  watermelon: '🍉',
  broccoli: '🥦',
  carrot: '🥕',
  chili: '🌶️',
  corn: '🌽',
  cucumber: '🥒',
  eggplant: '🍆',
  onion: '🧅',
  potato: '🥔',
  pumpkin: '🎃',
  tomato: '🍅',
  bicycle: '🚲',
  boat: '⛵',
  bus: '🚌',
  car: '🚗',
  helicopter: '🚁',
  plane: '✈️',
  rocket: '🚀',
  tractor: '🚜',
  train: '🚂',
  truck: '🚛',
};

function packIdForWord(word: string): string {
  for (const [id, words] of Object.entries(PACK_WORDS)) {
    if (words.includes(word)) {
      return id;
    }
  }
  return 'fruits';
}

interface Props {
  word: string;
  size?: number;
}

export const WordIllustration: React.FC<Props> = ({ word, size = 72 }) => {
  const packId = packIdForWord(word);
  const gradient = getPackGradient(packId);
  const emoji = WORD_EMOJI[word];

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <LottieView
          source={require('../../assets/lottie/sparkle.json')}
          autoPlay
          loop
          speed={0.6}
          style={StyleSheet.absoluteFill}
        />
      </View>
      <LinearGradient
        colors={gradient}
        style={[
          styles.circle,
          { borderRadius: size / 2, width: size - 8, height: size - 8 },
        ]}
      >
        <Text style={{ fontSize: Math.round(size * 0.42) }}>
          {emoji ?? '🔍'}
        </Text>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 5,
  },
});
