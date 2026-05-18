import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
  ImageBackground,
  ImageSourcePropType,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../constants/colors';
import { ImageBackdrop } from '../components/scenes/ImageBackdrop';
import { useRemoteContentStore } from '../store/useRemoteContentStore';
import { styles } from './PlaygroundScreenStyles';

interface GameCard {
  key: string;
  title: string;
  desc: string;
  iconName: string;
  cover?: ImageSourcePropType;
  accent: string;
  available: boolean;
  badgeText?: string;
}

const GAMES: GameCard[] = [
  {
    key: 'ARWordFind',
    title: 'AR Word Find',
    desc: 'Find 3D models hidden in your room!',
    iconName: 'target',
    cover: require('../assets/coverarts/AR-Word-Find.png'),
    accent: colors.accentCoral,
    available: true,
  },
  {
    key: 'MakeAMeal',
    title: 'Make a Meal',
    desc: 'Cook recipes with AR ingredients!',
    iconName: 'silverware-fork-knife',
    cover: require('../assets/coverarts/Make-A-Meal.png'),
    accent: colors.accentOrange,
    available: true,
  },
  {
    key: 'ScanAndCount',
    title: 'Scan & Count',
    desc: 'Count 3D models all around you!',
    iconName: 'counter',
    cover: require('../assets/coverarts/Scan-Count-Mode.png'),
    accent: colors.accentMint,
    available: true,
  },
  {
    key: 'WriteAndScan',
    title: 'Write & Scan',
    desc: 'See the model, write the word, scan to check!',
    iconName: 'pencil-box-outline',
    cover: require('../assets/coverarts/Write-And-Scan.png'),
    accent: colors.accentYellow,
    available: true,
  },
];

export const PlaygroundScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const appConfig = useRemoteContentStore((s) => s.appConfig);
  const arGamesEnabled = appConfig?.arGamesEnabled !== false;
  const effectiveGames = arGamesEnabled
    ? GAMES
    : GAMES.map((g) =>
        g.available ? { ...g, available: false, badgeText: 'Off' } : g
      );

  return (
    <ImageBackdrop
      source={require('../assets/backgrounds/playground-screen-bg.png')}
    >
      <StatusBar barStyle="dark-content" />

      {/* Shared header treatment with LibraryScreen — same panoramic cloudy
          backdrop, title block on the left, scene-specific art on the right.
          Visual consistency across the two top-level catalog screens. */}
      <ImageBackground
        source={require('../assets/backgrounds/library-screen-header.png')}
        style={[styles.header, { paddingTop: insets.top + 12 }]}
        imageStyle={styles.headerImage}
        resizeMode="cover"
      >
        <View style={styles.titleBlock}>
          <Text style={styles.title}>Playground</Text>
          <View style={styles.countRow}>
            <Ionicons
              name="game-controller"
              size={18}
              color={colors.accentYellow}
            />
            <Text style={styles.subtitle}>Pick a game to play!</Text>
          </View>
        </View>
        <Image
          source={require('../assets/images/play-screen-icon.png')}
          style={styles.headerIcon}
          resizeMode="contain"
          accessibilityIgnoresInvertColors
        />
      </ImageBackground>

      <ScrollView
        style={styles.body}
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.grid}>
          {effectiveGames.map((game) => (
            <TouchableOpacity
              key={game.key}
              style={[
                styles.card,
                { shadowColor: game.accent },
                !game.available && styles.cardLocked,
              ]}
              onPress={() =>
                game.available && (navigation as any).navigate(game.key)
              }
              activeOpacity={game.available ? 0.85 : 1}
              accessibilityLabel={game.title}
              accessibilityHint={
                game.available ? game.desc : game.badgeText ?? 'Coming soon'
              }
              accessibilityRole="button"
            >
              <View
                style={[
                  styles.iconArea,
                  game.cover
                    ? null
                    : {
                        backgroundColor: game.available
                          ? game.accent
                          : '#CBD5E1',
                      },
                ]}
              >
                {game.cover ? (
                  <Image
                    source={game.cover}
                    style={styles.iconAreaImage}
                    resizeMode="cover"
                  />
                ) : (
                  <MaterialCommunityIcons
                    name={game.iconName}
                    size={52}
                    color="rgba(255,255,255,0.95)"
                  />
                )}
              </View>
              <View style={styles.cardFooter}>
                <View style={styles.titleRow}>
                  <Text
                    style={[
                      styles.cardTitle,
                      !game.available && styles.cardTitleLocked,
                    ]}
                    numberOfLines={1}
                  >
                    {game.title}
                  </Text>
                  {game.available && (
                    <View style={styles.playBtn}>
                      <Ionicons name="play" size={16} color="#FFF" />
                    </View>
                  )}
                  {!game.available && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>
                        {game.badgeText ?? 'Soon'}
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={styles.cardDesc} numberOfLines={2}>
                  {game.desc}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </ImageBackdrop>
  );
};
