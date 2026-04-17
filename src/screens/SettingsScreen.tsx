/**
 * SettingsScreen.tsx
 *
 * Replaces the old Profile tab. Shows the user's identity at the top
 * and provides access to parent controls, sign-out, and future settings.
 *
 * Parent Dashboard navigation is direct — ParentDashboardScreen handles
 * its own auth gate, so this screen doesn't need to duplicate that logic.
 *
 * Phase 9 will give this screen the full bubbly UI treatment.
 */

import React from 'react';
import {
  View, Text, TouchableOpacity, SafeAreaView,
  ScrollView, StyleSheet, StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../store/useAuthStore';
import { getApp } from '@react-native-firebase/app';
import { getAuth, signOut } from '@react-native-firebase/auth';
import { styles } from './SettingsScreenStyles';

const SettingsRow: React.FC<{ icon: string; label: string; onPress: () => void; danger?: boolean }> = ({
  icon, label, onPress, danger = false,
}) => (
  <TouchableOpacity style={rowStyles.row} onPress={onPress} activeOpacity={0.7}>
    <Text style={rowStyles.icon}>{icon}</Text>
    <Text style={[rowStyles.label, danger && rowStyles.labelDanger]}>{label}</Text>
    <Text style={rowStyles.arrow}>›</Text>
  </TouchableOpacity>
);

export const SettingsScreen = () => {
  const { user } = useAuthStore();
  const navigation = useNavigation();

  const initials = user?.displayName
    ? user.displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const handleSignOut = async () => {
    try {
      await signOut(getAuth(getApp()));
    } catch (e) {
      console.error('[SettingsScreen] signOut:', e);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* User card */}
          <View style={styles.userCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <Text style={styles.displayName}>{user?.displayName ?? 'Seeker'}</Text>
            <Text style={styles.email}>{user?.email}</Text>
          </View>

          {/* Parent section */}
          <Text style={styles.sectionLabel}>Parent Controls</Text>
          <View style={styles.section}>
            <SettingsRow
              icon="🔒"
              label="Parent Dashboard"
              onPress={() => (navigation as any).navigate('ParentDashboard')}
            />
          </View>

          {/* Account section */}
          <Text style={styles.sectionLabel}>Account</Text>
          <View style={styles.section}>
            <SettingsRow icon="🚪" label="Sign Out" onPress={handleSignOut} danger />
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const rowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
    gap: 12,
  },
  icon: { fontSize: 20, width: 28, textAlign: 'center' },
  label: { flex: 1, fontFamily: 'Fredoka-SemiBold', fontSize: 16, color: '#1A1050' },
  labelDanger: { color: '#E53E3E' },
  arrow: { fontSize: 20, color: '#C4B5FD' },
});
