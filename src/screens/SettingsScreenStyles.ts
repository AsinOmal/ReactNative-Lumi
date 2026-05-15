import { StyleSheet } from 'react-native';
import { colors } from '../constants/colors';

export const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 52,
    gap: 6,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    overflow: 'hidden',
    shadowColor: '#3A7FA8',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  displayName: {
    fontFamily: 'Fredoka-Bold',
    fontSize: 26,
    color: colors.textDark,
  },
  email: { fontFamily: 'Fredoka-Regular', fontSize: 17, color: colors.textMid },
  body: { flex: 1 },
  scroll: { paddingHorizontal: 16, paddingTop: 24, gap: 4 },
  sectionLabel: {
    fontFamily: 'Fredoka-SemiBold',
    fontSize: 16,
    color: colors.textMid,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
    marginTop: 8,
    paddingHorizontal: 4,
  },
  section: {
    backgroundColor: colors.backgroundCard,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#5C3317',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 3,
  },
});
