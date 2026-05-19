// 📖 What this does:
// Hero header for all pack detail screens — nav row (back + LUMI + spacer)
// plus a title block on the left and the pack's cover art on the right.
// Applied consistently to both free and premium branches of PackDetailScreen.

import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
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
  accent,
  insets,
  onBack,
}) => {
  const strings = useStrings();
  return (
  <LinearGradient
    colors={[accent, `${accent}BB`]}
    style={[styles.container, { paddingTop: insets.top + 12 }]}
  >
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
      <View style={styles.titleBlock}>
        <Text style={styles.packName}>{pack.name}</Text>
        <Text style={styles.subtitle}>
          {strings.PACK_WORDS_TO_DISCOVER(pack.wordCount)}
        </Text>
      </View>
      {pack.coverImageUrl ? (
        <Image
          source={{ uri: pack.coverImageUrl, cache: 'force-cache' }}
          style={styles.coverArt}
          resizeMode="contain"
        />
      ) : null}
    </View>
  </LinearGradient>
  );
};
