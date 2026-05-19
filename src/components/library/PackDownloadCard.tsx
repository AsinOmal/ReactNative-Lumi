// 📖 What this does:
// Explains the current download state of a pack before the word list.
// Shown on free/premium packs only — bundled packs return null since they are
// always available without any download step.

import React from 'react';
import { View, Text } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import type { Pack } from '../../types/pack';
import { usePackDownload } from '../../hooks/usePackDownload';
import { useStrings } from '../../hooks/useStrings';
import { colors } from '../../constants/colors';
import { styles } from './PackDownloadCardStyles';

interface Props {
  pack: Pack;
  accent: string;
}

export const PackDownloadCard: React.FC<Props> = ({ pack, accent }) => {
  const strings = useStrings();
  const { status, progress, downloadedFiles, totalFiles } = usePackDownload(pack);

  if (pack.packType === 'bundled') return null;

  if (status === 'downloaded') {
    return (
      <View style={styles.card}>
        <View style={[styles.iconCircle, { backgroundColor: '#DCFCE7' }]}>
          <Ionicons name="checkmark-circle" size={22} color={colors.successDark} />
        </View>
        <View style={styles.textBlock}>
          <Text style={styles.title}>{strings.packDetailDownloaded}</Text>
          <Text style={styles.subtitle}>{strings.packDetailReadyOffline}</Text>
        </View>
      </View>
    );
  }

  if (status === 'downloading') {
    return (
      <View style={styles.card}>
        <View style={styles.textBlock}>
          <Text style={styles.title}>
            {strings.downloadProgressFmt(downloadedFiles, totalFiles)}
          </Text>
          <View style={styles.barTrack}>
            <View
              style={[
                styles.barFill,
                { width: `${Math.round(progress * 100)}%`, backgroundColor: accent },
              ]}
            />
          </View>
        </View>
      </View>
    );
  }

  // idle or error
  const sizeLine =
    pack.wordCount && pack.estimatedSizeMB
      ? `${pack.wordCount} words · ${pack.estimatedSizeMB} MB`
      : `${pack.wordCount} words`;

  return (
    <View style={styles.card}>
      <View style={[styles.iconCircle, { backgroundColor: `${accent}22` }]}>
        <Ionicons name="cloud-download-outline" size={22} color={accent} />
      </View>
      <View style={styles.textBlock}>
        <Text style={styles.title}>{strings.packDetailNotDownloaded}</Text>
        <Text style={styles.subtitle}>{strings.packGateSubtext}</Text>
        <Text style={styles.meta}>{sizeLine}</Text>
      </View>
    </View>
  );
};
