import { StyleSheet } from "react-native";
import { colors } from "../constants/colors";

export const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    overflow: "hidden",
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  watermark: { position: "absolute", right: -28, bottom: -24 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  backBtn: { padding: 8, width: 44 },
  headerCenter: { flex: 1, alignItems: "center" },
  title: { fontFamily: "Fredoka-Bold", fontSize: 40, color: "#FFF" },
  subtitle: {
    fontFamily: "Fredoka-Regular",
    fontSize: 16,
    color: "rgba(255,255,255,0.8)",
    marginTop: 2,
  },

  body: { flex: 1 },
  scroll: { paddingHorizontal: 16, paddingTop: 20 },

  progressBar: {
    backgroundColor: colors.backgroundCard,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  progressTrack: {
    flex: 1,
    height: 8,
    backgroundColor: "#F1F5F9",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: { height: 8, borderRadius: 4, backgroundColor: "#F59E0B" },
  progressLabel: {
    fontFamily: "Fredoka-SemiBold",
    fontSize: 14,
    color: colors.textMid,
  },

  grid: { flexDirection: "row", flexWrap: "wrap", gap: 14 },
  cell: { width: "47%" },

  card: {
    backgroundColor: colors.backgroundCard,
    borderRadius: 20,
    padding: 14,
    alignItems: "center",
    gap: 6,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 4,
  },
  cardLocked: { opacity: 0.55, shadowOpacity: 0, elevation: 0 },

  iconCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  iconCircleLocked: { backgroundColor: "#F1F5F9" },

  cardTitle: {
    fontFamily: "Fredoka-Bold",
    fontSize: 17,
    color: colors.textDark,
    textAlign: "center",
  },
  cardTitleLocked: { color: "#CBD5E1" },
  cardDesc: {
    fontFamily: "Fredoka-Regular",
    fontSize: 13,
    color: colors.textMid,
    textAlign: "center",
    lineHeight: 18,
  },

  doneRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  doneText: {
    fontFamily: "Fredoka-SemiBold",
    fontSize: 12,
    color: colors.successDark,
  },
});
