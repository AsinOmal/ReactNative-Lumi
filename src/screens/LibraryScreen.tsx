import React from 'react';
import {
  Text,
  ScrollView,
  StatusBar,
  View,
  Image,
  ImageBackground,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { usePackStore } from '../store/usePackStore';
import { useRemoteContentStore } from '../store/useRemoteContentStore';
import { PackGrid } from '../components/home/PackGrid';
import { ImageBackdrop } from '../components/scenes/ImageBackdrop';
import { colors } from '../constants/colors';
import { styles } from './LibraryScreenStyles';

// Faint decoration icons live behind the scrollview — three quiet shapes,
// pointerEvents="none" so they never block scroll/tap.
const Decorations: React.FC = () => (
  <View style={styles.decorLayer} pointerEvents="none">
    <Ionicons
      name="book"
      size={64}
      color={colors.textDark}
      style={styles.decorBook}
    />
    <Ionicons
      name="star"
      size={38}
      color={colors.accentAmber}
      style={styles.decorStar}
    />
    <Ionicons
      name="bookmark"
      size={42}
      color={colors.textDark}
      style={styles.decorMark}
    />
  </View>
);

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
  const showPremium =
    premiumPacks.length > 0 && appConfig?.premiumPacksEnabled !== false;

  return (
    <ImageBackdrop
      source={require('../assets/backgrounds/library-screen-bg.png')}
    >
      <StatusBar barStyle="dark-content" />
      <Decorations />

      <ImageBackground
        source={require('../assets/backgrounds/library-screen-header.png')}
        style={[styles.header, { paddingTop: insets.top + 12 }]}
        imageStyle={styles.headerImage}
        resizeMode="cover"
      >
        <View style={styles.titleBlock}>
          <Text style={styles.title}>My Library</Text>
          <View style={styles.countRow}>
            <Ionicons name="star" size={18} color={colors.accentYellow} />
            <Text style={styles.subtitle}>
              {packs.length} packs available
            </Text>
          </View>
        </View>
        <Image
          source={require('../assets/images/library-screen-icon.png')}
          style={styles.icon}
          resizeMode="contain"
          accessibilityIgnoresInvertColors
        />
      </ImageBackground>

      <ScrollView
        style={styles.body}
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + 160 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {freePacks.length > 0 && (
          <>
            <View style={styles.sectionPill}>
              <Ionicons name="star" size={16} color={colors.accentYellow} />
              <Text style={styles.sectionLabel}>Free Packs</Text>
            </View>
            <PackGrid packs={freePacks} loading={loading} />
          </>
        )}
        {showPremium && (
          <>
            <View style={styles.sectionPill}>
              <Ionicons name="star" size={16} color={colors.accentAmber} />
              <Text style={styles.sectionLabel}>Premium Packs</Text>
            </View>
            <PackGrid packs={premiumPacks} loading={false} />
          </>
        )}
      </ScrollView>
    </ImageBackdrop>
  );
};
