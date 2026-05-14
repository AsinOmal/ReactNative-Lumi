import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useParentalControlsStore } from "../store/useParentalControlsStore";
import { useAuthStore } from "../store/useAuthStore";
import { useParentAuth } from "../hooks/useParentAuth";
import { loadActivityLog } from "../services/parentalControlsService";
import { ActivityLogEntry } from "../types/parentalControls";
import { PINEntryModal } from "../components/PINEntryModal";
import { ScreenTimeSummary } from "../components/parent/ScreenTimeSummary";
import { ActivityLogList } from "../components/parent/ActivityLogList";
import { FlaggedWordsList } from "../components/parent/FlaggedWordsList";
import { BlocklistEditor } from "../components/parent/BlocklistEditor";
import { ParentAuthGate } from "../components/parent/ParentAuthGate";
import { SkyScene } from "../components/scenes/SkyScene";
import { strings } from "../constants/strings";
import { colors } from "../constants/colors";
import { styles } from "./ParentDashboardStyles";

type Tab = "time" | "activity" | "flagged" | "blocklist";
const TABS: { key: Tab; label: string }[] = [
  { key: "time", label: strings.dashboardTabTime },
  { key: "activity", label: strings.dashboardTabActivity },
  { key: "flagged", label: strings.dashboardTabFlagged },
  { key: "blocklist", label: strings.dashboardTabBlocklist },
];

export const ParentDashboardScreen: React.FC = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const { isParentUnlocked, settings, setParentUnlocked } = useParentalControlsStore();
  const { user } = useAuthStore();
  const { authStep, authenticate, verifyPin } = useParentAuth();

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

  const handlePinSubmit = (pin: string) => {
    const ok = verifyPin(pin);
    if (ok) {
      setShowPin(false);
    } else {
      setPinError(true);
      setTimeout(() => setPinError(false), 1500);
    }
  };

  return (
    <SkyScene paused={!isFocused}>
      {!isParentUnlocked ? (
        <ParentAuthGate onAuthenticate={authenticate} />
      ) : (
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} accessibilityLabel="Go back" accessibilityRole="button">
              <Ionicons name="chevron-back" size={24} color={colors.primary} />
            </TouchableOpacity>
            <Text style={styles.title}>{strings.dashboardTitle}</Text>
          </View>

          <View style={styles.tabBar}>
            {TABS.map((tab) => (
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
            <ScrollView showsVerticalScrollIndicator={false}>
              {activeTab === "time" && <ScreenTimeSummary />}
              {activeTab === "activity" && <ActivityLogList entries={activityLog} />}
              {activeTab === "flagged" && <FlaggedWordsList entries={activityLog} />}
              {activeTab === "blocklist" && <BlocklistEditor />}
            </ScrollView>
          )}
        </SafeAreaView>
      )}
      <PINEntryModal
        visible={showPin}
        mode={settings.pinHash ? "verify" : "set"}
        onSubmit={handlePinSubmit}
        onCancel={() => setShowPin(false)}
        hasError={pinError}
      />
    </SkyScene>
  );
};
