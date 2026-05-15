import React from 'react';
import { Text, ScrollView, StatusBar, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { usePackStore } from '../store/usePackStore';
import { useRemoteContentStore } from '../store/useRemoteContentStore';
import { PackGrid } from '../components/home/PackGrid';
import { ImageBackdrop } from '../components/scenes/ImageBackdrop';
import { colors } from '../constants/colors';
import {
  buttonGradientColors,
  shadowHeader,
} from '../constants/skeuomorphicTokens';

export const LibraryScreen = () => {
  const insets = useSafeAreaInsets();
  const { packs, loading, loadPacks } = usePackStore();
  const appConfig = useRemoteContentStore((s) => s.appConfig);

  useFocusEffect(
    React.useCallback(() => {
      loadPacks();
    }, [])
  );

  const freePacks = packs.filter((p) => !p.isPremium);
  const premiumPacks = packs.filter((p) => p.isPremium);

  return (
    <ImageBackdrop
      source={require('../assets/backgrounds/library-screen-bg.png')}
    >
      <StatusBar barStyle="dark-content" />

      <LinearGradient
        colors={buttonGradientColors.header}
        style={[styles.header, { paddingTop: insets.top + 16 }]}
      >
        <MaterialCommunityIcons
          name="bookshelf"
          size={180}
          color="rgba(255,255,255,0.08)"
          style={styles.watermark}
        />
        <Text style={styles.title}>My Library</Text>
        <View style={styles.countRow}>
          <Ionicons name="star" size={14} color={colors.accentYellow} />
          <Text style={styles.subtitle}>{packs.length} packs available</Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.body}
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {freePacks.length > 0 && (
          <>
            <View style={styles.sectionRow}>
              <Ionicons name="star" size={18} color={colors.accentYellow} />
              <Text style={styles.sectionLabel}>Free Packs</Text>
            </View>
            <PackGrid packs={freePacks} loading={loading} />
          </>
        )}
        {premiumPacks.length > 0 &&
          appConfig?.premiumPacksEnabled !== false && (
            <>
              <View style={styles.sectionRow}>
                <Ionicons name="star" size={18} color={colors.accentAmber} />
                <Text style={styles.sectionLabel}>Premium Packs</Text>
              </View>
              <PackGrid packs={premiumPacks} loading={false} />
            </>
          )}
      </ScrollView>
    </ImageBackdrop>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    overflow: 'hidden',
    ...shadowHeader,
  },
  watermark: { position: 'absolute', right: -24, bottom: -20 },
  title: { fontFamily: 'Fredoka-Bold', fontSize: 40, color: colors.textDark },
  countRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  subtitle: {
    fontFamily: 'Fredoka-Regular',
    fontSize: 16,
    color: colors.textMid,
  },
  body: { flex: 1 },
  scroll: { paddingHorizontal: 16, paddingTop: 24, gap: 12 },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  sectionLabel: {
    fontFamily: 'Fredoka-Bold',
    fontSize: 22,
    color: colors.textDark,
  },
});
