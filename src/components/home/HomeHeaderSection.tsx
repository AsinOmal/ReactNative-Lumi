// 📖 What this does:
// Renders everything above the pack grid in HomeScreen:
// logo row, greeting card (mascot + streak), daily word banner, progress banner,
// and the "Your Packs" section label. Passed as ListHeaderComponent to the FlatList
// in HomeScreen so the whole screen virtualises as a single scroll unit.

import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { LumiMascot } from "../common/LumiMascot";
import { DailyWordBanner } from "./DailyWordBanner";
import { colors } from "../../constants/colors";
import { styles } from "./HomeHeaderSectionStyles";

interface Props {
  firstName: string;
  streak: number;
  wordCount: number;
  dailyWord: string;
  dailyFound: boolean;
  onTrophyPress: () => void;
  onProgressPress: () => void;
}

export const HomeHeaderSection: React.FC<Props> = ({
  firstName,
  streak,
  wordCount,
  dailyWord,
  dailyFound,
  onTrophyPress,
  onProgressPress,
}) => (
  <View style={styles.container}>
    <View style={styles.logoRow}>
      <View style={styles.logoPlaceholder}>
        <Text style={styles.logoText}>LUMI</Text>
      </View>
    </View>

    <LinearGradient colors={["#FF9A2E", "#C96B00"]} style={styles.headerCard}>
      <MaterialCommunityIcons
        name="star-four-points"
        size={14}
        color="rgba(255,255,255,0.35)"
        style={styles.deco1}
      />
      <MaterialCommunityIcons
        name="star-four-points"
        size={9}
        color="rgba(255,255,255,0.25)"
        style={styles.deco2}
      />
      <MaterialCommunityIcons
        name="star-four-points"
        size={12}
        color="rgba(255,255,255,0.3)"
        style={styles.deco3}
      />
      <View style={styles.mascotCircle}>
        <LumiMascot state="idle" size={90} />
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
      <TouchableOpacity
        style={styles.trophyBtn}
        onPress={onTrophyPress}
        accessibilityLabel="View achievements"
        accessibilityRole="button"
      >
        <Ionicons name="trophy" size={28} color="#FFF" />
      </TouchableOpacity>
    </LinearGradient>

    <DailyWordBanner word={dailyWord} isFound={dailyFound} />

    <TouchableOpacity
      style={styles.progressBanner}
      activeOpacity={0.85}
      onPress={onProgressPress}
      accessibilityLabel="Words found, tap to see collection"
      accessibilityRole="button"
    >
      <View style={styles.progressLeft}>
        <Ionicons name="bookmark" size={22} color={colors.primary} />
        <View>
          <Text style={styles.progressCount}>{wordCount} words found</Text>
          <Text style={styles.progressSub}>Tap to see your collection</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.primary} />
    </TouchableOpacity>

    <View style={styles.sectionRow}>
      <MaterialCommunityIcons
        name="package-variant-closed"
        size={22}
        color={colors.primary}
      />
      <Text style={styles.sectionTitle}>Your Packs</Text>
    </View>
  </View>
);
