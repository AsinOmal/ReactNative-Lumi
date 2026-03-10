/**
 * SyllablePlayer.tsx
 *
 * Displays a word as tappable syllable chips (e.g. [Ap] · [ple]).
 * The 🔊 button plays the full-word pronunciation audio via react-native-sound.
 * Tapping a chip triggers a brief spring-pulse animation.
 *
 * Audio files must be copied to the iOS main bundle.
 * See: ios/Lumi/Base.lproj or drag-drop into Xcode target.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
} from 'react-native';
import Sound from 'react-native-sound';
import Ionicons from 'react-native-vector-icons/Ionicons';
import type { ModelEntry } from '../../utils/modelRegistry';

// Allow audio to play even when the iPhone silent switch is on
Sound.setCategory('Playback');

interface Props {
  entry: ModelEntry | null;
}

export const SyllablePlayer: React.FC<Props> = ({ entry }) => {
  const soundRef = useRef<Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeSyllable, setActiveSyllable] = useState<number | null>(null);
  const chipScales = useRef<Animated.Value[]>([]);

  // ── Load audio whenever the word changes ──────────────────────────────────
  useEffect(() => {
    // Cleanup previous sound before loading new one
    if (soundRef.current) {
      soundRef.current.release();
      soundRef.current = null;
    }
    setIsPlaying(false);
    setActiveSyllable(null);

    if (!entry?.audio) return;

    // react-native-sound loads files by name from the app's main bundle.
    // The .mp3 files must be added to the Xcode target's "Copy Bundle Resources".
    const sound = new Sound(entry.audio, Sound.MAIN_BUNDLE, (error) => {
      if (!error) {
        soundRef.current = sound;
      }
    });

    return () => {
      sound.release();
      soundRef.current = null;
    };
  }, [entry?.audio]);

  // Unload on unmount
  useEffect(() => {
    return () => {
      soundRef.current?.release();
    };
  }, []);

  // ── Play full word ────────────────────────────────────────────────────────
  const playWord = useCallback(() => {
    const sound = soundRef.current;
    if (!sound || isPlaying) return;

    sound.stop(() => {
      sound.setCurrentTime(0);
      setIsPlaying(true);
      sound.play(() => {
        setIsPlaying(false);
        setActiveSyllable(null);
      });
    });
  }, [isPlaying]);

  // ── Syllable chip tap — pulse animation + play ────────────────────────────
  const onChipPress = useCallback(
    (index: number) => {
      const scale = chipScales.current[index];
      if (!scale) return;

      setActiveSyllable(index);
      Animated.sequence([
        Animated.spring(scale, {
          toValue: 1.2,
          useNativeDriver: true,
          tension: 200,
          friction: 5,
        }),
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          tension: 200,
          friction: 8,
        }),
      ]).start();

      playWord();
    },
    [playWord],
  );

  if (!entry) return null;

  const { syllables } = entry;

  // Ensure we have an Animated.Value per syllable (stable across renders)
  while (chipScales.current.length < syllables.length) {
    chipScales.current.push(new Animated.Value(1));
  }

  return (
    <View style={styles.container}>
      {/* 🔊 Play button */}
      <TouchableOpacity
        style={[styles.playBtn, isPlaying && styles.playBtnActive]}
        onPress={playWord}
        activeOpacity={0.7}
      >
        <Ionicons
          name={isPlaying ? 'volume-high' : 'volume-medium-outline'}
          size={20}
          color="#fff"
        />
      </TouchableOpacity>

      {/* Syllable chips with · separator */}
      <View style={styles.chipsRow}>
        {syllables.map((syllable, i) => (
          <React.Fragment key={i}>
            <TouchableOpacity onPress={() => onChipPress(i)} activeOpacity={0.75}>
              <Animated.View
                style={[
                  styles.chip,
                  activeSyllable === i && styles.chipActive,
                  { transform: [{ scale: chipScales.current[i] || new Animated.Value(1) }] },
                ]}
              >
                <Text style={[styles.chipText, activeSyllable === i && styles.chipTextActive]}>
                  {syllable}
                </Text>
              </Animated.View>
            </TouchableOpacity>
            {i < syllables.length - 1 && (
              <Text style={styles.dot}>·</Text>
            )}
          </React.Fragment>
        ))}
      </View>
    </View>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
    marginBottom: 4,
  },
  playBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#6C4AB6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playBtnActive: {
    backgroundColor: '#9B59B6',
  },
  chipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(108, 74, 182, 0.5)',
    backgroundColor: 'rgba(108, 74, 182, 0.08)',
  },
  chipActive: {
    backgroundColor: '#6C4AB6',
    borderColor: '#6C4AB6',
  },
  chipText: {
    fontFamily: 'Fredoka-Regular',
    fontSize: 14,
    color: '#5B2DC0',
    letterSpacing: 0.3,
  },
  chipTextActive: {
    color: '#fff',
    fontFamily: 'Fredoka-SemiBold',
  },
  dot: {
    fontSize: 16,
    color: 'rgba(108, 74, 182, 0.4)',
    fontWeight: 'bold',
    marginHorizontal: -2,
  },
});
