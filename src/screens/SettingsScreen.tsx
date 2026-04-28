import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StatusBar, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAuthStore } from '../store/useAuthStore';
import { getApp } from '@react-native-firebase/app';
import { getAuth, signOut } from '@react-native-firebase/auth';
import { getProgress, getStreak } from '../utils/achievementStore';
import { colors } from '../constants/colors';

interface RowProps {
  iconName: string;
  label: string;
  onPress: () => void;
  danger?: boolean;
}

const SettingsRow: React.FC<RowProps> = ({ iconName, label, onPress, danger = false }) => (
  <TouchableOpacity style={rowStyles.row} onPress={onPress} activeOpacity={0.7} accessibilityLabel={label} accessibilityRole="button">
    <View style={rowStyles.iconWrap}>
      <Ionicons name={iconName} size={22} color={danger ? colors.error : colors.primary} />
    </View>
    <Text style={[rowStyles.label, danger && rowStyles.labelDanger]}>{label}</Text>
    <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
  </TouchableOpacity>
);

export const SettingsScreen = () => {
  const { user } = useAuthStore();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [wordCount, setWordCount]         = useState(0);
  const [streak, setStreak]               = useState(0);
  const [achievementCount, setAchievementCount] = useState(0);

  const initials = user?.displayName
    ? user.displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  useFocusEffect(
    React.useCallback(() => {
      Promise.all([getProgress(), getStreak()]).then(([p, s]) => {
        setWordCount(p.scannedWords.length);
        setStreak(s);
        setAchievementCount(p.earned.length);
      }).catch(() => {});
    }, [])
  );

  const handleSignOut = async () => {
    try {
      await signOut(getAuth(getApp()));
    } catch (e) {
      console.error('[SettingsScreen] signOut:', e);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Purple gradient header — avatar + name + email only */}
      <LinearGradient colors={[colors.headerGradientStart, colors.headerGradientEnd]} style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View style={styles.avatar}><Text style={styles.avatarText}>{initials}</Text></View>
        <Text style={styles.displayName}>{user?.displayName ?? 'Explorer'}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </LinearGradient>

      {/* Stats card — floats below header, half-overlapping */}
      <View style={styles.statsCard}>
        <View style={styles.statItem}>
          <View style={[styles.statIcon, { backgroundColor: '#EDE9FE' }]}>
            <Ionicons name="bookmark" size={20} color={colors.primary} />
          </View>
          <Text style={styles.statValue}>{wordCount}</Text>
          <Text style={styles.statLabel}>Words</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <View style={[styles.statIcon, { backgroundColor: '#FEF3C7' }]}>
            <Ionicons name="flame" size={20} color={colors.accentAmber} />
          </View>
          <Text style={styles.statValue}>{streak > 0 ? streak : '—'}</Text>
          <Text style={styles.statLabel}>Streak</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <View style={[styles.statIcon, { backgroundColor: '#FFF9C4' }]}>
            <Ionicons name="trophy" size={20} color={colors.accentYellow} />
          </View>
          <Text style={styles.statValue}>{achievementCount}</Text>
          <Text style={styles.statLabel}>Badges</Text>
        </View>
      </View>

      <ScrollView style={styles.body} contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 100 }]} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionLabel}>Parent Controls</Text>
        <View style={styles.section}>
          <SettingsRow iconName="lock-closed" label="Parent Dashboard" onPress={() => (navigation as any).navigate('ParentDashboard')} />
        </View>

        <Text style={styles.sectionLabel}>Account</Text>
        <View style={styles.section}>
          <SettingsRow iconName="log-out-outline" label="Sign Out" onPress={handleSignOut} danger />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.skyBottom },
  header: { alignItems: 'center', paddingHorizontal: 20, paddingBottom: 52, gap: 6 },
  avatar:      { width: 84, height: 84, borderRadius: 42, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  avatarText:  { fontFamily: 'Fredoka-Bold', fontSize: 30, color: '#FFF' },
  displayName: { fontFamily: 'Fredoka-Bold', fontSize: 24, color: '#FFF' },
  email:       { fontFamily: 'Fredoka-Regular', fontSize: 14, color: 'rgba(255,255,255,0.75)' },

  // Stats card overlaps header bottom edge
  statsCard: {
    marginHorizontal: 20, marginTop: -44,
    backgroundColor: '#FFF', borderRadius: 24,
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 18, paddingHorizontal: 12,
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12, shadowRadius: 20, elevation: 8,
  },
  statItem:   { flex: 1, alignItems: 'center', gap: 6 },
  statIcon:   { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  statValue:  { fontFamily: 'Fredoka-Bold', fontSize: 26, color: colors.textDark },
  statLabel:  { fontFamily: 'Fredoka-Regular', fontSize: 13, color: colors.textMid },
  statDivider:{ width: 1, height: 44, backgroundColor: '#F1F5F9' },

  body:   { flex: 1 },
  scroll: { paddingHorizontal: 16, paddingTop: 24, gap: 4 },
  sectionLabel: { fontFamily: 'Fredoka-SemiBold', fontSize: 14, color: colors.textMid, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6, marginTop: 8, paddingHorizontal: 4 },
  section: { backgroundColor: colors.backgroundCard, borderRadius: 16, overflow: 'hidden', shadowColor: colors.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
});

const rowStyles = StyleSheet.create({
  row:         { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16, gap: 12 },
  iconWrap:    { width: 30, alignItems: 'center' },
  label:       { flex: 1, fontFamily: 'Fredoka-SemiBold', fontSize: 17, color: colors.textDark },
  labelDanger: { color: colors.error },
});
