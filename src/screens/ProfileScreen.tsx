import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../store/useAuthStore';
import { getApp } from '@react-native-firebase/app';
import { getAuth, signOut } from '@react-native-firebase/auth';
import { useParentAuth } from '../hooks/useParentAuth';
import { useParentalControlsStore } from '../store/useParentalControlsStore';
import { PINEntryModal } from '../components/PINEntryModal';
import { styles } from './ProfileScreenStyles';

export const ProfileScreen = () => {
  const { user } = useAuthStore();
  const navigation = useNavigation();
  const { authStep, authenticate, verifyPin } = useParentAuth();
  const { settings } = useParentalControlsStore();
  const [showPin, setShowPin] = useState(false);
  const [pinError, setPinError] = useState(false);

  const initials = user?.displayName
    ? user.displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

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
    // If biometrics succeed, authStep becomes 'success' — navigate immediately.
    // If it falls back to PIN, the modal will appear via authStep === 'pin'.
  };

  // Watch for biometric success (no PIN needed path)
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
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* Header */}
          <Text style={styles.headerTitle}>My Profile</Text>

          {/* Avatar card */}
          <View style={styles.avatarCard}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <Text style={styles.displayName}>{user?.displayName ?? 'Seeker'}</Text>
            <Text style={styles.email}>{user?.email}</Text>

            {/* Streak badge */}
            <View style={styles.streakBadge}>
              <Text style={styles.streakEmoji}>🔥</Text>
              <Text style={styles.streakText}>0 day streak</Text>
            </View>
          </View>

          {/* Stats row */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Words Found</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>1</Text>
              <Text style={styles.statLabel}>Packs Unlocked</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Days Active</Text>
            </View>
          </View>

          {/* Parent Dashboard */}
          <TouchableOpacity style={styles.parentDashBtn} onPress={handleParentDashboard} activeOpacity={0.8} accessibilityLabel="Open parent dashboard" accessibilityRole="button">
            <Text style={styles.parentDashText}>🔒  Parent Dashboard</Text>
          </TouchableOpacity>

          {/* Sign out */}
          <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut} activeOpacity={0.8} accessibilityLabel="Sign out" accessibilityRole="button">
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>

        </ScrollView>
      </SafeAreaView>

      <PINEntryModal
        visible={showPin}
        mode={settings.pinHash ? 'verify' : 'set'}
        onSubmit={handlePinSubmit}
        onCancel={() => setShowPin(false)}
        hasError={pinError}
      />
      {/* Space for floating tab bar */}
      <View style={{ height: 90 }} />
    </View>
  );
};

