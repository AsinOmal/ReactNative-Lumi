import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import FastImage from 'react-native-fast-image';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import type { Pack } from '../../types/pack';
import { getPackGradient, getPackIcon } from '../../constants/packAccents';
import { colors } from '../../constants/colors';
import { useStrings } from '../../hooks/useStrings';
import { usePackDownloadStore } from '../../store/usePackDownloadStore';
import { usePurchaseStore } from '../../store/usePurchaseStore';
import { playUI } from '../../utils/uiSound';
import { DownloadBadge } from './DownloadBadge';
import { styles } from './ColorPackCardStyles';

// 📖 Pack tile — collectible-feeling card. Cover art on top (~60-65% of card
// height), title + 'N words to discover' subtitle below, progress bar in
// pack-accent colour, and a soft "Free Pack" / "Premium" pill in the meta row.

interface Props {
  pack: Pack;
  onPress: () => void;
}

export const ColorPackCard: React.FC<Props> = ({ pack, onPress }) => {
  const gradient = getPackGradient(pack.id);
  const accent = gradient[0] ?? colors.primary;
  const icon = getPackIcon(pack.id);
  const strings = useStrings();
  const dlStatus = usePackDownloadStore((s) => s.packs[pack.id]?.status);
  const isPurchased = usePurchaseStore((s) => s.isPurchased(pack.id));
  const showBadge = !!pack.packType && pack.packType !== 'bundled';
  const showLockedOverlay = pack.isPremium && !isPurchased;

  const handlePress = () => {
    playUI('tap');
    onPress();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.85}
      accessibilityLabel={`${pack.name} pack`}
      accessibilityHint="Double tap to open pack details"
      accessibilityRole="button"
    >
      <View style={styles.card}>
        <View style={styles.header}>
          {pack.coverImageUrl ? (
            <FastImage
              source={{ uri: pack.coverImageUrl }}
              style={StyleSheet.absoluteFill}
              resizeMode={FastImage.resizeMode.cover}
            />
          ) : (
            <LinearGradient colors={gradient} style={StyleSheet.absoluteFill}>
              <View style={styles.iconWrap}>
                <MaterialCommunityIcons
                  name={icon}
                  size={48}
                  color="rgba(255,255,255,0.95)"
                />
              </View>
            </LinearGradient>
          )}
          {showLockedOverlay && (
            <>
              <View style={styles.lockedDim} pointerEvents="none" />
              <View style={styles.lockedChipWrap} pointerEvents="none">
                <View style={styles.lockedChip}>
                  <Ionicons name="lock-closed" size={14} color="#FFF" />
                  <Text style={styles.lockedChipText}>
                    {strings.PACK_PRICE}
                  </Text>
                </View>
              </View>
            </>
          )}
          {pack.isPremium && isPurchased && (
            <View style={styles.cornerCheck}>
              <Ionicons name="checkmark" size={14} color="#FFF" />
            </View>
          )}
          {showBadge && <DownloadBadge status={dlStatus} />}
        </View>

        <View style={styles.footer}>
          <Text style={styles.name} numberOfLines={1}>
            {pack.name}
          </Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {strings.PACK_WORDS_TO_DISCOVER(pack.wordCount)}
          </Text>

          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: '0%', backgroundColor: accent },
              ]}
            />
          </View>

          <View style={styles.metaRow}>
            <Text style={styles.wordCount}>0 / {pack.wordCount} found</Text>
            {pack.isPremium ? (
              <View style={[styles.pill, styles.pillPremium]}>
                <Ionicons name="star" size={13} color="#92400E" />
                <Text style={[styles.pillText, styles.pillTextPremium]}>
                  Premium
                </Text>
              </View>
            ) : (
              <View style={[styles.pill, styles.pillFree]}>
                <Ionicons name="checkmark" size={13} color="#2E9E58" />
                <Text style={[styles.pillText, styles.pillTextFree]}>
                  Free Pack
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};
