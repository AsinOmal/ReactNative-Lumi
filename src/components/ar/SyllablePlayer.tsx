/**
 * SyllablePlayer.tsx
 *
 * Displays a word as tappable syllable chips (e.g. [Ap] · [ple]).
 * The 🔊 button plays the full-word pronunciation audio via expo-av.
 * Tapping a chip triggers a brief pulse animation (visual feedback only —
 * full per-syllable audio is a stretch goal requiring separate audio clips).
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
} from 'react-native';
import { Audio } from 'expo-av';
import Ionicons from 'react-native-vector-icons/Ionicons';
import type { ModelEntry } from '../../utils/modelRegistry';

interface Props {
  entry: ModelEntry | null;
}

export const SyllablePlayer: React.FC<Props> = ({ entry }) => {
  const soundRef = useRef<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeSyllable, setActiveSyllable] = useState<number | null>(null);

  // ── Load audio whenever the word changes ──────────────────────────────────
  useEffect(() => {
    let mounted = true;

    const loadSound = async () => {
      // Unload previous sound before loading new one
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
      if (!entry?.audio) return;

      try {
        const { sound } = await Audio.Sound.createAsync(entry.audio, {
          shouldPlay: false,
        });
        if (mounted) {
          soundRef.current = sound;
          sound.setOnPlaybackStatusUpdate(status => {
            if (status.isLoaded && status.didJustFinish) {
              setIsPlaying(false);
              setActiveSyllable(null);
            }
          });
        } else {
          await sound.unloadAsync(); // mounted check too late
        }
      } catch {
        // Audio load failure is non-fatal
      }
    };

    loadSound();
    return () => {
      mounted = false;
    };
  }, [entry?.audio]);

  // Unload on unmount
  useEffect(() => {
    return () => {
      soundRef.current?.unloadAsync();
    };
  }, []);

  // ── Play full word ────────────────────────────────────────────────────────
  const playWord = useCallback(async () => {
    if (!soundRef.current || isPlaying) return;
    try {
      await soundRef.current.setPositionAsync(0);
      await soundRef.current.playAsync();
      setIsPlaying(true);
    } catch {
      setIsPlaying(false);
    }
  }, [isPlaying]);

  // ── Syllable chip tap — pulse animation + play full word ─────────────────
  const chipScales = useRef<Animated.Value[]>([]);

  const onChipPress = useCallback(
    (index: number) => {
      // Animate the tapped chip
      if (!chipScales.current[index]) return;
      setActiveSyllable(index);
      Animated.sequence([
        Animated.spring(chipScales.current[index], {
          toValue: 1.2,
          useNativeDriver: true,
          tension: 200,
          friction: 5,
        }),
        Animated.spring(chipScales.current[index], {
          toValue: 1,
          useNativeDriver: true,
          tension: 200,
          friction: 8,
        }),
      ]).start();

      playWord(); // plays the full word for now
    },
    [playWord],
  );

  if (!entry) return null;

  // Ensure we have an Animated.Value per syllable
  const syllables = entry.syllables;
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

      {/* Syllable chips */}
      <View style={styles.chipsRow}>
        {syllables.map((syllable, i) => (
          <React.Fragment key={i}>
            <TouchableOpacity onPress={() => onChipPress(i)} activeOpacity={0.75}>
              <Animated.View
                style={[
                  styles.chip,
                  activeSyllable === i && styles.chipActive,
                  { transform: [{ scale: chipScales.current[i] ?? new Animated.Value(1) }] },
                ]}
              >
                <Text style={[styles.chipText, activeSyllable === i && styles.chipTextActive]}>
                  {syllable}
                </Text>
              </Animated.View>
            </TouchableOpacity>
            {/* Separator dot between chips (not after the last one) */}
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
