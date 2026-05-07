import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import LinearGradient from "react-native-linear-gradient";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { colors } from "../constants/colors";
import { GameBackground } from "../components/common/GameBackground";
import { buttonGradientColors } from "../constants/skeuomorphicTokens";
import { useRemoteContentStore } from "../store/useRemoteContentStore";
import { styles } from "./PlaygroundScreenStyles";

interface GameCard {
  key: string;
  title: string;
  desc: string;
  iconName: string;
  accent: string;
  available: boolean;
  badgeText?: string;
}

const GAMES: GameCard[] = [
  {
    key: "ARWordFind",
    title: "AR Word Find",
    desc: "Find 3D models hidden in your room!",
    iconName: "target",
    accent: colors.accentCoral,
    available: true,
  },
  {
    key: "MakeAMeal",
    title: "Make a Meal",
    desc: "Cook recipes with AR ingredients!",
    iconName: "silverware-fork-knife",
    accent: colors.accentOrange,
    available: true,
  },
  {
    key: "ScanAndCount",
    title: "Scan & Count",
    desc: "Count 3D models all around you!",
    iconName: "counter",
    accent: colors.accentMint,
    available: true,
  },
  {
    key: "ComingSoon",
    title: "Coming Soon",
    desc: "More exciting games are on the way!",
    iconName: "star-outline",
    accent: "#CBD5E1",
    available: false,
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
        g.available ? { ...g, available: false, badgeText: "Off" } : g
      );

  return (
    <GameBackground>
      <StatusBar barStyle="dark-content" />

      {/* Coral → orange gradient — wave bottom, gamepad watermark */}
      <LinearGradient
        colors={buttonGradientColors.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + 16 }]}
      >
        <MaterialCommunityIcons
          name="gamepad-variant-outline"
          size={190}
          color="rgba(255,255,255,0.08)"
          style={styles.watermark}
        />
        <Text style={styles.title}>Playground</Text>
        <Text style={styles.subtitle}>Pick a game to play!</Text>
      </LinearGradient>

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
                game.available ? game.desc : game.badgeText ?? "Coming soon"
              }
              accessibilityRole="button"
            >
              <View
                style={[
                  styles.iconArea,
                  { backgroundColor: game.available ? game.accent : "#CBD5E1" },
                ]}
              >
                <MaterialCommunityIcons
                  name={game.iconName}
                  size={52}
                  color="rgba(255,255,255,0.95)"
                />
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
                    <View
                      style={[styles.playBtn, { backgroundColor: game.accent }]}
                    >
                      <Ionicons name="play" size={14} color="#FFF" />
                    </View>
                  )}
                  {!game.available && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>
                        {game.badgeText ?? "Soon"}
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
    </GameBackground>
  );
};

