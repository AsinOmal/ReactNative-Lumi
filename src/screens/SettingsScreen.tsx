import React, { useState } from "react";
import { View, Text, ScrollView, StatusBar } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect, useIsFocused } from "@react-navigation/native";
import LinearGradient from "react-native-linear-gradient";
import { useAuthStore } from "../store/useAuthStore";
import { useUserProfile } from "../hooks/useUserProfile";
import { getApp } from "@react-native-firebase/app";
import { getAuth, signOut } from "@react-native-firebase/auth";
import { getProgress, getStreak } from "../utils/achievementStore";
import { colors } from "../constants/colors";
import { SkyScene } from "../components/scenes/SkyScene";
import { LumiMascot } from "../components/common/LumiMascot";
import { StatsCard } from "../components/settings/StatsCard";
import { SettingsRow } from "../components/settings/SettingsRow";
import { FeedbackModal } from "../components/settings/FeedbackModal";
import { EditUsernameModal } from "../components/settings/EditUsernameModal";
import { styles } from "./SettingsScreenStyles";

export const SettingsScreen = () => {
  const { user } = useAuthStore();
  const profile = useUserProfile(user?.uid);
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const [wordCount, setWordCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [achievementCount, setAchievementCount] = useState(0);
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [usernameVisible, setUsernameVisible] = useState(false);

  const headerName =
    profile.username || profile.displayName || user?.displayName || "Explorer";

  useFocusEffect(
    React.useCallback(() => {
      Promise.all([getProgress(), getStreak()])
        .then(([p, s]) => {
          setWordCount(p.scannedWords.length);
          setStreak(s);
          setAchievementCount(p.earned.length);
        })
        .catch(() => {});
    }, [])
  );

  const handleSignOut = async () => {
    try {
      await signOut(getAuth(getApp()));
    } catch (e) {
      console.error("[SettingsScreen] signOut:", e);
    }
  };

  return (
    <SkyScene paused={!isFocused}>
      <StatusBar barStyle="dark-content" />

      <LinearGradient
        colors={[colors.headerGradientStart, colors.headerGradientEnd]}
        style={[styles.header, { paddingTop: insets.top + 16 }]}
      >
        <LumiMascot state="idle" size={80} />
        <Text style={styles.displayName}>{headerName}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </LinearGradient>

      <StatsCard
        wordCount={wordCount}
        streak={streak}
        achievementCount={achievementCount}
      />

      <ScrollView
        style={styles.body}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionLabel}>Profile</Text>
        <View style={styles.section}>
          <SettingsRow iconName="person-outline" label="Edit Username" onPress={() => setUsernameVisible(true)} />
        </View>

        <Text style={styles.sectionLabel}>Parent Controls</Text>
        <View style={styles.section}>
          <SettingsRow iconName="lock-closed" label="Parent Dashboard" onPress={() => (navigation as any).navigate("ParentDashboard")} />
        </View>

        <Text style={styles.sectionLabel}>Support</Text>
        <View style={styles.section}>
          <SettingsRow iconName="chatbubble-outline" label="Send Feedback" onPress={() => setFeedbackVisible(true)} />
        </View>

        <Text style={styles.sectionLabel}>Account</Text>
        <View style={styles.section}>
          <SettingsRow iconName="log-out-outline" label="Sign Out" onPress={handleSignOut} danger />
        </View>
      </ScrollView>

      <FeedbackModal visible={feedbackVisible} uid={user?.uid ?? ""} email={user?.email ?? ""} onClose={() => setFeedbackVisible(false)} />
      <EditUsernameModal visible={usernameVisible} uid={user?.uid ?? ""} currentUsername={profile.username || profile.displayName || ""} onClose={() => setUsernameVisible(false)} />
    </SkyScene>
  );
};
