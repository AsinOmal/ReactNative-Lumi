/**
 * Child-friendly gate shown when a scanned word belongs to a pack that hasn't
 * been downloaded yet. Routes here from ScanScreen — never the entry point.
 *
 * On `'downloaded'` we auto-go-back so the child lands in the same scan view
 * and can re-trigger AR via another scan; opening AR directly from here would
 * fight the in-flight Vision Camera teardown.
 *
 * Two visual modes: when the pack has a `gateImageUrl`, the screen renders
 * full-bleed cinematic with a dark gradient overlay (mirroring the premium
 * gate). Otherwise it falls back to the original white card layout — keeps
 * unmigrated packs looking correct.
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ImageBackground,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import type { Pack } from '../types/pack';
import { usePackDownload } from '../hooks/usePackDownload';
import { getPackGradient, getPackIcon } from '../constants/packAccents';
import { useStrings } from '../hooks/useStrings';
import { colors } from '../constants/colors';
import { styles } from './PackGateScreenStyles';

export const PackGateScreen = () => {
  const strings = useStrings();
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const { word, pack } = route.params as { word: string; pack: Pack };
  const {
    status,
    progress,
    downloadedFiles,
    totalFiles,
    errorMessage,
    download,
  } = usePackDownload(pack);
  const gradient = getPackGradient(pack.id);
  const icon = getPackIcon(pack.id);
  const hasHero = !!pack.gateImageUrl;

  useEffect(() => {
    if (status === 'downloaded') {
      navigation.goBack();
    }
  }, [status, navigation]);

  const dismissBtn = (
    <TouchableOpacity
      style={styles.dismiss}
      onPress={() => navigation.goBack()}
      accessibilityLabel={strings.packGateDismiss}
      accessibilityRole="button"
    >
      <Ionicons
        name="close"
        size={28}
        color={hasHero ? '#FFFFFF' : colors.textMid}
      />
    </TouchableOpacity>
  );

  const heading = (
    <Text style={hasHero ? styles.headingLight : styles.heading}>
      {strings.packFoundFmt(word)}
    </Text>
  );
  const subtext = (
    <Text style={hasHero ? styles.subtextLight : styles.subtext}>
      {strings.packGateSubtext}
    </Text>
  );

  const progressBlock = status === 'downloading' && (
    <View style={styles.progressBlock}>
      <ActivityIndicator
        size="large"
        color={hasHero ? '#FFFFFF' : colors.primary}
      />
      <Text style={hasHero ? styles.progressTextLight : styles.progressText}>
        {strings.downloadProgressFmt(downloadedFiles, totalFiles)}
      </Text>
      <View style={hasHero ? styles.barTrackLight : styles.barTrack}>
        <View
          style={[styles.barFill, { width: `${Math.round(progress * 100)}%` }]}
        />
      </View>
    </View>
  );

  const errorBlock = status === 'error' && (
    <Text style={styles.errorText}>{errorMessage ?? strings.error}</Text>
  );

  const ctaBlock = status !== 'downloading' && (
    <TouchableOpacity
      style={styles.cta}
      onPress={download}
      accessibilityRole="button"
    >
      <Ionicons name="cloud-download" size={20} color="#FFF" />
      <Text style={styles.ctaText}>
        {status === 'error' ? strings.downloadPack : strings.packGateCta}
      </Text>
    </TouchableOpacity>
  );

  const dismissLink = (
    <TouchableOpacity
      onPress={() => navigation.goBack()}
      style={styles.dismissLink}
      accessibilityRole="button"
    >
      <Text style={hasHero ? styles.dismissTextLight : styles.dismissText}>
        {strings.packGateDismiss}
      </Text>
    </TouchableOpacity>
  );

  if (hasHero) {
    return (
      <ImageBackground
        source={{ uri: pack.gateImageUrl }}
        style={styles.bg}
        resizeMode="cover"
      >
        <View style={[styles.containerHero, { paddingTop: insets.top + 16 }]}>
          <StatusBar barStyle="light-content" />
          {dismissBtn}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.92)']}
            style={styles.overlay}
          >
            {heading}
            {subtext}
            {progressBlock}
            {errorBlock}
            {ctaBlock}
            {dismissLink}
          </LinearGradient>
        </View>
      </ImageBackground>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + 16 }]}>
      <StatusBar barStyle="dark-content" />
      {dismissBtn}
      <View style={styles.center}>
        <LinearGradient colors={gradient} style={styles.bubble}>
          <MaterialCommunityIcons name={icon} size={72} color="#FFF" />
        </LinearGradient>
        {heading}
        {subtext}
        {progressBlock}
        {errorBlock}
        {ctaBlock}
        {dismissLink}
      </View>
    </View>
  );
};
