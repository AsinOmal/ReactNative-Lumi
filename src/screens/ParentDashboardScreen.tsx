/**
 * ParentDashboardScreen.tsx
 *
 * The parent control centre. Self-authenticating — any navigation path that
 * reaches this screen is gated here, so entry points (ProfileScreen, HomeScreen
 * gear) just call navigate('ParentDashboard') without duplicating auth logic.
 *
 * Auth gate flow on mount:
 *   isParentUnlocked? → show dashboard immediately (already authenticated this session)
 *   Not unlocked? → trigger biometrics → success OR fall back to PIN modal
 *   Once unlocked: load activity log from Firestore, show tabs
 *
 * Tab layout: Time | Activity | Flagged | Blocklist
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, SafeAreaView,
  ScrollView, ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useParentalControlsStore } from '../store/useParentalControlsStore';
import { useAuthStore } from '../store/useAuthStore';
import { useParentAuth } from '../hooks/useParentAuth';
import { loadActivityLog } from '../services/parentalControlsService';
import { ActivityLogEntry } from '../types/parentalControls';
import { PINEntryModal } from '../components/PINEntryModal';
import { ScreenTimeSummary } from '../components/parent/ScreenTimeSummary';
import { ActivityLogList } from '../components/parent/ActivityLogList';
import { FlaggedWordsList } from '../components/parent/FlaggedWordsList';
import { BlocklistEditor } from '../components/parent/BlocklistEditor';
import { strings } from '../constants/strings';
import { styles } from './ParentDashboardStyles';

type Tab = 'time' | 'activity' | 'flagged' | 'blocklist';
const TABS: { key: Tab; label: string }[] = [
  { key: 'time',      label: strings.dashboardTabTime },
  { key: 'activity',  label: strings.dashboardTabActivity },
  { key: 'flagged',   label: strings.dashboardTabFlagged },
  { key: 'blocklist', label: strings.dashboardTabBlocklist },
];

export const ParentDashboardScreen: React.FC = () => {
  const navigation = useNavigation();
  const { isParentUnlocked, settings, setParentUnlocked } = useParentalControlsStore();
  const { user } = useAuthStore();
  const { authStep, authenticate, verifyPin } = useParentAuth();

  const [activeTab, setActiveTab] = useState<Tab>('time');
  const [activityLog, setActivityLog] = useState<ActivityLogEntry[]>([]);
  const [loadingLog, setLoadingLog] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [pinError, setPinError] = useState(false);

  // Re-lock when the screen unmounts — parent must re-authenticate each visit
  useEffect(() => {
    return () => setParentUnlocked(false);
  }, []);

  // Trigger auth on mount if not already unlocked
  useEffect(() => {
    if (!isParentUnlocked) authenticate();
  }, []);

  useEffect(() => {
    if (authStep === 'pin') setShowPin(true);
  }, [authStep]);

  // Load activity log once authenticated
  useEffect(() => {
    if (!isParentUnlocked || !user) return;
    setLoadingLog(true);
    loadActivityLog(user.uid).then(entries => {
      setActivityLog(entries);
      setLoadingLog(false);
    }).catch(() => setLoadingLog(false));
  }, [isParentUnlocked, user]);

  const handlePinSubmit = useCallback((pin: string) => {
    const ok = verifyPin(pin);
    if (ok) { setShowPin(false); }
    else {
      setPinError(true);
      setTimeout(() => setPinError(false), 1500);
    }
  }, [verifyPin]);

  if (!isParentUnlocked) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.authGate}>
          <Text style={styles.authIcon}>🔒</Text>
          <Text style={styles.authTitle}>{strings.dashboardAuthTitle}</Text>
          <Text style={styles.authSubtitle}>{strings.dashboardAuthSubtitle}</Text>
          <TouchableOpacity style={styles.authBtn} onPress={authenticate}>
            <Text style={styles.authBtnText}>{strings.dashboardAuthBtn}</Text>
          </TouchableOpacity>
        </SafeAreaView>
        <PINEntryModal
          visible={showPin}
          mode={settings.pinHash ? 'verify' : 'set'}
          onSubmit={handlePinSubmit}
          onCancel={() => setShowPin(false)}
          hasError={pinError}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backBtnText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{strings.dashboardTitle}</Text>
        </View>

        <View style={styles.tabBar}>
          {TABS.map(tab => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, activeTab === tab.key && styles.tabActive]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {loadingLog && activeTab !== 'time' && activeTab !== 'blocklist' ? (
          <View style={styles.loading}><ActivityIndicator color="#5B2DC0" /></View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            {activeTab === 'time'      && <ScreenTimeSummary />}
            {activeTab === 'activity'  && <ActivityLogList entries={activityLog} />}
            {activeTab === 'flagged'   && <FlaggedWordsList entries={activityLog} />}
            {activeTab === 'blocklist' && <BlocklistEditor />}
          </ScrollView>
        )}
      </SafeAreaView>
    </View>
  );
};
