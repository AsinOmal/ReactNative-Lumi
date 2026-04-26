import { StyleSheet } from 'react-native';
import { colors } from '../constants/colors';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundMain },
  safeArea: { flex: 1 },
  scroll: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 20 },
  userCard: {
    backgroundColor: colors.backgroundCard, borderRadius: 24,
    padding: 24, alignItems: 'center', marginBottom: 24,
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 12, elevation: 4,
  },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: colors.primary, alignItems: 'center',
    justifyContent: 'center', marginBottom: 12,
  },
  avatarText: { fontFamily: 'Fredoka-Bold', fontSize: 28, color: colors.white },
  displayName: { fontFamily: 'Fredoka-Bold', fontSize: 22, color: colors.textDark, marginBottom: 4 },
  email: { fontFamily: 'Fredoka-Regular', fontSize: 14, color: colors.textMid },
  sectionLabel: {
    fontFamily: 'Fredoka-SemiBold', fontSize: 13,
    color: colors.textMid, textTransform: 'uppercase',
    letterSpacing: 0.8, marginBottom: 6, paddingHorizontal: 4,
  },
  section: {
    backgroundColor: colors.backgroundCard, borderRadius: 16,
    marginBottom: 16, overflow: 'hidden',
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
});
