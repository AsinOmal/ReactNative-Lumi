/**
 * Child-friendly gate shown when a scanned word belongs to a pack that hasn't
 * been downloaded yet. Routes here from ScanScreen — never the entry point.
 *
 * On `'downloaded'` we auto-go-back so the child lands in the same scan view
 * and can re-trigger AR via another scan; opening AR directly from here would
 * fight the in-flight Vision Camera teardown.
 */

import React, { useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import LinearGradient from "react-native-linear-gradient";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import type { Pack } from "../types/pack";
import { usePackDownload } from "../hooks/usePackDownload";
import { getPackGradient, getPackIcon } from "../constants/packAccents";
import { useStrings } from "../hooks/useStrings";
import { colors } from "../constants/colors";
import { styles } from "./PackGateScreenStyles";

export const PackGateScreen = () => {
  const strings = useStrings();
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const { word, pack } = route.params as { word: string; pack: Pack };
  const {
    status,
    progress,
    downloadedFiles,
    totalFiles,
    errorMessage,
    download,
  } = usePackDownload(pack);

  const gradient = getPackGradient(pack.id);
  const icon = getPackIcon(pack.id);
  const isPremium = pack.packType === "premium";

  useEffect(() => {
    if (status === "downloaded") {
      navigation.goBack();
    }
  }, [status, navigation]);

  return (
    <View style={[styles.container, { paddingTop: insets.top + 16 }]}>
      <StatusBar barStyle="dark-content" />
      <TouchableOpacity
        style={styles.dismiss}
        onPress={() => navigation.goBack()}
        accessibilityLabel={strings.packGateDismiss}
        accessibilityRole="button"
      >
        <Ionicons name="close" size={28} color={colors.textMid} />
      </TouchableOpacity>

      <View style={styles.center}>
        <LinearGradient colors={gradient} style={styles.bubble}>
          <MaterialCommunityIcons name={icon} size={72} color="#FFF" />
        </LinearGradient>

        <Text style={styles.heading}>{strings.packFoundFmt(word)}</Text>
        <Text style={styles.subtext}>
          {isPremium ? strings.packLockedComingSoon : strings.packGateSubtext}
        </Text>

        {status === "downloading" && (
          <View style={styles.progressBlock}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.progressText}>
              {strings.downloadProgressFmt(downloadedFiles, totalFiles)}
            </Text>
            <View style={styles.barTrack}>
              <View
                style={[
                  styles.barFill,
                  { width: `${Math.round(progress * 100)}%` },
                ]}
              />
            </View>
          </View>
        )}

        {status === "error" && (
          <Text style={styles.errorText}>{errorMessage ?? strings.error}</Text>
        )}

        {!isPremium && status !== "downloading" && (
          <TouchableOpacity
            style={styles.cta}
            onPress={download}
            accessibilityRole="button"
          >
            <Ionicons name="cloud-download" size={20} color="#FFF" />
            <Text style={styles.ctaText}>
              {status === "error" ? strings.downloadPack : strings.packGateCta}
            </Text>
          </TouchableOpacity>
        )}

        {isPremium && (
          <View style={[styles.cta, styles.ctaDisabled]}>
            <Ionicons name="lock-closed" size={20} color="#FFF" />
            <Text style={styles.ctaText}>{strings.packLocked}</Text>
          </View>
        )}

        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.dismissLink}
          accessibilityRole="button"
        >
          <Text style={styles.dismissText}>{strings.packGateDismiss}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
