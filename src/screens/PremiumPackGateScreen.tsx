/**
 * Full-bleed promo screen shown when a user scans a word from a premium pack
 * they haven't purchased yet.
 *
 * Same frosted cream card layout as PackGateScreen — consistent discovery
 * feel across free download and premium purchase gates.
 * Auto-dismisses when isPurchased flips to true.
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import type { Pack } from '../types/pack';
import { getPackGradient, getPackEmoji } from '../constants/packAccents';
import { usePurchaseStore } from '../store/usePurchaseStore';
import { useStrings } from '../hooks/useStrings';
import { colors } from '../constants/colors';
import { styles } from './PremiumPackGateScreenStyles';

export const PremiumPackGateScreen = () => {
  const strings = useStrings();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { word, pack } = useRoute().params as { word: string; pack: Pack };
  const isPurchased = usePurchaseStore((s) => s.isPurchased(pack.id));
  const gradient = getPackGradient(pack.id);
  const emoji = getPackEmoji(pack.id);

  useEffect(() => {
    if (isPurchased) navigation.goBack();
  }, [isPurchased, navigation]);

  if (isPurchased) return null;

  const handleUnlock = () => {
    (navigation as any).navigate('Checkout', { pack });
  };

  const card = (
    <View style={styles.cardWrap}>
      <View style={styles.card}>
        {/* Badge */}
        <View style={styles.badgeWrap}>
          <View style={[styles.badgeCircle, { borderColor: gradient[0] + '40' }]}>
            <Text style={styles.badgeEmoji}>{emoji}</Text>
          </View>
          <View style={styles.sparkleDot}>
            <Ionicons name="star" size={10} color={colors.accentAmber} />
          </View>
        </View>

        <Text style={styles.foundTitle}>{strings.PREMIUM_GATE_FOUND(word)}</Text>
        <Text style={styles.belongsTo}>{strings.packGateBelongsTo(pack.name)}</Text>
        <Text style={styles.subtext}>{strings.PREMIUM_GATE_BODY(pack.wordCount)}</Text>

        <TouchableOpacity
          style={styles.cta}
          onPress={handleUnlock}
          activeOpacity={0.85}
          accessibilityRole="button"
        >
          <Ionicons name="lock-open-outline" size={20} color={colors.textDark} />
          <Text style={styles.ctaText}>
            {strings.PREMIUM_GATE_CTA_PACK(pack.name, strings.PACK_PRICE)}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          style={styles.dismissLink}
        >
          <Text style={styles.dismissText}>{strings.PREMIUM_GATE_DISMISS}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const closeBtn = (
    <TouchableOpacity
      style={[styles.closeBtn, { top: insets.top + 12 }]}
      onPress={() => navigation.goBack()}
      accessibilityRole="button"
      accessibilityLabel={strings.PREMIUM_GATE_DISMISS}
    >
      <View style={styles.closeBtnBg}>
        <Ionicons name="close" size={20} color="#FFF" />
      </View>
    </TouchableOpacity>
  );

  if (pack.gateImageUrl) {
    return (
      <View style={styles.bg}>
        <StatusBar barStyle="light-content" />
        <FastImage
          source={{ uri: pack.gateImageUrl }}
          style={StyleSheet.absoluteFill}
          resizeMode={FastImage.resizeMode.cover}
        />
        {closeBtn}
        {card}
      </View>
    );
  }

  return (
    <View style={styles.bg}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={[...gradient].reverse()} style={StyleSheet.absoluteFill} />
      {closeBtn}
      {card}
    </View>
  );
};
