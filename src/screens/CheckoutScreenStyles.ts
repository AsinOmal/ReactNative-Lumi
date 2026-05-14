import { StyleSheet } from 'react-native';
import { colors } from '../constants/colors';

export const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: colors.background, paddingHorizontal: 24 },
  centered:     { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 32 },
  backBtn:      { marginBottom: 24, alignSelf: 'flex-start' },
  title:        { fontFamily: 'Fredoka-Bold', fontSize: 28, color: colors.textDark, marginBottom: 4 },
  packName:     { fontFamily: 'Fredoka-SemiBold', fontSize: 18, color: colors.primary, marginBottom: 2 },
  price:        { fontFamily: 'Fredoka-Bold', fontSize: 22, color: colors.textDark, marginBottom: 4 },
  simNotice:    { fontFamily: 'Fredoka-Regular', fontSize: 13, color: colors.textLight, marginBottom: 28 },
  input:        { backgroundColor: colors.backgroundCard, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, fontFamily: 'Fredoka-Regular', fontSize: 16, color: colors.textDark, marginBottom: 12 },
  row:          { flexDirection: 'row', gap: 12 },
  inputHalf:    { flex: 1 },
  errorText:    { fontFamily: 'Fredoka-Regular', fontSize: 14, color: colors.error, marginBottom: 8 },
  ctaBtn:       { backgroundColor: colors.primary, borderRadius: 20, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  ctaDisabled:  { opacity: 0.4 },
  ctaText:      { fontFamily: 'Fredoka-Bold', fontSize: 18, color: '#fff' },
  successTitle: { fontFamily: 'Fredoka-Bold', fontSize: 28, color: colors.textDark, textAlign: 'center' },
  successSub:   { fontFamily: 'Fredoka-Regular', fontSize: 16, color: colors.textMid, textAlign: 'center' },
});
