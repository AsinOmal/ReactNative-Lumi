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

interface Props {
  pack: Pack;
  onPress: () => void;
}

export const ColorPackCard: React.FC<Props> = ({ pack, onPress }) => {
  const gradient = getPackGradient(pack.id);
  const icon = getPackIcon(pack.id);
  const strings = useStrings();
  const dlStatus = usePackDownloadStore((s) => s.packs[pack.id]?.status);
  const isPurchased = usePurchaseStore((s) => s.isPurchased(pack.id));
  // Bundled (or legacy/undefined-typed) packs are already available — no badge.
  const showBadge = !!pack.packType && pack.packType !== 'bundled';
  // Premium + not yet purchased → cover is dimmed and a centered price chip
  // signals "tap to unlock" instead of the easily-missed corner padlock.
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
      {/* Single thin warm-brown outline + soft shadow — the cover art is the
          hero so the frame stays out of the way. */}
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
            <View style={styles.lockBadge}>
              <Ionicons name="checkmark" size={14} color="#FFF" />
            </View>
          )}
          {showBadge && <DownloadBadge status={dlStatus} />}
        </View>
        <View style={styles.footer}>
          <Text style={styles.name} numberOfLines={1}>
            {pack.name}
          </Text>
          <View style={styles.packProgressTrack}>
            <LinearGradient
              colors={gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.packProgressFill, { width: '0%' }]}
            />
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.wordCount}>0/{pack.wordCount} words</Text>
            {pack.isPremium ? (
              <View style={[styles.badge, styles.badgePremium]}>
                <Ionicons name="star" size={9} color={colors.accentAmber} />
                <Text style={[styles.badgeText, { color: colors.accentAmber }]}>
                  Premium
                </Text>
              </View>
            ) : (
              <View style={[styles.badge, styles.badgeFree]}>
                <Ionicons
                  name="checkmark"
                  size={9}
                  color={colors.successDark}
                />
                <Text style={[styles.badgeText, { color: colors.successDark }]}>
                  Free
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: '#C48A4A',
    overflow: 'hidden',
    shadowColor: '#3D2008',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 10,
    elevation: 4,
  },
  header: {
    aspectRatio: 1,
    overflow: 'hidden',
    backgroundColor: colors.primaryLight,
  },
  iconWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  lockBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(34,197,94,0.92)',
    borderRadius: 12,
    padding: 4,
  },
  // Dark wash over the cover when premium + unpurchased — reads as "locked"
  // without removing the art entirely (kid still sees what they're unlocking).
  lockedDim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.42)',
  },
  // Flex-centered wrapper — guarantees the chip is dead-centre regardless of
  // its actual width (price strings can be variable length). The earlier
  // fixed-translate version drifted left because the negative offsets were
  // hand-tuned to one price label.
  lockedChipWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: colors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  lockedChipText: {
    fontFamily: 'Fredoka-Bold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  footer: { padding: 10, gap: 5 },
  packProgressTrack: {
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(0,0,0,0.06)',
    overflow: 'hidden',
  },
  packProgressFill: { height: 3, borderRadius: 2 },
  name: { fontFamily: 'Fredoka-Bold', fontSize: 17, color: colors.textDark },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  wordCount: {
    fontFamily: 'Fredoka-Regular',
    fontSize: 13,
    color: colors.textMid,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeFree: { backgroundColor: '#DCFCE7' },
  badgePremium: { backgroundColor: '#FEF3C7' },
  badgeText: { fontFamily: 'Fredoka-SemiBold', fontSize: 11 },
});
