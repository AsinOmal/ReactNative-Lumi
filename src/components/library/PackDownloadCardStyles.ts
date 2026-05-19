import { StyleSheet } from 'react-native';
import { colors } from '../../constants/colors';

export const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,248,235,0.92)',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    shadowColor: '#3D2008',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.10,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.65)',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: { flex: 1, gap: 3 },
  title: {
    fontFamily: 'Fredoka-SemiBold',
    fontSize: 15,
    color: colors.textDark,
  },
  subtitle: {
    fontFamily: 'Fredoka-Regular',
    fontSize: 13,
    color: colors.textMid,
    lineHeight: 18,
  },
  meta: {
    fontFamily: 'Fredoka-Medium',
    fontSize: 12,
    color: colors.textLight,
    marginTop: 2,
  },
  barTrack: {
    height: 6,
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 6,
  },
  barFill: { height: '100%', borderRadius: 3 },
});
