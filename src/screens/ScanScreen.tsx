import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
  StatusBar,
} from 'react-native';
import { ViroARSceneNavigator } from '@reactvision/react-viro';
import { useNavigation } from '@react-navigation/native';
import { ARWordScene } from '../components/ar/ARWordScene';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { getModel } from '../utils/modelRegistry';

// Fun facts per word (Phase 3 will pull these from Claude AI / Firestore)
const WORD_FACTS: Record<string, string> = {
  apple:      'Apples float in water because they are 25% air! 🌊',
  banana:     'Bananas are technically berries, but strawberries are not! 🤯',
  cherry:     'It takes about 5 years for a cherry tree to produce fruit! 🌳',
  grape:      'Grapes can be green, red, black, yellow, or purple! 🎨',
  lemon:      'Lemons contain more sugar than strawberries! 🍬',
  mango:      'Mangoes belong to the same family as cashews and pistachios! 🥜',
  orange:     'Oranges were originally green before humans bred sweeter versions! 🌿',
  pineapple:  'A pineapple plant takes 2 years to grow just one pineapple! ⏳',
  strawberry: 'Strawberries have about 200 tiny seeds on the outside! 🔢',
  watermelon: 'Watermelons are 92% water — that\'s how they got their name! 💧',
};

// Available fruits words for the test word selector
const FRUITS_WORDS = [
  'apple', 'banana', 'cherry', 'grape', 'lemon',
  'mango', 'orange', 'pineapple', 'strawberry', 'watermelon',
];

export const ScanScreen = () => {
  const navigation = useNavigation();
  const [activeWord, setActiveWord] = useState<string>('apple');
  const [modelLoaded, setModelLoaded] = useState(false);
  const [sceneKey, setSceneKey] = useState(0); // increment to force full scene remount
  const cardAnim = useRef(new Animated.Value(200)).current;

  const handleModelLoaded = () => {
    setModelLoaded(true);
    Animated.spring(cardAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 60,
      friction: 9,
    }).start();
  };

  const handleWordChange = (word: string) => {
    // Remount entire AR scene to prevent model stacking
    setSceneKey(prev => prev + 1);
    setActiveWord(word);
    setModelLoaded(false);
    cardAnim.setValue(200);
  };

  const handleReset = () => {
    setSceneKey(prev => prev + 1);
    setModelLoaded(false);
    cardAnim.setValue(200);
  };

  const fact = WORD_FACTS[activeWord] ?? 'This is a fun word to discover! ✨';
  const hasModel = !!getModel(activeWord);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* AR View */}
      <ViroARSceneNavigator
        key={sceneKey}
        initialScene={{ scene: ARWordScene as any }}
        viroAppProps={{
          word: activeWord,
          onModelLoaded: handleModelLoaded,
        }}
        style={styles.arView}
      />

      {/* ── Top HUD ── */}
      {/* Back button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="chevron-back" size={22} color="#fff" />
      </TouchableOpacity>

      {/* Reset button */}
      <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
        <Ionicons name="refresh" size={20} color="#fff" />
      </TouchableOpacity>

      {/* Active pack badge */}
      <View style={styles.packBadge}>
        <Text style={styles.packBadgeText}>🍎 Fruits Pack</Text>
      </View>

      {/* ── Word Selector (Phase 3: replaced by OCR result) ── */}
      <View style={styles.wordSelectorWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.wordSelectorContent}
        >
          {FRUITS_WORDS.map((word) => (
            <TouchableOpacity
              key={word}
              style={[
                styles.wordChip,
                activeWord === word && styles.wordChipActive,
              ]}
              onPress={() => handleWordChange(word)}
              activeOpacity={0.8}
            >
              <Text style={[
                styles.wordChipText,
                activeWord === word && styles.wordChipTextActive,
              ]}>
                {word}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* ── Result Card (slides up when model loads) ── */}
      <Animated.View
        style={[
          styles.resultCard,
          { transform: [{ translateY: cardAnim }] },
        ]}
      >
        <View style={styles.resultCardHandle} />
        <View style={styles.resultCardRow}>
          <View style={styles.resultWordBlock}>
            <Text style={styles.resultWord}>
              {activeWord.charAt(0).toUpperCase() + activeWord.slice(1)}
            </Text>
            <Text style={styles.resultPack}>Fruits Pack 🍎</Text>
          </View>
          <TouchableOpacity style={styles.pronunciationBtn}>
            <Ionicons name="volume-high" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
        <View style={styles.factBox}>
          <Text style={styles.factEmoji}>💡</Text>
          <Text style={styles.factText}>{fact}</Text>
        </View>
        <View style={styles.cardActions}>
          <TouchableOpacity style={styles.dismissBtn} onPress={() => {
            Animated.timing(cardAnim, {
              toValue: 200,
              duration: 250,
              useNativeDriver: true,
            }).start(() => setModelLoaded(false));
          }}>
            <Ionicons name="close" size={20} color="#5B2DC0" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveBtn}>
            <Ionicons name="star" size={18} color="#fff" />
            <Text style={styles.saveBtnText}>Save Word</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  arView: { flex: 1 },

  // Top HUD
  backButton: {
    position: 'absolute',
    top: 56,
    left: 16,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetButton: {
    position: 'absolute',
    top: 56,
    right: 16,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(91,45,192,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  packBadge: {
    position: 'absolute',
    top: 56,
    alignSelf: 'center',
    left: '50%',
    transform: [{ translateX: -70 }],
    backgroundColor: 'rgba(91,45,192,0.85)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 7,
  },
  packBadgeText: {
    fontFamily: 'Fredoka-SemiBold',
    fontSize: 14,
    color: '#fff',
  },

  // Word selector strip
  wordSelectorWrapper: {
    position: 'absolute',
    top: 110,
    left: 0,
    right: 0,
  },
  wordSelectorContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  wordChip: {
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  wordChipActive: {
    backgroundColor: '#5B2DC0',
    borderColor: '#A78BFA',
  },
  wordChipText: {
    fontFamily: 'Fredoka-SemiBold',
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    textTransform: 'capitalize',
  },
  wordChipTextActive: {
    color: '#fff',
  },

  // Result card
  resultCard: {
    position: 'absolute',
    bottom: 90,
    left: 16,
    right: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#5B2DC0',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 12,
  },
  resultCardHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E0D7F5',
    alignSelf: 'center',
    marginBottom: 16,
  },
  resultCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  resultWordBlock: { flex: 1 },
  resultWord: {
    fontFamily: 'Fredoka-Bold',
    fontSize: 28,
    color: '#1A1050',
  },
  resultPack: {
    fontFamily: 'Fredoka-Regular',
    fontSize: 13,
    color: '#9B87CC',
    marginTop: 1,
  },
  pronunciationBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#5B2DC0',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  factBox: {
    flexDirection: 'row',
    backgroundColor: '#F0EBFF',
    borderRadius: 14,
    padding: 12,
    gap: 8,
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  factEmoji: { fontSize: 16, marginTop: 1 },
  factText: {
    fontFamily: 'Fredoka-Regular',
    fontSize: 14,
    color: '#4B3D7A',
    flex: 1,
    lineHeight: 20,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dismissBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0EBFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtn: {
    flexDirection: 'row',
    backgroundColor: '#5B2DC0',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignItems: 'center',
    gap: 6,
  },
  saveBtnText: {
    fontFamily: 'Fredoka-SemiBold',
    fontSize: 15,
    color: '#fff',
  },
});
