// 📖 What this does:
// One row in the Saved Words or Wishlist tab. Mode prop drives icon, AR button
// vs trash button, and card accent. Extracted so SavedWordsScreen stays under
// the 150-line rule. formatDate lives here so it travels with the display logic.

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
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
  const navigation = useNavigation();
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
      {isSaved ? (
        <TouchableOpacity
          style={styles.arBtn}
          activeOpacity={0.8}
          onPress={() =>
            (navigation as any).navigate('MainTabs', {
              screen: 'Scan',
              params: { preloadWord: word },
            })
          }
          accessibilityLabel={`View ${display} in AR`}
          accessibilityRole="button"
        >
          <Text style={styles.arBtnText}>AR</Text>
          <Ionicons name="arrow-forward" size={13} color="#FFF" />
        </TouchableOpacity>
      ) : (
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
