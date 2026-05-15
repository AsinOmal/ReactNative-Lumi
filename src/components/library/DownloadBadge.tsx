/**
 * Small status pill rendered on `ColorPackCard`. `bundled` packs skip this
 * entirely; the parent decides whether to render. Reads the download store
 * directly so adding the badge to other surfaces doesn't need prop wiring.
 */

import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface Props {
  status?: 'idle' | 'downloading' | 'downloaded' | 'error';
}

export const DownloadBadge: React.FC<Props> = ({ status }) => {
  if (status === 'downloading') {
    return (
      <View style={styles.badge}>
        <ActivityIndicator size="small" color="#FFF" />
      </View>
    );
  }
  const name =
    status === 'downloaded'
      ? 'checkmark-circle'
      : status === 'error'
      ? 'warning-outline'
      : 'cloud-download-outline';
  return (
    <View style={styles.badge}>
      <Ionicons name={name} size={16} color="#FFF" />
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 14,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
