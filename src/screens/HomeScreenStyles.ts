import { StyleSheet } from 'react-native';
import { colors } from '../constants/colors';

export const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: colors.backgroundMain },
  safeArea:   { flex: 1 },
  scroll:     { paddingHorizontal: 16, paddingTop: 8 },

  // Header
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, paddingHorizontal: 4 },
  logoChip: { backgroundColor: colors.primary, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 5 },
  logoText: { fontFamily: 'SpicyRice-Regular', fontSize: 16, color: '#FFF' },
  headerCenter: { flex: 1, alignItems: 'center' },
  greeting: { fontFamily: 'Fredoka-Bold', fontSize: 22, color: colors.textDark },
  greetingName: { color: colors.primary },
  streakChip: {
    marginTop: 4, backgroundColor: '#FFF3E0', borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 3, borderWidth: 1, borderColor: '#FFB74D',
  },
  streakText: { fontFamily: 'Fredoka-SemiBold', fontSize: 13, color: '#E65100' },
  actionsRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconBtn:    { padding: 4 },

  // Scan banner
  scanBanner: {
    backgroundColor: colors.primaryDark,
    borderRadius: 32, paddingVertical: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    marginBottom: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
  },
  scanBannerText: { fontFamily: 'Fredoka-Bold', fontSize: 20, color: '#FFF', letterSpacing: 0.3 },

  // Sections
  sectionTitle: { fontFamily: 'Fredoka-Bold', fontSize: 22, color: colors.primary, marginBottom: 8, paddingHorizontal: 4 },
  sectionRow:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, paddingHorizontal: 4 },
  seeAll:       { fontFamily: 'Fredoka-SemiBold', fontSize: 15, color: colors.primary },
  grid:         { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -6, marginBottom: 16 },
  packGrid:     { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16, justifyContent: 'flex-start' },

  // Empty state
  emptyState: { alignItems: 'center', paddingVertical: 24, marginBottom: 16 },
  emptyIcon:  { marginBottom: 8 },
  emptyText:  { fontFamily: 'Fredoka-Regular', fontSize: 16, color: '#94A3B8' },
});
