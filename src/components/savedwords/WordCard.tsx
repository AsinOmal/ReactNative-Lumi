// 📖 What this does:
// One row in the Saved Words or Wishlist tab. Mode prop drives icon, trailing
// action (none on saved, trash on wishlist) and card accent. Extracted so
// SavedWordsScreen stays under the 150-line rule.

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { MODEL_REGISTRY } from '../../utils/modelRegistry';
import { useLanguageStore } from '../../store/useLanguageStore';
import { colors } from '../../constants/colors';
import { styles } from '../../screens/SavedWordsScreenStyles';

function formatDate(ts: number): string {
  if (!ts) {
    return 'Saved earlier';
  }
  return new Date(ts).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

interface Props {
  word: string;
  timestamp: number;
  mode: 'saved' | 'wish';
  onRemove?: () => void;
}

export const WordCard: React.FC<Props> = ({
  word,
  timestamp,
  mode,
  onRemove,
}) => {
  const display = word.charAt(0).toUpperCase() + word.slice(1);
  const isSaved = mode === 'saved';
  const language = useLanguageStore((s) => s.language);
  const sinhalaLabel = MODEL_REGISTRY[word]?.sinhalaLabel;

  return (
    <View style={[styles.card, !isSaved && styles.wishCard]}>
      <View style={[styles.emojiCircle, !isSaved && styles.wishEmojiCircle]}>
        {isSaved ? (
          <MaterialCommunityIcons
            name="cube-outline"
            size={26}
            color={colors.primary}
          />
        ) : (
          <Ionicons name="star" size={26} color={colors.accentYellow} />
        )}
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.wordText}>{display}</Text>
        {language === 'si' && sinhalaLabel ? (
          <Text style={styles.sinhalaLabel}>{sinhalaLabel}</Text>
        ) : null}
        <Text style={styles.dateText}>{formatDate(timestamp)}</Text>
      </View>
      {!isSaved && (
        <TouchableOpacity
          style={styles.trashBtn}
          onPress={onRemove}
          accessibilityLabel={`Remove ${display} from wishlist`}
          accessibilityRole="button"
        >
          <Ionicons name="trash-outline" size={20} color={colors.error} />
        </TouchableOpacity>
      )}
    </View>
  );
};
