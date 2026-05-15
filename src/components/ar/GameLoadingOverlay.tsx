// 📖 What this does:
// Mission-briefing screen shown while Viro places AR models in the room.
// Shows mascot-led "How to Play" instructions and today's target word so
// the player knows what to hunt before the game starts.
// The Start Hunting button is locked until all models report onLoadEnd.

import React from 'react';
import {
  Animated,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { LumiMascot } from '../common/LumiMascot';
import { MODEL_REGISTRY } from '../../utils/modelRegistry';
import { overlayStyles as s } from './GameLoadingOverlayStyles';

interface Props {
  loadFadeAnim: Animated.Value;
  loadedWords: string[];
  allLoaded: boolean;
  totalModels: number;
  allWords: string[];
  onStartPlay: () => void;
}

const STEPS = [
  {
    icon: 'phone-portrait-outline',
    title: 'Look Around',
    desc: 'Move your phone to explore your space',
  },
  {
    icon: 'search-outline',
    title: 'Find It',
    desc: 'Find the 3D object matching the word',
  },
  {
    icon: 'hand-left-outline',
    title: 'Tap to Get',
    desc: 'Tap the correct object for +10 pts',
  },
  {
    icon: 'flash-outline',
    title: 'Be Quick!',
    desc: 'Wrong taps cost 5 pts. 60 seconds!',
  },
];

export const GameLoadingOverlay = ({
  loadFadeAnim,
  loadedWords,
  allLoaded,
  totalModels,
  allWords,
  onStartPlay,
}: Props) => (
  <Animated.View
    style={[s.overlay, { opacity: loadFadeAnim }]}
    pointerEvents="auto"
  >
    <SafeAreaView style={s.safeArea}>
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={s.mascotWrap}>
          <LumiMascot state="excited" size={90} />
        </View>
        <View style={s.titleRow}>
          <Text style={s.title}>Lumi Hunt</Text>
          <Ionicons name="search" size={24} color="#FFD700" />
        </View>
        <Text style={s.tagline}>Find it. Tap it. Learn it!</Text>

        <Text style={s.sectionLabel}>— HOW TO PLAY —</Text>
        <View style={s.instrGrid}>
          {STEPS.map((step) => (
            <View key={step.title} style={s.instrCard}>
              <Ionicons name={step.icon as any} size={22} color="#C4B5FD" />
              <Text style={s.instrTitle}>{step.title}</Text>
              <Text style={s.instrDesc}>{step.desc}</Text>
            </View>
          ))}
        </View>

        <Text style={s.sectionLabel}>— EXAMPLES —</Text>
        <View style={s.emojiGrid}>
          {allWords.map((word) => {
            const loaded = loadedWords.includes(word);
            return (
              <View
                key={word}
                style={[s.emojiCell, loaded && s.emojiCellLoaded]}
              >
                <Text style={[s.emojiIcon, !loaded && s.emojiIconDim]}>
                  {MODEL_REGISTRY[word]?.emoji ?? '?'}
                </Text>
              </View>
            );
          })}
        </View>

        {!allLoaded ? (
          <View style={s.progressContainer}>
            <Text style={s.progressSubtitle}>
              Placing objects in your room...
            </Text>
            <View style={s.progressBarTrack}>
              <View
                style={[
                  s.progressBarFill,
                  { width: `${(loadedWords.length / totalModels) * 100}%` },
                ]}
              />
            </View>
            <Text style={s.progressCount}>
              {loadedWords.length}/{totalModels} ready
            </Text>
          </View>
        ) : (
          <TouchableOpacity
            style={s.startBtn}
            activeOpacity={0.85}
            onPress={onStartPlay}
            accessibilityLabel="Start game"
            accessibilityRole="button"
          >
            <Ionicons name="rocket" size={22} color="#FFF" />
            <Text style={s.startBtnText}>Start Hunting!</Text>
          </TouchableOpacity>
        )}

        <View style={s.tipRow}>
          <Ionicons
            name="bulb-outline"
            size={14}
            color="rgba(255,255,255,0.45)"
          />
          <Text style={s.tipText}>
            Good lighting helps you find objects faster!
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  </Animated.View>
);
