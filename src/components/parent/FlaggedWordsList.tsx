/**
 * FlaggedWordsList.tsx
 *
 * Focused view showing only activity log entries where flagged === true.
 * Lets parents quickly review inappropriate content without scrolling past
 * all clean scans in the full activity log.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ActivityLogEntry } from '../../types/parentalControls';
import { ActivityLogList } from './ActivityLogList';
import { strings } from '../../constants/strings';
import { colors } from '../../constants/colors';

interface FlaggedWordsListProps {
  entries: ActivityLogEntry[];
}

export const FlaggedWordsList: React.FC<FlaggedWordsListProps> = ({ entries }) => {
  const flagged = entries.filter(e => e.flagged);

  if (flagged.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyIcon}>🎉</Text>
        <Text style={styles.emptyText}>{strings.flaggedWordsEmpty}</Text>
      </View>
    );
  }

  return <ActivityLogList entries={flagged} />;
};

const styles = StyleSheet.create({
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyText: { fontSize: 16, color: colors.textSecondary, textAlign: 'center', lineHeight: 24 },
});
