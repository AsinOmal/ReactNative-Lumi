import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAuthStore } from '../store/useAuthStore';
import { useUserProfile } from '../hooks/useUserProfile';
import { getApp } from '@react-native-firebase/app';
import { getAuth, signOut } from '@react-native-firebase/auth';
import { useParentAuth } from '../hooks/useParentAuth';
import { useParentalControlsStore } from '../store/useParentalControlsStore';
import { LumiMascot } from '../components/common/LumiMascot';
import { PINEntryModal } from '../components/PINEntryModal';
import { SkyScene } from '../components/scenes/SkyScene';
import { styles } from './ProfileScreenStyles';

const STATS = [
  { label: 'Words Found', value: 0 },
  { label: 'Packs Unlocked', value: 1 },
  { label: 'Days Active', value: 0 },
];

export const ProfileScreen = () => {
  const { user } = useAuthStore();
  const profile = useUserProfile(user?.uid);
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const { authStep, authenticate, verifyPin } = useParentAuth();
  const { settings } = useParentalControlsStore();
  const [showPin, setShowPin] = useState(false);
  const [pinError, setPinError] = useState(false);

  const headerName =
    profile.username || profile.displayName || user?.displayName || 'Seeker';

  const handleSignOut = async () => {
    try {
      const auth = getAuth(getApp());
      await signOut(auth);
    } catch (e) {
      console.error('Sign out error:', e);
    }
  };

  const handleParentDashboard = async () => {
    await authenticate();
  };

  React.useEffect(() => {
    if (authStep === 'success') {
      (navigation as any).navigate('ParentDashboard');
    } else if (authStep === 'pin') {
      setShowPin(true);
    }
  }, [authStep, navigation]);

  const handlePinSubmit = (pin: string) => {
    const ok = verifyPin(pin);
    if (ok) {
      setShowPin(false);
      (navigation as any).navigate('ParentDashboard');
    } else {
      setPinError(true);
      setTimeout(() => setPinError(false), 1500);
    }
  };

  return (
    <SkyScene paused={!isFocused}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 16 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.headerTitle}>My Profile</Text>

        <View style={styles.avatarCard}>
          <LumiMascot state="idle" size={90} />
          <Text style={styles.displayName}>{headerName}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          <View style={styles.streakBadge}>
            <Ionicons name="flame" size={16} color="#E65100" />
            <Text style={styles.streakText}>0 day streak</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          {STATS.map((s) => (
            <View key={s.label} style={styles.statCard}>
              <Text style={styles.statNumber}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={styles.parentDashBtn}
          onPress={handleParentDashboard}
          activeOpacity={0.8}
          accessibilityLabel="Open parent dashboard"
          accessibilityRole="button"
        >
          <Ionicons
            name="lock-closed"
            size={18}
            color={styles.parentDashText.color as string}
          />
          <Text style={styles.parentDashText}>Parent Dashboard</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.signOutBtn}
          onPress={handleSignOut}
          activeOpacity={0.8}
          accessibilityLabel="Sign out"
          accessibilityRole="button"
        >
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>

      <PINEntryModal
        visible={showPin}
        mode={settings.pinHash ? 'verify' : 'set'}
        onSubmit={handlePinSubmit}
        onCancel={() => setShowPin(false)}
        hasError={pinError}
      />
    </SkyScene>
  );
};
