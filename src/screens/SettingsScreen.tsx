import React, { useState } from 'react';
import { View, Text, ScrollView, StatusBar, Switch, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  useNavigation,
  useFocusEffect,
  useIsFocused,
} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { useAuthStore } from '../store/useAuthStore';
import { useUserProfile } from '../hooks/useUserProfile';
import { getApp } from '@react-native-firebase/app';
import { getAuth, signOut } from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { getProgress, getStreak } from '../utils/achievementStore';
import { colors } from '../constants/colors';
import { useLanguageStore } from '../store/useLanguageStore';
import { useStrings } from '../hooks/useStrings';
import { SkyScene } from '../components/scenes/SkyScene';
import { LumiMascot } from '../components/common/LumiMascot';
import { StatsCard } from '../components/settings/StatsCard';
import { SettingsRow } from '../components/settings/SettingsRow';
import { FeedbackModal } from '../components/settings/FeedbackModal';
import { EditUsernameModal } from '../components/settings/EditUsernameModal';
import { EditChildNameModal } from '../components/settings/EditChildNameModal';
import { styles } from './SettingsScreenStyles';

export const SettingsScreen = () => {
  const { user, childName } = useAuthStore();
  const profile = useUserProfile(user?.uid);
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const strings = useStrings();
  const { language, setLanguage } = useLanguageStore();
  const [wordCount, setWordCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [achievementCount, setAchievementCount] = useState(0);
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [usernameVisible, setUsernameVisible] = useState(false);
  const [childNameVisible, setChildNameVisible] = useState(false);

  // childName wins because profile.username is auto-seeded from the Google
  // display name on first sign-in — without childName first, the kid-facing
  // header would always show the parent's Google account name.
  const headerName =
    childName ||
    profile.username ||
    profile.displayName ||
    user?.displayName ||
    'Explorer';

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
      console.error('[SettingsScreen] signOut:', e);
    }
  };

  // Dev-only "full reset": wipes every AsyncStorage key (intro flag, language,
  // purchases, ambient mute, banner dismissals, screen-time, PIN lockout, etc.)
  // AND revokes the Google session so the next launch goes through onboarding
  // + auth from scratch. Useful for replaying intro flows during testing.
  const handleDevFullLogout = () => {
    Alert.alert(
      'Dev: Full Logout',
      'This wipes ALL local data (intro flag, language, purchases, mute, banners, streaks) and signs you out. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Wipe & sign out',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              await GoogleSignin.signOut().catch(() => {});
              await signOut(getAuth(getApp()));
            } catch (e) {
              console.error('[SettingsScreen] devFullLogout:', e);
            }
          },
        },
      ]
    );
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
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionLabel}>
          {strings.SETTINGS_SECTION_PROFILE}
        </Text>
        <View style={styles.section}>
          <SettingsRow
            iconName="person-outline"
            label={strings.SETTINGS_EDIT_USERNAME}
            onPress={() => setUsernameVisible(true)}
          />
          <SettingsRow
            iconName="happy-outline"
            label={strings.SETTINGS_EDIT_CHILD_NAME}
            onPress={() => setChildNameVisible(true)}
          />
        </View>

        <Text style={styles.sectionLabel}>
          {strings.SETTINGS_LANGUAGE_SECTION}
        </Text>
        <View style={styles.section}>
          <SettingsRow
            iconName="language-outline"
            label={strings.SETTINGS_LANGUAGE_ROW}
            onPress={() => setLanguage(language === 'si' ? 'en' : 'si')}
            rightElement={
              <Switch
                value={language === 'si'}
                onValueChange={(v) => setLanguage(v ? 'si' : 'en')}
                trackColor={{ false: colors.textLight, true: colors.primary }}
                thumbColor="#fff"
                accessibilityLabel="Toggle Sinhala language"
              />
            }
          />
        </View>

        <Text style={styles.sectionLabel}>
          {strings.SETTINGS_SECTION_PARENT}
        </Text>
        <View style={styles.section}>
          <SettingsRow
            iconName="lock-closed"
            label={strings.SETTINGS_PARENT_DASHBOARD}
            onPress={() => (navigation as any).navigate('ParentDashboard')}
          />
        </View>

        <Text style={styles.sectionLabel}>
          {strings.SETTINGS_SECTION_SUPPORT}
        </Text>
        <View style={styles.section}>
          <SettingsRow
            iconName="chatbubble-outline"
            label={strings.SETTINGS_SEND_FEEDBACK}
            onPress={() => setFeedbackVisible(true)}
          />
        </View>

        <Text style={styles.sectionLabel}>
          {strings.SETTINGS_SECTION_ACCOUNT}
        </Text>
        <View style={styles.section}>
          <SettingsRow
            iconName="log-out-outline"
            label={strings.SETTINGS_SIGN_OUT}
            onPress={handleSignOut}
            danger
          />
        </View>

        {__DEV__ && (
          <>
            <Text style={styles.sectionLabel}>Developer</Text>
            <View style={styles.section}>
              <SettingsRow
                iconName="trash-bin-outline"
                label="Full logout (wipe local state)"
                onPress={handleDevFullLogout}
                danger
              />
            </View>
          </>
        )}
      </ScrollView>

      <FeedbackModal
        visible={feedbackVisible}
        uid={user?.uid ?? ''}
        email={user?.email ?? ''}
        onClose={() => setFeedbackVisible(false)}
      />
      <EditUsernameModal
        visible={usernameVisible}
        uid={user?.uid ?? ''}
        currentUsername={profile.username || profile.displayName || ''}
        onClose={() => setUsernameVisible(false)}
      />
      <EditChildNameModal
        visible={childNameVisible}
        uid={user?.uid ?? ''}
        currentChildName={childName}
        onClose={() => setChildNameVisible(false)}
      />
    </SkyScene>
  );
};
