/**
 * BannerAnnouncement.tsx
 *
 * Renders the active in-app banner from /adminConfig/banner via useRemoteContentStore.
 * Dismissed state persists per banner (keyed by message + expiry) in AsyncStorage
 * so the same banner doesn't re-appear on the next app open.
 */

import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useRemoteContentStore } from '../../store/useRemoteContentStore';

const dismissKey = (msg: string, exp: Date) =>
  `@banner_dismissed_${msg.slice(0, 40)}_${exp.getTime()}`;

export const BannerAnnouncement: React.FC = () => {
  const banner = useRemoteContentStore(s => s.activeBanner);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    if (!banner) { setDismissed(true); return; }
    let mounted = true;
    const key = dismissKey(banner.message, banner.expiresAt);
    AsyncStorage.getItem(key)
      .then(val => { if (mounted) setDismissed(val === 'true'); })
      .catch(() => { if (mounted) setDismissed(false); });
    return () => { mounted = false; };
  }, [banner]);

  const handleDismiss = async () => {
    if (!banner) return;
    try {
      await AsyncStorage.setItem(dismissKey(banner.message, banner.expiresAt), 'true');
    } catch {}
    setDismissed(true);
  };

  if (!banner || dismissed) return null;

  return (
    <View style={[styles.container, { backgroundColor: banner.accentColor + '22' }]}>
      <View style={[styles.accent, { backgroundColor: banner.accentColor }]} />
      <Text
        style={[styles.message, { color: banner.accentColor }]}
        numberOfLines={2}
      >
        {banner.message}
      </Text>
      <TouchableOpacity
        onPress={handleDismiss}
        style={styles.dismiss}
        accessibilityLabel="Dismiss banner"
        accessibilityRole="button"
      >
        <Ionicons name="close" size={18} color={banner.accentColor} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    padding: 12,
    gap: 10,
  },
  accent:  { width: 3, alignSelf: 'stretch', borderRadius: 2 },
  message: { flex: 1, fontFamily: 'Fredoka-SemiBold', fontSize: 14 },
  dismiss: { padding: 4 },
});
