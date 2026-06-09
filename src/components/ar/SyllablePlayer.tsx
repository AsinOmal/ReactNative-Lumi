/**
 * SyllablePlayer.tsx
 *
 * Shows the word broken into syllables as plain display text (e.g. Ap · ple).
 * The 🔊 button plays the full word at normal speed.
 * The "Slow" toggle plays at 0.5× speed so kids can hear each part clearly.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { colors } from '../../constants/colors';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Sound from 'react-native-sound';
import Ionicons from 'react-native-vector-icons/Ionicons';
import type { ModelEntry } from '../../utils/modelRegistry';

// Play even when iPhone silent switch is on
Sound.setCategory('Playback');

interface Props {
  entry: ModelEntry | null;
}

export const SyllablePlayer: React.FC<Props> = ({ entry }) => {
  const soundRef = useRef<Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [slowMode, setSlowMode] = useState(false);

  // ── Load audio when word changes ─────────────────────────────────────────
  useEffect(() => {
    if (soundRef.current) {
      soundRef.current.release();
      soundRef.current = null;
    }
    setIsPlaying(false);

    const src = entry?.audioUrl || entry?.audio;
    if (!src) {
      return;
    }

    // Remote audio uses a URL (null basePath); local audio is in the app bundle
    const basePath = entry?.audioUrl ? null : Sound.MAIN_BUNDLE;
    const sound = new Sound(src, basePath as string, (error) => {
      if (!error) {
        soundRef.current = sound;
      }
    });

    return () => {
      sound.release();
      soundRef.current = null;
    };
  }, [entry?.audio, entry?.audioUrl]);

  useEffect(
    () => () => {
      soundRef.current?.release();
    },
    []
  );

  // ── Playback ──────────────────────────────────────────────────────────────
  const play = useCallback(() => {
    const sound = soundRef.current;
    if (!sound || isPlaying) {
      return;
    }

    sound.stop(() => {
      sound.setCurrentTime(0);
      sound.setSpeed(slowMode ? 0.5 : 1.0);
      setIsPlaying(true);
      sound.play(() => setIsPlaying(false));
    });
  }, [isPlaying, slowMode]);

  if (!entry) {
    return null;
  }

  const { syllables } = entry;

  return (
    <View style={styles.container}>
      {/* 🔊 Play button */}
      <TouchableOpacity
        style={[styles.playBtn, isPlaying && styles.playBtnActive]}
        onPress={play}
        activeOpacity={0.7}
        accessibilityLabel={
          isPlaying ? 'Stop pronunciation' : 'Play pronunciation'
        }
        accessibilityRole="button"
      >
        <Ionicons
          name={isPlaying ? 'volume-high' : 'volume-medium-outline'}
          size={20}
          color="#fff"
        />
      </TouchableOpacity>

      {/* Syllable display — plain text, no buttons */}
      <View style={styles.syllablesRow}>
        {syllables.map((syllable, i) => (
          <React.Fragment key={i}>
            <Text style={styles.syllableText}>{syllable}</Text>
            {i < syllables.length - 1 && <Text style={styles.dot}>·</Text>}
          </React.Fragment>
        ))}
      </View>

      {/* Slow toggle */}
      <TouchableOpacity
        style={[styles.slowBtn, slowMode && styles.slowBtnActive]}
        onPress={() => setSlowMode((prev) => !prev)}
        activeOpacity={0.75}
        accessibilityLabel={
          slowMode
            ? 'Slow mode on, tap to turn off'
            : 'Slow mode off, tap to turn on'
        }
        accessibilityRole="switch"
      >
        <Text
          style={[styles.slowBtnText, slowMode && styles.slowBtnTextActive]}
        >
          Slow
        </Text>
      </TouchableOpacity>
    </View>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFF7E8',
    borderWidth: 1,
    borderColor: '#E6D1AE',
    borderRadius: 24,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 10,
  },
  playBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#6C4AB6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playBtnActive: {
    backgroundColor: '#9B59B6',
  },
  syllablesRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  syllableText: {
    fontFamily: 'Fredoka-SemiBold',
    fontSize: 16,
    color: colors.primary,
    letterSpacing: 0.5,
  },
  dot: {
    fontSize: 18,
    color: 'rgba(108, 74, 182, 0.35)',
    fontWeight: 'bold',
  },
  slowBtn: {
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(108, 74, 182, 0.35)',
    backgroundColor: 'transparent',
  },
  slowBtnActive: {
    backgroundColor: '#6C4AB6',
    borderColor: '#6C4AB6',
  },
  slowBtnText: {
    fontFamily: 'Fredoka-Regular',
    fontSize: 13,
    color: '#6C4AB6',
  },
  slowBtnTextActive: {
    color: '#fff',
    fontFamily: 'Fredoka-SemiBold',
  },
});
