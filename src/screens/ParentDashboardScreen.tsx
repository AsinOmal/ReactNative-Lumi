import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  ImageBackground,
} from "react-native";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import LottieView from "lottie-react-native";
import { useParentalControlsStore } from "../store/useParentalControlsStore";
import { useAuthStore } from "../store/useAuthStore";
import { useParentAuth } from "../hooks/useParentAuth";
import { loadActivityLog } from "../services/parentalControlsService";
import { ActivityLogEntry } from "../types/parentalControls";
import { PINEntryModal } from "../components/PINEntryModal";
import { PinLockoutModal } from "../components/PinLockoutModal";
import { ScreenTimeSummary } from "../components/parent/ScreenTimeSummary";
import { PINSecuritySection } from "../components/parent/PINSecuritySection";
import { ActivityLogList } from "../components/parent/ActivityLogList";
import { FlaggedWordsList } from "../components/parent/FlaggedWordsList";
import { BlocklistEditor } from "../components/parent/BlocklistEditor";
import { ParentAuthGate } from "../components/parent/ParentAuthGate";
import { useStrings } from "../hooks/useStrings";
import { colors } from "../constants/colors";
import { styles } from "./ParentDashboardStyles";

type Tab = "time" | "activity" | "flagged" | "blocklist";

export const ParentDashboardScreen: React.FC = () => {
  const strings = useStrings();
  const tabs: { key: Tab; label: string }[] = [
    { key: "time", label: strings.dashboardTabTime },
    { key: "activity", label: strings.dashboardTabActivity },
    { key: "flagged", label: strings.dashboardTabFlagged },
    { key: "blocklist", label: strings.dashboardTabBlocklist },
  ];
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const { isParentUnlocked, settings, setParentUnlocked } = useParentalControlsStore();
  const { user } = useAuthStore();
  const { authStep, authenticate, verifyPin, isLocked, lockSecondsRemaining } = useParentAuth();
  const sunRef = useRef<LottieView>(null);

  const [activeTab, setActiveTab] = useState<Tab>("time");
  const [activityLog, setActivityLog] = useState<ActivityLogEntry[]>([]);
  const [loadingLog, setLoadingLog] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [pinError, setPinError] = useState(false);

  useEffect(() => {
    if (!isParentUnlocked) authenticate();
    return () => setParentUnlocked(false);
  }, []);

  useEffect(() => { if (authStep === "pin") setShowPin(true); }, [authStep]);

  useEffect(() => {
    if (!isParentUnlocked || !user) return;
    setLoadingLog(true);
    loadActivityLog(user.uid)
      .then((entries) => { setActivityLog(entries); setLoadingLog(false); })
      .catch(() => setLoadingLog(false));
  }, [isParentUnlocked, user]);

  useEffect(() => {
    if (isFocused) { sunRef.current?.play(); } else { sunRef.current?.pause(); }
  }, [isFocused]);

  const handlePinSubmit = (pin: string) => {
    const ok = verifyPin(pin);
    if (ok) { setShowPin(false); }
    else { setPinError(true); setTimeout(() => setPinError(false), 1500); }
  };

  return (
    <ImageBackground
      source={require("../assets/backgrounds/parent-dash-bg.png")}
      style={styles.bgImage}
      resizeMode="cover"
    >
      {!isParentUnlocked ? (
        <ParentAuthGate onAuthenticate={authenticate} />
      ) : (
        <SafeAreaView style={styles.safeArea}>
          <LottieView
            ref={sunRef}
            source={require("../assets/lottie/sun.json")}
            autoPlay={isFocused}
            loop
            style={styles.sun}
          />

          <View style={styles.header}>
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} accessibilityLabel="Go back" accessibilityRole="button">
              <Ionicons name="chevron-back" size={24} color={colors.primary} />
            </TouchableOpacity>
            <View style={styles.headerText}>
              <Text style={styles.title}>{strings.dashboardTitle}</Text>
              <Text style={styles.subtitle}>{strings.dashboardSubtitle}</Text>
            </View>
          </View>

          <View style={styles.tabBar}>
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab.key}
                style={[styles.tab, activeTab === tab.key && styles.tabActive]}
                onPress={() => setActiveTab(tab.key)}
                accessibilityLabel={`${tab.label} tab`}
                accessibilityRole="tab"
              >
                <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {loadingLog && activeTab !== "time" && activeTab !== "blocklist" ? (
            <View style={styles.loading}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
              {activeTab === "time" && <><ScreenTimeSummary /><PINSecuritySection /></>}
              {activeTab === "activity" && <ActivityLogList entries={activityLog} />}
              {activeTab === "flagged" && <FlaggedWordsList entries={activityLog} />}
              {activeTab === "blocklist" && <BlocklistEditor />}
            </ScrollView>
          )}
        </SafeAreaView>
      )}
      <PINEntryModal
        visible={showPin && !isLocked}
        mode={settings.pinHash ? "verify" : "set"}
        onSubmit={handlePinSubmit}
        onCancel={() => setShowPin(false)}
        hasError={pinError}
      />
      <PinLockoutModal visible={isLocked} lockSecondsRemaining={lockSecondsRemaining} />
    </ImageBackground>
  );
};
