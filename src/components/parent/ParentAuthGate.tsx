// 📖 What this does:
// Lock screen shown when the parent dashboard requires authentication.
// Extracted from ParentDashboardScreen so that screen stays under 150 lines.
// Intentionally uses its own inline styles — no cross-file style dep.

import React from "react";
import { View, Text, TouchableOpacity, SafeAreaView, StyleSheet } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useStrings } from "../../hooks/useStrings";
import { colors } from "../../constants/colors";
import { woodBorderOuter, woodBorderInner } from "../../constants/skeuomorphicTokens";

interface Props {
  onAuthenticate: () => void;
}

export const ParentAuthGate: React.FC<Props> = ({ onAuthenticate }) => {
  const strings = useStrings();
  return (
    <SafeAreaView style={styles.gate}>
      <View style={styles.iconWrap}>
        <Ionicons name="lock-closed" size={52} color={colors.primary} />
      </View>
      <Text style={styles.title}>{strings.dashboardAuthTitle}</Text>
      <Text style={styles.subtitle}>{strings.dashboardAuthSubtitle}</Text>
      <TouchableOpacity
        onPress={onAuthenticate}
        activeOpacity={0.85}
        accessibilityLabel="Authenticate to open parent dashboard"
        accessibilityRole="button"
      >
        <View style={woodBorderOuter}>
          <View style={woodBorderInner}>
            <View style={styles.btn}>
              <Text style={styles.btnText}>{strings.dashboardAuthBtn}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  gate: { flex: 1, alignItems: "center", justifyContent: "center", padding: 40, gap: 12 },
  iconWrap: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: "rgba(255,154,46,0.12)",
    alignItems: "center", justifyContent: "center",
    marginBottom: 8,
  },
  title: {
    fontFamily: "Fredoka-Bold", fontSize: 30,
    color: colors.textDark, textAlign: "center",
  },
  subtitle: {
    fontFamily: "Fredoka-Regular", fontSize: 18,
    color: colors.textMid, textAlign: "center", lineHeight: 26, marginBottom: 16,
  },
  btn: {
    backgroundColor: colors.primary, borderRadius: 14,
    paddingVertical: 16, paddingHorizontal: 44,
  },
  btnText: { fontFamily: "Fredoka-Bold", fontSize: 20, color: "#FFF" },
});
