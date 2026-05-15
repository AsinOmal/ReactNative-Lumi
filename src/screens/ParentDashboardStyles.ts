import { StyleSheet } from 'react-native';
import { colors } from '../constants/colors';

export const styles = StyleSheet.create({
  bgImage: { flex: 1 },
  safeArea: { flex: 1 },

  sun: {
    position: 'absolute',
    top: 36,
    right: 0,
    width: 100,
    height: 100,
    zIndex: 0,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 12,
    zIndex: 1,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.backgroundCard,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#5C3317',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  headerText: { flex: 1 },
  title: {
    fontFamily: 'Fredoka-Bold',
    fontSize: 28,
    color: colors.textDark,
  },
  subtitle: {
    fontFamily: 'Fredoka-Regular',
    fontSize: 14,
    color: colors.textMid,
    marginTop: 1,
  },

  tabBar: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: colors.backgroundCard,
    borderRadius: 14,
    padding: 4,
    gap: 2,
    shadowColor: '#5C3317',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    zIndex: 1,
  },
  tab: { flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: 'center' },
  tabActive: { backgroundColor: colors.primary },
  tabText: {
    fontFamily: 'Fredoka-SemiBold',
    fontSize: 15,
    color: colors.textMid,
  },
  tabTextActive: { color: colors.white },

  scrollContent: { paddingBottom: 40 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
