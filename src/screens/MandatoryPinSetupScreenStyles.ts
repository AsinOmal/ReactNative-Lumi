import { StyleSheet } from 'react-native';
import { colors } from '../constants/colors';

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F0EBFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    gap: 10,
  },
  brand: {
    fontFamily: 'Fredoka-Bold',
    fontSize: 24,
    color: colors.primary,
  },
  title: {
    fontFamily: 'Fredoka-Bold',
    fontSize: 28,
    color: colors.textDark,
    textAlign: 'center',
  },
  body: {
    fontFamily: 'Fredoka-Regular',
    fontSize: 16,
    color: colors.textMid,
    textAlign: 'center',
    lineHeight: 23,
    maxWidth: 320,
  },
});
