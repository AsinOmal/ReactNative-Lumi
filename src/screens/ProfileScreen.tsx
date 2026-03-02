import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { useAuthStore } from '../store/useAuthStore';
import { getApp } from '@react-native-firebase/app';
import { getAuth, signOut } from '@react-native-firebase/auth';

export const ProfileScreen = () => {
  const { user } = useAuthStore();

  const firstName = user?.displayName?.split(' ')[0] ?? 'Seeker';
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

          {/* Sign out */}
          <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut} activeOpacity={0.8}>
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>

        </ScrollView>
      </SafeAreaView>
      {/* Space for floating tab bar */}
      <View style={{ height: 90 }} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0EBFF' },
  safeArea: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20 },
  headerTitle: {
    fontFamily: 'Fredoka-Bold',
    fontSize: 28,
    color: '#1A1050',
    marginBottom: 20,
  },
  avatarCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#5B2DC0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#5B2DC0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: { fontFamily: 'Fredoka-Bold', fontSize: 28, color: '#FFF' },
  displayName: { fontFamily: 'Fredoka-Bold', fontSize: 22, color: '#1A1050', marginBottom: 4 },
  email: { fontFamily: 'Fredoka-Regular', fontSize: 14, color: '#888', marginBottom: 12 },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    gap: 4,
  },
  streakEmoji: { fontSize: 16 },
  streakText: { fontFamily: 'Fredoka-SemiBold', fontSize: 14, color: '#E65100' },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  statCard: {
    flex: 1,
    backgroundColor: '#E8E0FF',
    borderRadius: 20,
    paddingVertical: 16,
    alignItems: 'center',
  },
  statNumber: { fontFamily: 'Fredoka-Bold', fontSize: 28, color: '#5B2DC0' },
  statLabel: { fontFamily: 'Fredoka-Regular', fontSize: 12, color: '#7B6EA6', marginTop: 2, textAlign: 'center' },
  signOutBtn: {
    backgroundColor: '#1A1050',
    borderRadius: 40,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  signOutText: { fontFamily: 'Fredoka-Bold', fontSize: 18, color: '#FFF', letterSpacing: 0.5 },
});
