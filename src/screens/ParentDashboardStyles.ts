import { StyleSheet } from 'react-native';
import { colors } from '../constants/colors';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0EBFF' },
  safeArea: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8, gap: 12,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center',
  },
  backBtnText: { fontSize: 18, color: colors.primary },
  title: { flex: 1, fontSize: 22, fontWeight: '800', color: colors.textPrimary },

  // Tab bar
  tabBar: {
    flexDirection: 'row', marginHorizontal: 16, marginBottom: 8,
    backgroundColor: colors.white, borderRadius: 14, padding: 4, gap: 2,
  },
  tab: { flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: 'center' },
  tabActive: { backgroundColor: colors.primary },
  tabText: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
  tabTextActive: { color: colors.white },

  // Auth gate
  authGate: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  authIcon: { fontSize: 64, marginBottom: 24 },
  authTitle: { fontSize: 26, fontWeight: '800', color: colors.textPrimary, marginBottom: 10, textAlign: 'center' },
  authSubtitle: { fontSize: 15, color: colors.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  authBtn: {
    backgroundColor: colors.primary, borderRadius: 30,
    paddingVertical: 14, paddingHorizontal: 40,
  },
  authBtnText: { color: colors.white, fontSize: 16, fontWeight: '700' },

  // Loading
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
