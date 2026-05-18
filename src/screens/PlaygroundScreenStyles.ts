import { StyleSheet } from "react-native";
import { colors } from "../constants/colors";

export const styles = StyleSheet.create({
  container: { flex: 1 },

  // Header mirrors LibraryScreen's silhouette: 2-column row with title block
  // on the left and a scene-specific hero image on the right. The image
  // backdrop is the same cloudy panorama so the two catalog screens read
  // as siblings.
  header: {
    paddingHorizontal: 28,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    overflow: "hidden",
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerImage: {
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  titleBlock: { flex: 1, paddingRight: 8 },
  title: {
    fontFamily: "Fredoka-Bold",
    fontSize: 44,
    color: colors.textDark,
    lineHeight: 58,
  },
  countRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  subtitle: {
    fontFamily: "Fredoka-SemiBold",
    fontSize: 18,
    color: colors.textMid,
  },
  headerIcon: { width: 165, height: 165 },

  body: { flex: 1 },
  scroll: { paddingHorizontal: 16, paddingTop: 20 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 14 },
  card: {
    width: "47%",
    borderRadius: 24,
    backgroundColor: colors.backgroundCard,
    borderWidth: 1.5,
    borderColor: "#C48A4A",
    overflow: "hidden",
    shadowColor: "#3D2008",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 10,
    elevation: 4,
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
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 3,
  },
});
