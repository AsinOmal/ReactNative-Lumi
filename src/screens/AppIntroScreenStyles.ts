import { StyleSheet, Dimensions } from 'react-native';
import { colors } from '../constants/colors';

export const SLIDE_W = Dimensions.get('window').width;

export const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.skyBottom },
  skip: {
    position: 'absolute',
    top: 0,
    right: 16,
    zIndex: 10,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  skipText: {
    fontFamily: 'Fredoka-Medium',
    fontSize: 15,
    color: colors.textMid,
  },
  scroll: { flex: 1 },
  slide: {
    width: SLIDE_W,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  iconWrap: {
    width: 100,
    height: 100,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
    shadowColor: colors.primaryDark,
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  title: {
    fontFamily: 'Fredoka-SemiBold',
    fontSize: 26,
    color: colors.textDark,
    textAlign: 'center',
    marginBottom: 10,
  },
  body: {
    fontFamily: 'Fredoka-Regular',
    fontSize: 16,
    color: colors.textMid,
    textAlign: 'center',
    lineHeight: 22,
  },
  // Language slide
  langRow: { flexDirection: 'row', gap: 12, marginTop: 24 },
  langBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.borderPrimary,
    backgroundColor: colors.cardBg,
  },
  langBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryDark,
  },
  langBtnText: {
    fontFamily: 'Fredoka-SemiBold',
    fontSize: 16,
    color: colors.textDark,
  },
  langBtnTextActive: { color: colors.white },
  disclaimer: {
    marginTop: 16,
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255,154,46,0.12)',
  },
  disclaimerText: {
    fontFamily: 'Fredoka-Regular',
    fontSize: 13,
    color: colors.textMid,
    textAlign: 'center',
    lineHeight: 18,
  },
  // Dots + CTA
  footer: {
    paddingBottom: 40,
    paddingHorizontal: 32,
    alignItems: 'center',
    gap: 20,
  },
  dots: { flexDirection: 'row', gap: 8 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.borderPrimary,
  },
  dotActive: { backgroundColor: colors.primary, width: 20 },
  cta: {
    width: '100%',
    height: 52,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primaryDark,
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  ctaText: {
    fontFamily: 'Fredoka-SemiBold',
    fontSize: 18,
    color: colors.white,
  },
});
