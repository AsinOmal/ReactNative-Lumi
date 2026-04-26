import { StyleSheet } from 'react-native';
import { colors } from '../constants/colors';

export const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.backgroundMain },

  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 12 },
  backBtn: { padding: 8 },
  headerTitle: { flex: 1, textAlign: 'center', fontFamily: 'Fredoka-Bold', fontSize: 22, color: colors.textDark },
  badge: {
    backgroundColor: colors.primary, borderRadius: 12, minWidth: 28, height: 28,
    paddingHorizontal: 8, alignItems: 'center', justifyContent: 'center', marginRight: 8,
  },
  badgeText: { fontFamily: 'Fredoka-Bold', fontSize: 14, color: '#FFF' },

  tabs: {
    flexDirection: 'row', marginHorizontal: 16, marginBottom: 12,
    backgroundColor: '#EDE9FE', borderRadius: 16, padding: 4,
  },
  tab:           { flex: 1, paddingVertical: 8, borderRadius: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6 },
  tabActive:     { backgroundColor: colors.primary },
  tabText:       { fontFamily: 'Fredoka-SemiBold', fontSize: 15, color: colors.textMid },
  tabTextActive: { color: '#FFF' },

  scroll: { paddingHorizontal: 16, paddingTop: 4, gap: 12 },

  card: {
    backgroundColor: colors.backgroundCard, borderRadius: 24, padding: 14,
    flexDirection: 'row', alignItems: 'center', gap: 14,
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 12, elevation: 3,
  },
  wishCard: {
    borderStyle: 'dashed', borderWidth: 1.5, borderColor: colors.primaryLight,
    backgroundColor: '#FDFBFF', shadowOpacity: 0, elevation: 0,
  },
  emojiCircle: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#EDE9FE', alignItems: 'center', justifyContent: 'center' },
  wishEmojiCircle: { backgroundColor: '#FEF3C7' },
  emoji:    { fontSize: 32 },
  cardBody: { flex: 1, gap: 4 },
  wordText: { fontFamily: 'Fredoka-Bold', fontSize: 20, color: colors.textDark },
  dateText: { fontFamily: 'Fredoka-Regular', fontSize: 13, color: '#94A3B8' },

  arBtn: {
    backgroundColor: colors.primary, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 8,
    flexDirection: 'row', alignItems: 'center', gap: 6,
  },
  arBtnText: { fontFamily: 'Fredoka-SemiBold', fontSize: 13, color: '#FFF' },

  trashBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#FEE2E2', alignItems: 'center', justifyContent: 'center' },

  emptyState:    { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, paddingBottom: 60 },
  emptyEmoji:    { fontSize: 56, marginBottom: 8 },
  emptyTitle:    { fontFamily: 'Fredoka-Bold', fontSize: 22, color: colors.textDark },
  emptySubtitle: { fontFamily: 'Fredoka-Regular', fontSize: 16, color: '#94A3B8', textAlign: 'center', paddingHorizontal: 40 },
});
