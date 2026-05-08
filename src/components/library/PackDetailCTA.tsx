/**
 * State-aware CTA region for PackDetailScreen.
 *
 * Bundled packs always show "View in AR". Free packs swap between download /
 * progress / play+delete / retry. Premium is handled by the screen's early
 * lock return — never reaches this component.
 */

import React from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Ionicons from "react-native-vector-icons/Ionicons";
import type { Pack } from "../../types/pack";
import { usePackDownload } from "../../hooks/usePackDownload";
import { strings } from "../../constants/strings";
import { colors } from "../../constants/colors";
import { styles } from "./PackDetailCTAStyles";

interface Props {
  pack: Pack;
  accent: string;
  onPlay: () => void;
}

export const PackDetailCTA: React.FC<Props> = ({ pack, accent, onPlay }) => {
  const {
    status,
    progress,
    downloadedFiles,
    totalFiles,
    errorMessage,
    download,
    cancel,
    remove,
  } = usePackDownload(pack);

  if (status === "downloaded") {
    return (
      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.primary, { backgroundColor: accent }]}
          activeOpacity={0.85}
          onPress={onPlay}
          accessibilityRole="button"
        >
          <MaterialCommunityIcons name="target" size={22} color="#FFF" />
          <Text style={styles.primaryText}>View in AR</Text>
        </TouchableOpacity>
        {pack.packType !== "bundled" && (
          <TouchableOpacity
            style={styles.secondary}
            onPress={remove}
            accessibilityRole="button"
          >
            <Ionicons name="trash-outline" size={20} color={colors.textMid} />
          </TouchableOpacity>
        )}
      </View>
    );
  }

  if (status === "downloading") {
    return (
      <View style={styles.progressBlock}>
        <View style={styles.barTrack}>
          <View
            style={[
              styles.barFill,
              {
                width: `${Math.round(progress * 100)}%`,
                backgroundColor: accent,
              },
            ]}
          />
        </View>
        <View style={styles.progressRow}>
          <ActivityIndicator size="small" color={accent} />
          <Text style={styles.progressText}>
            {strings.downloadProgressFmt(downloadedFiles, totalFiles)}
          </Text>
          <TouchableOpacity onPress={cancel} accessibilityRole="button">
            <Text style={[styles.cancelText, { color: accent }]}>
              {strings.cancel}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (status === "error") {
    return (
      <View style={styles.errorBlock}>
        <Text style={styles.errorText}>{errorMessage ?? strings.error}</Text>
        <TouchableOpacity
          style={[styles.primary, { backgroundColor: accent }]}
          onPress={download}
          accessibilityRole="button"
        >
          <Ionicons name="refresh" size={20} color="#FFF" />
          <Text style={styles.primaryText}>{strings.downloadPack}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.primary, { backgroundColor: accent }]}
      activeOpacity={0.85}
      onPress={download}
      accessibilityRole="button"
    >
      <Ionicons name="cloud-download" size={22} color="#FFF" />
      <Text style={styles.primaryText}>
        {strings.downloadPack}
        {pack.estimatedSizeMB
          ? ` (${strings.downloadSizeFmt(pack.estimatedSizeMB)})`
          : ""}
      </Text>
    </TouchableOpacity>
  );
};
