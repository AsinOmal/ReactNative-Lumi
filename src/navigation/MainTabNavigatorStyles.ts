import { StyleSheet } from "react-native";
import {
  scanButtonStyle,
  tabBarPillStyle,
} from "../constants/skeuomorphicTokens";

const SCAN_BTN_SIZE = 68;

export const styles = StyleSheet.create({
  // Outer wrapper — full-width column, scan button stacked above pill
  tabBarWrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    alignItems: "center",
    backgroundColor: "transparent",
  },

  // Scan button container — negative marginBottom = half the button height
  // so the bottom half of the button overlaps the pill top edge
  scanBtnOuter: {
    marginBottom: -(SCAN_BTN_SIZE / 2),
    zIndex: 10,
  },

  scanBtn: {
    width: SCAN_BTN_SIZE,
    height: SCAN_BTN_SIZE,
    borderRadius: SCAN_BTN_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
    ...scanButtonStyle,
  },

  // Sky blue pill — tabBarPillStyle provides bg, border, and shadow
  tabBarPill: {
    flexDirection: "row",
    paddingHorizontal: 4,
    paddingVertical: 6,
    alignItems: "center",
    width: "100%",
    ...tabBarPillStyle,
  },

  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  tabInner: { alignItems: "center", gap: 3, paddingVertical: 4 },
  tabLabel: {
    fontFamily: "Fredoka-SemiBold",
    fontSize: 11,
  },

  // Transparent gap in the pill under the scan button
  scanSpacer: {
    width: SCAN_BTN_SIZE + 14,
  },
});
