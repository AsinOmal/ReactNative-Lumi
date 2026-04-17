/**
 * ScreenTimeSummary.tsx
 *
 * Shows today's screen time usage vs the daily limit, with controls to
 * adjust the limit and toggle timed mode for Scan & Count rounds.
 *
 * Why local state + explicit "Set" button instead of immediate save:
 *   Every tap of +/- was triggering a Firestore write, causing ~500ms of
 *   UI lag per press. Local state makes the buttons instant. Firestore is
 *   only written when the parent explicitly taps "Set Limit".
 *
 * todayMinutes is read from the Zustand store (written every 60s by
 * useScreenTime in AppInner). This avoids AsyncStorage reads here and
 * always shows a recent value without a second timer instance.
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Switch, StyleSheet } from 'react-native';
import { useParentalControlsStore } from '../../store/useParentalControlsStore';
import { useAuthStore } from '../../store/useAuthStore';
import { strings } from '../../constants/strings';
import { colors } from '../../constants/colors';

const LIMIT_STEPS = [0, 15, 30, 45, 60, 90, 120, 180];

export const ScreenTimeSummary: React.FC = () => {
  const { settings, updateSettings, todayMinutes } = useParentalControlsStore();
  const { user } = useAuthStore();

  const currentIdx = LIMIT_STEPS.indexOf(settings.dailyLimitMinutes);
  const safeIdx = currentIdx >= 0 ? currentIdx : 0;
  const [localIdx, setLocalIdx] = useState(safeIdx);

  const hasUnsavedChanges = localIdx !== safeIdx;
  const localLimit = LIMIT_STEPS[localIdx];
  const savedLimit = settings.dailyLimitMinutes;
  const pct = savedLimit > 0 ? Math.min(1, todayMinutes / savedLimit) : 0;

  const handleSetLimit = () => {
    if (user) updateSettings(user.uid, { dailyLimitMinutes: localLimit });
  };

  const handleToggleTimedMode = (val: boolean) => {
    if (user) updateSettings(user.uid, { timedModeEnabled: val });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Today's Usage</Text>
      <Text style={styles.usageText}>{strings.screenTimeUsedFmt(todayMinutes)}</Text>

      {savedLimit > 0 && (
        <View style={styles.barTrack}>
          <View style={[styles.barFill, { width: `${pct * 100}%` as any }, pct >= 1 && styles.barOver]} />
        </View>
      )}

      <Text style={styles.label}>Daily Limit</Text>
      <View style={styles.stepRow}>
        <TouchableOpacity
          style={[styles.stepBtn, localIdx === 0 && styles.stepBtnDisabled]}
          onPress={() => setLocalIdx(i => Math.max(0, i - 1))}
          disabled={localIdx === 0}
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
        >
          <Text style={styles.stepBtnText}>+</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.setBtn, !hasUnsavedChanges && styles.setBtnDim]}
        onPress={handleSetLimit}
        disabled={!hasUnsavedChanges}
      >
        <Text style={styles.setBtnText}>{hasUnsavedChanges ? 'Set Limit ✓' : 'Limit Saved'}</Text>
      </TouchableOpacity>

      <View style={styles.toggleRow}>
        <View style={styles.toggleText}>
          <Text style={styles.toggleLabel}>{strings.screenTimeTimedModeLabel}</Text>
          <Text style={styles.toggleSub}>{strings.screenTimeTimedModeSub}</Text>
        </View>
        <Switch
          value={settings.timedModeEnabled}
          onValueChange={handleToggleTimedMode}
          trackColor={{ true: colors.primary }}
          thumbColor={colors.white}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16, gap: 10 },
  label: { fontSize: 12, fontWeight: '600', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.8, marginTop: 6 },
  usageText: { fontSize: 32, fontWeight: '800', color: colors.textPrimary },
  barTrack: { height: 10, backgroundColor: '#E0D7F5', borderRadius: 5, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 5 },
  barOver: { backgroundColor: colors.error },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  stepBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.backgroundLight, alignItems: 'center', justifyContent: 'center' },
  stepBtnDisabled: { opacity: 0.35 },
  stepBtnText: { fontSize: 26, fontWeight: '700', color: colors.primary },
  limitValue: { flex: 1, textAlign: 'center', fontSize: 20, fontWeight: '700', color: colors.textPrimary },
  setBtn: { backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 12, alignItems: 'center', marginTop: 4 },
  setBtnDim: { backgroundColor: '#C4B5FD' },
  setBtnText: { color: colors.white, fontWeight: '700', fontSize: 15 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.backgroundLight, borderRadius: 14, padding: 14, marginTop: 4, gap: 12 },
  toggleText: { flex: 1 },
  toggleLabel: { fontSize: 15, fontWeight: '600', color: colors.textPrimary },
  toggleSub: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
});
