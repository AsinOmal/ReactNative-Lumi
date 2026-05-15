import { StyleSheet } from 'react-native';
import { colors } from '../../constants/colors';

export const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  primary: {
    flex: 1,
    borderRadius: 32,
    paddingVertical: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  primaryText: { fontFamily: 'Fredoka-Bold', fontSize: 18, color: '#FFF' },
  secondary: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.backgroundCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressBlock: { gap: 10 },
  barTrack: {
    height: 10,
    backgroundColor: '#EEE',
    borderRadius: 5,
    overflow: 'hidden',
  },
  barFill: { height: '100%' },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressText: {
    fontFamily: 'Fredoka-Medium',
    fontSize: 14,
    color: colors.textMid,
    flex: 1,
    marginLeft: 10,
  },
  cancelText: { fontFamily: 'Fredoka-SemiBold', fontSize: 15 },
  errorBlock: { gap: 10 },
  errorText: {
    fontFamily: 'Fredoka-Regular',
    fontSize: 14,
    color: '#C0392B',
    textAlign: 'center',
  },
});
