/**
 * Child-friendly gate shown when a scanned word belongs to a pack that hasn't
 * been downloaded yet.
 *
 * Layout: full-bleed gate image with a centred frosted cream card floating
 * over the illustration. Fallback (no gateImageUrl): pack gradient bg.
 * Auto-dismisses on status === 'downloaded'.
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  StatusBar,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import type { Pack } from '../types/pack';
import { usePackDownload } from '../hooks/usePackDownload';
import { getPackGradient, getPackEmoji } from '../constants/packAccents';
import { useStrings } from '../hooks/useStrings';
import { colors } from '../constants/colors';
import { styles } from './PackGateScreenStyles';

export const PackGateScreen = () => {
  const strings = useStrings();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { word, pack } = useRoute().params as { word: string; pack: Pack };
  const { status, progress, downloadedFiles, totalFiles, errorMessage, download } =
    usePackDownload(pack);
  const gradient = getPackGradient(pack.id);
  const emoji = getPackEmoji(pack.id);

  useEffect(() => {
    if (status === 'downloaded') navigation.goBack();
  }, [status, navigation]);

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

        <Text style={styles.foundTitle}>{strings.packFoundFmt(word)}</Text>
        <Text style={styles.belongsTo}>{strings.packGateBelongsTo(pack.name)}</Text>
        <Text style={styles.subtext}>{strings.packGateSubtext}</Text>

        {status === 'error' && (
          <Text style={styles.errorText}>{errorMessage ?? strings.error}</Text>
        )}

        {status === 'downloading' ? (
          <View style={styles.progressBlock}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.progressText}>
              {strings.downloadProgressFmt(downloadedFiles, totalFiles)}
            </Text>
            <View style={styles.barTrack}>
              <View style={[styles.barFill, { width: `${Math.round(progress * 100)}%` }]} />
            </View>
          </View>
        ) : (
          <TouchableOpacity style={styles.cta} onPress={download} accessibilityRole="button">
            <Ionicons name="cloud-download" size={20} color="#FFF" />
            <Text style={styles.ctaText}>
              {status === 'error' ? strings.downloadPack : strings.packGateCtaFmt(pack.name)}
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.dismissLink}
          accessibilityRole="button"
        >
          <Text style={styles.dismissText}>{strings.packGateDismiss}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const closeBtn = (
    <TouchableOpacity
      style={[styles.closeBtn, { top: insets.top + 12 }]}
      onPress={() => navigation.goBack()}
      accessibilityRole="button"
      accessibilityLabel={strings.packGateDismiss}
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
