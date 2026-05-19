// 📖 What this does:
// Hero header for pack detail screens. Fully transparent — the background
// image shows through. A soft peach LinearGradient wraps only the title block
// so the pack name stays readable against any background art without a heavy
// solid colour band across the screen.

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import FastImage from 'react-native-fast-image';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import type { EdgeInsets } from 'react-native-safe-area-context';
import type { Pack } from '../../types/pack';
import { useStrings } from '../../hooks/useStrings';
import { styles } from './PackDetailHeaderStyles';

interface Props {
  pack: Pack;
  accent: string;
  insets: EdgeInsets;
  onBack: () => void;
}

export const PackDetailHeader: React.FC<Props> = ({
  pack,
  accent: _accent,
  insets,
  onBack,
}) => {
  const strings = useStrings();
  return (
    <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
      <View style={styles.navRow}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={onBack}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Ionicons name="chevron-back" size={28} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.appName}>LUMI</Text>
        <View style={styles.navSpacer} />
      </View>

      <View style={styles.heroRow}>
        <LinearGradient
          colors={['rgba(255,180,100,0.88)', 'rgba(255,180,100,0.15)']}
          style={styles.titleGlow}
        >
          <Text style={styles.packName}>{pack.name}</Text>
          <Text style={styles.subtitle}>
            {strings.PACK_WORDS_TO_DISCOVER(pack.wordCount)}
          </Text>
        </LinearGradient>
        {pack.coverImageUrl ? (
          <FastImage
            source={{ uri: pack.coverImageUrl }}
            style={styles.coverArt}
            resizeMode={FastImage.resizeMode.contain}
          />
        ) : null}
      </View>
    </View>
  );
};
