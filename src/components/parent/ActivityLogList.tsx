/**
 * ActivityLogList.tsx
 *
 * Renders a flat list of scanned-word activity log entries.
 * Flagged rows (words matching the blocklist) are red-tinted so parents
 * can immediately spot inappropriate content their child encountered.
 *
 * Accepts entries pre-fetched by the parent screen — no Firestore calls here.
 */

import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { ActivityLogEntry } from '../../types/parentalControls';
import { strings } from '../../constants/strings';
import { colors } from '../../constants/colors';

interface ActivityLogListProps {
  entries: ActivityLogEntry[];
}

const formatTime = (ms: number): string => {
  const d = new Date(ms);
  const date = d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return `${date} · ${time}`;
};

const LogRow: React.FC<{ entry: ActivityLogEntry }> = ({ entry }) => (
  <View style={[styles.row, entry.flagged && styles.rowFlagged]}>
    <View style={styles.rowLeft}>
      <Text style={styles.word}>{entry.word}</Text>
      <Text style={styles.timestamp}>{formatTime(entry.timestamp)}</Text>
    </View>
    {entry.flagged && (
      <View style={styles.badge}>
        <Text style={styles.badgeText}>🚩 Flagged</Text>
      </View>
    )}
  </View>
);

export const ActivityLogList: React.FC<ActivityLogListProps> = ({ entries }) => {
  if (entries.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>{strings.activityLogEmpty}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={entries}
      keyExtractor={(_, i) => String(i)}
      renderItem={({ item }) => <LogRow entry={item} />}
      scrollEnabled={false}
      contentContainerStyle={styles.list}
    />
  );
};

const styles = StyleSheet.create({
  list: { paddingHorizontal: 16, gap: 8 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  rowFlagged: { backgroundColor: '#FFF0F0', borderWidth: 1, borderColor: '#FFCCCC' },
  rowLeft: { flex: 1 },
  word: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, textTransform: 'capitalize' },
  timestamp: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  badge: { backgroundColor: '#FFE4E4', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  badgeText: { fontSize: 12, fontWeight: '600', color: colors.error },
  empty: { padding: 32, alignItems: 'center' },
  emptyText: { fontSize: 15, color: colors.textSecondary, textAlign: 'center' },
});
