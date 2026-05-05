import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Pack } from '../../services/packService';
import { getPackAccent } from '../../constants/packAccents';
import { colors } from '../../constants/colors';
import { woodBorderOuter, woodBorderInner, woodBorderContent } from '../../constants/skeuomorphicTokens';

interface Props {
  pack: Pack;
  onPress: () => void;
}

export const ColorPackCard: React.FC<Props> = ({ pack, onPress }) => {
  const accent = getPackAccent(pack.id);

  return (
    <TouchableOpacity style={[styles.touchable, { shadowColor: accent }]} onPress={onPress} activeOpacity={0.85} accessibilityLabel={`${pack.name} pack`} accessibilityHint="Double tap to open pack details" accessibilityRole="button">
      <View style={woodBorderOuter}>
        <View style={woodBorderInner}>
          <View style={[woodBorderContent, styles.cardContent]}>
            <View style={[styles.body, { backgroundColor: accent }]}>
              <MaterialCommunityIcons name="cube-outline" size={40} color="rgba(255,255,255,0.9)" />
            </View>
            <View style={styles.footer}>
              <Text style={styles.name} numberOfLines={1}>{pack.name}</Text>
              <View style={styles.metaRow}>
                <Text style={styles.wordCount}>{pack.wordCount} words</Text>
                {pack.isPremium
                  ? <View style={[styles.badge, styles.badgePremium]}>
                      <Ionicons name="star" size={9} color={colors.accentAmber} />
                      <Text style={[styles.badgeText, { color: colors.accentAmber }]}>Premium</Text>
                    </View>
                  : <View style={[styles.badge, styles.badgeFree]}>
                      <Ionicons name="checkmark" size={9} color={colors.successDark} />
                      <Text style={[styles.badgeText, { color: colors.successDark }]}>Free</Text>
                    </View>}
              </View>
            </View>
            {pack.isPremium && (
              <View style={styles.lockOverlay}>
                <Ionicons name="lock-closed" size={22} color="rgba(255,255,255,0.9)" />
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  touchable: {
    flex: 1,
    shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 6,
  },
  cardContent: { flex: 1 },
  body: {
    height: 110, alignItems: 'center', justifyContent: 'center',
  },
  footer: { padding: 10, gap: 4 },
  name: { fontFamily: 'Fredoka-Bold', fontSize: 16, color: colors.textDark },
  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  wordCount: { fontFamily: 'Fredoka-Regular', fontSize: 12, color: colors.textMid },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6,
  },
  badgeFree:    { backgroundColor: '#DCFCE7' },
  badgePremium: { backgroundColor: '#FEF3C7' },
  badgeText: { fontFamily: 'Fredoka-SemiBold', fontSize: 10 },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.28)',
    alignItems: 'center', justifyContent: 'center',
  },
});
