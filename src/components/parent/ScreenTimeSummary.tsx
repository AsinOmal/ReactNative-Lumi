// 📖 What this does:
// Renders the "Time" tab of Parent Dashboard — today's usage, daily limit stepper,
// and timed-mode toggle. Local state for the limit stepper avoids a Firestore write
// on every +/- press; the write only fires when the parent taps "Set Limit".
// todayMinutes comes from Zustand (written every 60s by useScreenTime in AppInner).

import React, { useState } from "react";
import { View, Text, TouchableOpacity, Switch, Image } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useParentalControlsStore } from "../../store/useParentalControlsStore";
import { useAuthStore } from "../../store/useAuthStore";
import { useStrings } from "../../hooks/useStrings";
import { colors } from "../../constants/colors";
import { styles } from "./ScreenTimeSummaryStyles";

const LIMIT_STEPS = [0, 1, 15, 30, 45, 60, 90, 120, 180];

export const ScreenTimeSummary: React.FC = () => {
  const strings = useStrings();
  const { settings, updateSettings, todayMinutes } = useParentalControlsStore();
  const { user } = useAuthStore();

  const currentIdx = LIMIT_STEPS.indexOf(settings.dailyLimitMinutes);
  const safeIdx = currentIdx >= 0 ? currentIdx : 0;
  const [localIdx, setLocalIdx] = useState(safeIdx);

  const hasUnsavedChanges = localIdx !== safeIdx;
  const localLimit = LIMIT_STEPS[localIdx];

  const handleSetLimit = () => {
    if (user) updateSettings(user.uid, { dailyLimitMinutes: localLimit });
  };

  const handleToggleTimedMode = (val: boolean) => {
    if (user) updateSettings(user.uid, { timedModeEnabled: val });
  };

  const usageMins = Math.round(todayMinutes);

  return (
    <View style={styles.container}>

      <Text style={styles.sectionLabel}>TODAY'S USAGE</Text>
      <View style={[styles.card, styles.usageCard]}>
        <View style={styles.usageLeft}>
          <View style={styles.usageIconWrap}>
            <Ionicons name="time-outline" size={22} color={colors.primary} />
          </View>
          <View>
            <Text style={styles.usageValue}>
              {usageMins} <Text style={styles.usageUnit}>min</Text>
            </Text>
            <Text style={styles.usageSub}>used today</Text>
          </View>
        </View>
        <Image
          source={require("../../assets/backgrounds/parent-dash-clock.png")}
          style={styles.clockImg}
          resizeMode="contain"
        />
      </View>

      <Text style={styles.sectionLabel}>DAILY LIMIT</Text>
      <View style={[styles.card, styles.limitRow]}>
        <TouchableOpacity
          style={[styles.stepBtn, localIdx === 0 && styles.stepBtnDisabled]}
          onPress={() => setLocalIdx(i => Math.max(0, i - 1))}
          disabled={localIdx === 0}
          accessibilityLabel="Decrease daily limit"
          accessibilityRole="button"
        >
          <Text style={styles.stepBtnText}>−</Text>
        </TouchableOpacity>
        <Text style={styles.limitValue}>
          {localLimit === 0 ? strings.screenTimeNoLimit : strings.screenTimeLimitFmt(localLimit)}
        </Text>
        <TouchableOpacity
          style={[styles.stepBtn, localIdx === LIMIT_STEPS.length - 1 && styles.stepBtnDisabled]}
          onPress={() => setLocalIdx(i => Math.min(LIMIT_STEPS.length - 1, i + 1))}
          disabled={localIdx === LIMIT_STEPS.length - 1}
          accessibilityLabel="Increase daily limit"
          accessibilityRole="button"
        >
          <Text style={styles.stepBtnText}>+</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.setBtn, !hasUnsavedChanges && styles.setBtnSaved]}
        onPress={handleSetLimit}
        disabled={!hasUnsavedChanges}
        accessibilityLabel={hasUnsavedChanges ? "Set new daily limit" : "Daily limit already saved"}
        accessibilityRole="button"
      >
        <Ionicons name="checkmark" size={16} color={colors.white} style={styles.setBtnIcon} />
        <Text style={styles.setBtnText}>{hasUnsavedChanges ? "Set Limit" : "Limit Saved"}</Text>
      </TouchableOpacity>

      <View style={[styles.card, styles.timedRow]}>
        <Image
          source={require("../../assets/backgrounds/parent-dash-clock.png")}
          style={styles.timedIcon}
          resizeMode="contain"
        />
        <View style={styles.timedText}>
          <Text style={styles.timedLabel}>{strings.screenTimeTimedModeLabel}</Text>
          <Text style={styles.timedSub}>{strings.screenTimeTimedModeSub}</Text>
        </View>
        <Switch
          value={settings.timedModeEnabled}
          onValueChange={handleToggleTimedMode}
          trackColor={{ true: colors.primary, false: "#D0D0D0" }}
          thumbColor={colors.white}
        />
      </View>
    </View>
  );
};
