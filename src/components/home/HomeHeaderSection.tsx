// 📖 What this does:
// Renders everything above the pack grid in HomeScreen:
// logo row, greeting card (mascot + streak), daily word banner, progress banner,
// and the "Your Packs" section label. Passed as ListHeaderComponent to the FlatList
// in HomeScreen so the whole screen virtualises as a single scroll unit.

import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { LumiMascot, MascotState } from "../common/LumiMascot";
import { DailyWordBanner } from "./DailyWordBanner";
import { WoodenSign } from "./WoodenSign";
import { colors } from "../../constants/colors";
import { buttonGradientColors } from "../../constants/skeuomorphicTokens";
import { styles } from "./HomeHeaderSectionStyles";

const WORD_GOAL = 10;
const GEM_COLORS = ["#FF6B6B", "#4ECDC4", "#FFD93D", "#7C3AED", "#FF9A2E"];

interface Props {
  firstName: string;
  streak: number;
  wordCount: number;
  dailyWord: string;
  dailyFound: boolean;
  mascotState: MascotState;
  onTrophyPress: () => void;
  onProgressPress: () => void;
}

export const HomeHeaderSection: React.FC<Props> = ({
  firstName,
  streak,
  wordCount,
  dailyWord,
  dailyFound,
  mascotState,
  onTrophyPress,
  onProgressPress,
}) => {
  const navigation = useNavigation();
  const progressRatio = Math.min(wordCount / WORD_GOAL, 1);

  return (
    <View style={styles.container}>
      <View style={styles.logoRow}>
        <WoodenSign />
      </View>

      <LinearGradient colors={["#FFB347", "#FF9A2E", "#C96B00"]} style={styles.headerCard}>
        <LinearGradient
          colors={buttonGradientColors.sheen}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 0.45 }}
          style={styles.headerSheen}
          pointerEvents="none"
        />
        <Ionicons name="sparkles" size={14} color="rgba(255,255,255,0.35)" style={styles.deco1} />
        <Ionicons name="sparkles" size={9}  color="rgba(255,255,255,0.25)" style={styles.deco2} />
        <Ionicons name="sparkles" size={12} color="rgba(255,255,255,0.3)"  style={styles.deco3} />
        <Ionicons name="sparkles" size={10} color="rgba(255,255,255,0.2)"  style={styles.deco4} />
        <Ionicons name="sparkles" size={8}  color="rgba(255,255,255,0.28)" style={styles.deco5} />
        <View style={styles.mascotCircle}>
          <LumiMascot state={mascotState} size={90} />
        </View>
        <View style={styles.greetingBlock}>
          <Text style={styles.greeting}>Hello, {firstName}!</Text>
          <Text style={styles.subGreeting}>Ready to explore?</Text>
          {streak >= 3 && (
            <View style={styles.streakBadge}>
              <Ionicons name="flame" size={13} color={colors.accentYellow} />
              <Text style={styles.streakText}>{streak} day streak</Text>
            </View>
          )}
        </View>
        <TouchableOpacity style={styles.trophyWrap} onPress={onTrophyPress} accessibilityLabel="View achievements" accessibilityRole="button">
          <View style={styles.trophyCircle}>
            <Ionicons name="trophy" size={38} color="#FFF" />
          </View>
        </TouchableOpacity>
      </LinearGradient>

      <DailyWordBanner word={dailyWord} isFound={dailyFound} />

      <TouchableOpacity style={styles.progressBanner} activeOpacity={0.85} onPress={onProgressPress} accessibilityLabel="Words found, tap to see collection" accessibilityRole="button">
        <View style={styles.progressLeft}>
          <View style={styles.gemRow}>
            {GEM_COLORS.slice(0, Math.min(3, wordCount)).map((color, i) => (
              <View key={i} style={[styles.gem, { backgroundColor: color + "22", borderColor: color }]}>
                <Ionicons name="star" size={11} color={color} />
              </View>
            ))}
            {wordCount > 3 && <Text style={styles.gemMore}>+{wordCount - 3}</Text>}
          </View>
          <Text style={styles.progressCount}>{wordCount}/{WORD_GOAL} words</Text>
          <Text style={styles.progressSub}>Tap to see your collection</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.primary} />
      </TouchableOpacity>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progressRatio * 100}%` }]} />
      </View>

      <View style={styles.sectionRow}>
        <Ionicons name="star" size={20} color={colors.accentYellow} />
        <Text style={styles.sectionTitle}>Your Packs</Text>
        <TouchableOpacity onPress={() => (navigation as any).navigate("Library")} accessibilityLabel="View all packs" accessibilityRole="button">
          <Text style={styles.viewAll}>View All</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
