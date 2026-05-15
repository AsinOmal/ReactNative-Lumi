// 📖 What this does:
// 3-stat summary card (words / streak / badges) that floats over the bottom of
// the SettingsScreen header via negative marginTop. Extracted so SettingsScreen
// stays under the 150-line rule.

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { colors } from "../../constants/colors";

interface Props {
  wordCount: number;
  streak: number;
  achievementCount: number;
}

const STATS = (wordCount: number, streak: number, achievementCount: number) => [
  { icon: "bookmark", bg: "#EDE9FE", color: colors.primary, value: String(wordCount), label: "Words" },
  { icon: "flame", bg: "#FEF3C7", color: colors.accentAmber, value: streak > 0 ? String(streak) : "—", label: "Streak" },
  { icon: "trophy", bg: "#FFF9C4", color: colors.accentYellow, value: String(achievementCount), label: "Badges" },
];

export const StatsCard: React.FC<Props> = ({ wordCount, streak, achievementCount }) => (
  <View style={styles.card}>
    {STATS(wordCount, streak, achievementCount).map((s, i) => (
      <React.Fragment key={s.label}>
        {i > 0 && <View style={styles.divider} />}
        <View style={styles.item}>
          <View style={[styles.icon, { backgroundColor: s.bg }]}>
            <Ionicons name={s.icon as any} size={20} color={s.color} />
          </View>
          <Text style={styles.value}>{s.value}</Text>
          <Text style={styles.label}>{s.label}</Text>
        </View>
      </React.Fragment>
    ))}
  </View>
);

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    marginTop: -44,
    backgroundColor: "#FFF",
    borderRadius: 24,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 12,
    shadowColor: "#5C3317",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 8,
  },
  item: { flex: 1, alignItems: "center", gap: 6 },
  icon: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  value: { fontFamily: "Fredoka-Bold", fontSize: 30, color: colors.textDark },
  label: { fontFamily: "Fredoka-Regular", fontSize: 16, color: colors.textMid },
  divider: { width: 1, height: 44, backgroundColor: "#F1F5F9" },
});
