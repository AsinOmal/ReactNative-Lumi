import { StyleSheet } from "react-native";
import { colors } from "../constants/colors";
import { shadowHeader } from "../constants/skeuomorphicTokens";

export const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    overflow: "hidden",
    ...shadowHeader,
  },
  watermark: {
    position: "absolute",
    right: -28,
    bottom: -24,
  },
  title: { fontFamily: "Fredoka-Bold", fontSize: 40, color: colors.textDark },
  subtitle: {
    fontFamily: "Fredoka-Regular",
    fontSize: 16,
    color: colors.textMid,
    marginTop: 2,
  },

  body: { flex: 1 },
  scroll: { paddingHorizontal: 16, paddingTop: 20 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 14 },
  card: {
    width: "47%",
    borderRadius: 24,
    backgroundColor: colors.backgroundCard,
    overflow: "hidden",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 6,
  },
  cardLocked: { opacity: 0.55 },
  iconArea: {
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  iconAreaImage: { width: "100%", height: "100%" },
  cardFooter: { padding: 12, gap: 6 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  cardTitle: {
    fontFamily: "Fredoka-Bold",
    fontSize: 18,
    color: colors.textDark,
    flex: 1,
  },
  cardTitleLocked: { color: colors.textLight },
  cardDesc: {
    fontFamily: "Fredoka-Regular",
    fontSize: 13,
    color: colors.textMid,
    lineHeight: 18,
  },
  badge: {
    backgroundColor: "#F1F5F9",
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: {
    fontFamily: "Fredoka-SemiBold",
    fontSize: 10,
    color: colors.textMid,
  },
  playBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
});
