import { StyleSheet } from 'react-native';
import { colors } from '../../constants/colors';

export const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, gap: 10, paddingBottom: 8 },
  sectionLabel: {
    fontFamily: 'Fredoka-SemiBold',
    fontSize: 12,
    color: colors.textMid,
    letterSpacing: 1,
    marginTop: 6,
    marginLeft: 4,
  },
  card: {
    backgroundColor: colors.backgroundCard,
    borderRadius: 18,
    shadowColor: '#5C3317',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF0DC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: { flex: 1 },
  rowLabel: {
    fontFamily: 'Fredoka-SemiBold',
    fontSize: 15,
    color: colors.textDark,
  },
  rowSub: {
    fontFamily: 'Fredoka-Regular',
    fontSize: 12,
    color: colors.textMid,
    marginTop: 2,
  },
  divider: { height: 1, backgroundColor: '#F0E8D8', marginHorizontal: 16 },
  successText: {
    fontFamily: 'Fredoka-SemiBold',
    fontSize: 14,
    color: colors.success,
    textAlign: 'center',
    marginTop: 4,
  },
});
