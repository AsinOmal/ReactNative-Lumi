// 📖 What this does:
// Full-bleed promo screen shown when a user scans a word from a premium pack
// they haven't purchased. Uses the pack's gate artwork (uploaded via admin) as
// a full-screen background with a gradient overlay so text is readable.
// The goal: make it so compelling that a child immediately asks a parent to unlock it.

import React, { useEffect } from 'react';
import {
  View, Text, TouchableOpacity, ImageBackground, StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import type { Pack } from '../types/pack';
import { getPackGradient, getPackIcon } from '../constants/packAccents';
import { usePurchaseStore } from '../store/usePurchaseStore';
import { useStrings } from '../hooks/useStrings';
import { styles } from './PremiumPackGateScreenStyles';

export const PremiumPackGateScreen = () => {
  const strings = useStrings();
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const { word, pack } = route.params as { word: string; pack: Pack };
  const isPurchased = usePurchaseStore((s) => s.isPurchased(pack.id));
  const gradient = getPackGradient(pack.id);
  const icon = getPackIcon(pack.id);

  useEffect(() => {
    if (isPurchased) navigation.goBack();
  }, [isPurchased, navigation]);

  const handleUnlock = () => {
    (navigation as any).navigate('Checkout', { pack });
  };

  if (isPurchased) return null;

  const content = (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />

      <TouchableOpacity
        style={styles.closeBtn}
        onPress={() => navigation.goBack()}
        accessibilityRole="button"
        accessibilityLabel={strings.PREMIUM_GATE_DISMISS}
      >
        <Ionicons name="close" size={28} color="#fff" />
      </TouchableOpacity>

      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.92)']}
        style={styles.overlay}
      >
        <View style={styles.iconBubble}>
          <MaterialCommunityIcons name={icon} size={64} color="#fff" />
        </View>
        <Text style={styles.foundLabel}>{strings.PREMIUM_GATE_FOUND(word)}</Text>
        <Text style={styles.packName}>{strings.PREMIUM_GATE_SUBHEADING(pack.name)}</Text>
        <Text style={styles.bodyText}>
          {strings.PREMIUM_GATE_BODY(pack.wordCount)}
        </Text>

        <TouchableOpacity
          style={styles.ctaBtn}
          onPress={handleUnlock}
          activeOpacity={0.85}
          accessibilityRole="button"
        >
          <Ionicons name="lock-open-outline" size={20} color="#fff" />
          <Text style={styles.ctaText}>
            {strings.PREMIUM_GATE_CTA(strings.PACK_PRICE)}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          style={styles.dismissLink}
        >
          <Text style={styles.dismissText}>{strings.PREMIUM_GATE_DISMISS}</Text>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );

  if (pack.gateImageUrl) {
    return (
      <ImageBackground source={{ uri: pack.gateImageUrl }} style={styles.bg} resizeMode="cover">
        {content}
      </ImageBackground>
    );
  }

  return (
    <LinearGradient colors={gradient} style={styles.bg}>
      {content}
    </LinearGradient>
  );
};
