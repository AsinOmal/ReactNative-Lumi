import { StyleSheet } from 'react-native';
import { colors } from '../constants/colors';

export const styles = StyleSheet.create({
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    gap: 16,
  },
  mascotWrap: { marginVertical: 8 },
  tagline: {
    fontFamily: 'Fredoka-Regular',
    fontSize: 20,
    color: colors.textMid,
    textAlign: 'center',
    marginBottom: 8,
  },
  btnWrap: { width: '100%', maxWidth: 360 },
});
