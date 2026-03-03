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
  watermelon: "Watermelons are 92% water — that's how they got their name! 💧",
};

const FRUITS_WORDS = [
  'apple', 'banana', 'cherry', 'grape', 'lemon',
  'mango', 'orange', 'pineapple', 'strawberry', 'watermelon',
];

export const ScanScreen = () => {
  const navigation = useNavigation();
  const [activeWord, setActiveWord] = useState<string>('apple');
  const [sceneKey, setSceneKey] = useState(0);
  const [placeTrigger, setPlaceTrigger] = useState(0);
  const [surfaceFound, setSurfaceFound] = useState(false);
  const [isPlaced, setIsPlaced] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);
  const cardAnim = useRef(new Animated.Value(200)).current;
  const hintAnim = useRef(new Animated.Value(1)).current; // opacity for "looking" hint

  const handleSurfaceDetected = () => {
    setSurfaceFound(true);
    // Pulse the hint to draw attention to the Place button
    Animated.loop(
      Animated.sequence([
        Animated.timing(hintAnim, { toValue: 0.4, duration: 800, useNativeDriver: true }),
        Animated.timing(hintAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ]),
      { iterations: 3 },
    ).start();
  };

  const handleModelPlaced = () => {
    setIsPlaced(true);
  };

  const handleModelLoaded = () => {
    setModelLoaded(true);
    Animated.spring(cardAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 60,
      friction: 9,
    }).start();
  };

  const handlePlace = () => {
    setPlaceTrigger(t => t + 1);
  };

  const handleWordChange = (word: string) => {
    setSceneKey(k => k + 1);
    setActiveWord(word);
    setModelLoaded(false);
    setIsPlaced(false);
    setSurfaceFound(false);
    setPlaceTrigger(0);
    cardAnim.setValue(200);
  };

  const handleReset = () => {
    setSceneKey(k => k + 1);
    setModelLoaded(false);
    setIsPlaced(false);
    setSurfaceFound(false);
    setPlaceTrigger(0);
    cardAnim.setValue(200);
  };

  const dismissCard = () => {
    Animated.timing(cardAnim, {
      toValue: 200,
      duration: 250,
      useNativeDriver: true,
    }).start(() => setModelLoaded(false));
  };

  const fact = WORD_FACTS[activeWord] ?? 'This is a fun word to discover! ✨';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* AR View */}
      <ViroARSceneNavigator
        key={sceneKey}
        initialScene={{ scene: ARWordScene as any }}
        viroAppProps={{
          word: activeWord,
          placeTrigger,
          onSurfaceDetected: handleSurfaceDetected,
          onModelPlaced: handleModelPlaced,
          onModelLoaded: handleModelLoaded,
        }}
        style={styles.arView}
      />

      {/* ── Top HUD ── */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="chevron-back" size={22} color="#fff" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
        <Ionicons name="refresh" size={20} color="#fff" />
      </TouchableOpacity>

      {/* Active pack badge */}
      <View style={styles.packBadge}>
        <Text style={styles.packBadgeText}>🍎 Fruits Pack</Text>
      </View>

      {/* ── Word Selector ── */}
      <View style={styles.wordSelectorWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.wordSelectorContent}
        >
          {FRUITS_WORDS.map((word) => (
            <TouchableOpacity
              key={word}
              style={[styles.wordChip, activeWord === word && styles.wordChipActive]}
              onPress={() => handleWordChange(word)}
              activeOpacity={0.8}
            >
              <Text style={[styles.wordChipText, activeWord === word && styles.wordChipTextActive]}>
                {word}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* ── Surface Detection / Place Overlay ── */}
      {!isPlaced && (
        <View style={styles.placeOverlay}>
          {!surfaceFound ? (
            /* Scanning for surface */
            <View style={styles.scanningHint}>
              <Ionicons name="scan-outline" size={18} color="rgba(255,255,255,0.7)" />
              <Text style={styles.scanningText}>Move camera slowly to find a surface…</Text>
            </View>
          ) : (
            /* Surface found — show Place button */
            <View style={styles.placeRow}>
              <Text style={styles.placeHintText}>
                Surface found! Point at where you want to place
              </Text>
              <TouchableOpacity style={styles.placeButton} onPress={handlePlace} activeOpacity={0.85}>
                <Ionicons name="location" size={20} color="#fff" />
                <Text style={styles.placeButtonText}>
                  Place {activeWord.charAt(0).toUpperCase() + activeWord.slice(1)}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* ── Result Card (slides up after model loads) ── */}
      <Animated.View style={[styles.resultCard, { transform: [{ translateY: cardAnim }] }]}>
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
          <TouchableOpacity style={styles.dismissBtn} onPress={dismissCard}>
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
    top: 56, left: 16,
    width: 38, height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center', justifyContent: 'center',
  },
  resetButton: {
    position: 'absolute',
    top: 56, right: 16,
    width: 38, height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(91,45,192,0.75)',
    alignItems: 'center', justifyContent: 'center',
  },
  packBadge: {
    position: 'absolute',
    top: 56,
    alignSelf: 'center',
    left: '50%',
    transform: [{ translateX: -70 }],
    backgroundColor: 'rgba(91,45,192,0.85)',
    borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 7,
  },
  packBadgeText: {
    fontFamily: 'Fredoka-SemiBold', fontSize: 14, color: '#fff',
  },

  // Word chips
  wordSelectorWrapper: {
    position: 'absolute',
    top: 110, left: 0, right: 0,
  },
  wordSelectorContent: {
    paddingHorizontal: 16, gap: 8,
  },
  wordChip: {
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 7,
    borderWidth: 1.5, borderColor: 'transparent',
  },
  wordChipActive: {
    backgroundColor: '#5B2DC0', borderColor: '#A78BFA',
  },
  wordChipText: {
    fontFamily: 'Fredoka-SemiBold', fontSize: 14,
    color: 'rgba(255,255,255,0.7)', textTransform: 'capitalize',
  },
  wordChipTextActive: { color: '#fff' },

  // Place overlay
  placeOverlay: {
    position: 'absolute',
    bottom: 105,
    left: 16, right: 16,
    alignItems: 'center',
  },
  scanningHint: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 10,
  },
  scanningText: {
    fontFamily: 'Fredoka-Regular', fontSize: 14,
    color: 'rgba(255,255,255,0.75)',
  },
  placeRow: {
    alignItems: 'center', gap: 10, width: '100%',
  },
  placeHintText: {
    fontFamily: 'Fredoka-Regular', fontSize: 13,
    color: 'rgba(255,255,255,0.75)', textAlign: 'center',
  },
  placeButton: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#5B2DC0',
    borderRadius: 28,
    paddingHorizontal: 24, paddingVertical: 13,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 14,
    elevation: 10,
  },
  placeButtonText: {
    fontFamily: 'Fredoka-Bold', fontSize: 17, color: '#fff',
  },

  // Result card
  resultCard: {
    position: 'absolute',
    bottom: 90, left: 16, right: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#5B2DC0',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15, shadowRadius: 20,
    elevation: 12,
  },
  resultCardHandle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: '#E0D7F5',
    alignSelf: 'center', marginBottom: 16,
  },
  resultCardRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 12,
  },
  resultWordBlock: { flex: 1 },
  resultWord: {
    fontFamily: 'Fredoka-Bold', fontSize: 28, color: '#1A1050',
  },
  resultPack: {
    fontFamily: 'Fredoka-Regular', fontSize: 13,
    color: '#9B87CC', marginTop: 1,
  },
  pronunciationBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#5B2DC0',
    alignItems: 'center', justifyContent: 'center',
    marginLeft: 12,
  },
  factBox: {
    flexDirection: 'row',
    backgroundColor: '#F0EBFF',
    borderRadius: 14, padding: 12, gap: 8,
    marginBottom: 16, alignItems: 'flex-start',
  },
  factEmoji: { fontSize: 16, marginTop: 1 },
  factText: {
    fontFamily: 'Fredoka-Regular', fontSize: 14,
    color: '#4B3D7A', flex: 1, lineHeight: 20,
  },
  cardActions: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
  },
  dismissBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#F0EBFF',
    alignItems: 'center', justifyContent: 'center',
  },
  saveBtn: {
    flexDirection: 'row',
    backgroundColor: '#5B2DC0',
    borderRadius: 24,
    paddingHorizontal: 20, paddingVertical: 10,
    alignItems: 'center', gap: 6,
  },
  saveBtnText: {
    fontFamily: 'Fredoka-SemiBold', fontSize: 15, color: '#fff',
  },
});
