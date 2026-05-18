import { StyleSheet, Dimensions } from 'react-native';
import { colors } from '../constants/colors';

const { width } = Dimensions.get('window');
const CARD_WIDTH = Math.min(width * 0.86, 420);

export const styles = StyleSheet.create({
  bg: { flex: 1 },
  // Top-aligned: logo → mascot → card → footer. No justifyContent so the
  // logo sits near the top without leaving a huge gap above the mascot.
  scroll: {
    flexGrow: 1,
    paddingBottom: 32,
  },
  content: { alignItems: 'center', paddingHorizontal: 16 },
  // Compact logo block — tight bottom margin so the mascot sits close below.
  logoWrap: {
    alignItems: 'center',
    marginBottom: 0,
  },

  // Legacy mascot wrap — still used by Register/Forgot/EmailVerification via
  // the shared AuthHero component. Will retire when those screens get their
  // own card-layout pass.
  mascotWrap: { marginVertical: 4 },
  // Card-layout mascot — sits above the cream card and overlaps its top edge
  // by half the mascot. Negative marginTop pulls it tight against the logo
  // band so there's no dead sky between the brand mark and the form.
  mascotOverlap: {
    zIndex: 2,
    marginTop: -12,
    marginBottom: -52,
  },

  // Cream card body — the visual centerpiece. paddingHorizontal kept tight so
  // the inputs inside read as wide rounded fields rather than narrow chips.
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#FFF8E7',
    borderRadius: 36,
    paddingTop: 64, // room for the overlapped mascot
    paddingBottom: 28,
    paddingHorizontal: 18,
    borderWidth: 1.5,
    borderColor: '#E6D5BB',
    shadowColor: '#3D2008',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.22,
    shadowRadius: 22,
    elevation: 10,
  },
  // Variant for screens without the mascot overlap (e.g. ForgotPassword).
  // Lower paddingTop since there's no owl peeking into the card.
  cardNoMascot: {
    paddingTop: 28,
  },

  // Title row with little stars on either side
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 4,
  },
  titleText: {
    fontFamily: 'Fredoka-Bold',
    fontSize: 26,
    color: colors.textDark,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'Fredoka-Regular',
    fontSize: 14,
    color: colors.textMid,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 6,
  },

  // Form section
  form: { gap: 12 },
  errorText: {
    fontFamily: 'Fredoka-Medium',
    fontSize: 13,
    color: colors.dangerDark,
    paddingHorizontal: 8,
  },
  forgotLink: {
    alignSelf: 'flex-end',
    paddingVertical: 4,
    paddingHorizontal: 6,
    marginTop: -2,
  },
  forgotText: {
    fontFamily: 'Fredoka-Medium',
    fontSize: 13,
    color: colors.accentBlue,
  },

  // Primary CTA — orange gradient pill
  primaryBtn: {
    borderRadius: 26,
    overflow: 'hidden',
    marginTop: 8,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.34,
    shadowRadius: 10,
    elevation: 6,
  },
  primaryBtnGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  primaryBtnDisabled: { opacity: 0.55 },
  primaryBtnText: {
    fontFamily: 'Fredoka-Bold',
    fontSize: 17,
    color: '#FFFFFF',
    letterSpacing: 0.4,
  },
  primaryStarLeft: { position: 'absolute', left: 18, top: 14, opacity: 0.6 },
  primaryStarRight: { position: 'absolute', right: 18, top: 14, opacity: 0.6 },

  // "or" divider
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E6D5BB',
  },
  dividerText: {
    fontFamily: 'Fredoka-Medium',
    fontSize: 13,
    color: colors.textMid,
  },

  // Google button
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: '#E6D5BB',
  },
  googleBtnText: {
    fontFamily: 'Fredoka-Bold',
    fontSize: 15,
    color: colors.textDark,
  },

  // Below-card footer (link + terms)
  belowCard: {
    width: CARD_WIDTH,
    alignItems: 'center',
    marginTop: 14,
    gap: 10,
  },
  // Tinted pill so the link reads over the grass background.
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: 'rgba(255,248,231,0.82)',
  },
  linkText: {
    fontFamily: 'Fredoka-Medium',
    fontSize: 14,
    color: colors.textDark,
  },
  linkAction: {
    fontFamily: 'Fredoka-Bold',
    fontSize: 14,
    color: colors.primary,
  },
  // Translucent pill under the terms text so it reads over the busy grass
  // background. Without this, on devices where the card sits high the terms
  // landed over the green hills with poor contrast.
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(255,248,231,0.82)',
    maxWidth: '92%',
  },
  termsText: {
    fontFamily: 'Fredoka-Medium',
    fontSize: 12,
    color: colors.textMid,
    textAlign: 'center',
    lineHeight: 16,
    flexShrink: 1,
  },

  // Back button (used in Register / Forgot)
  backBtn: {
    position: 'absolute',
    left: 8,
    padding: 10,
    zIndex: 10,
  },
  // Forgot-password success state — large green check sits inside the card
  // where the form was, giving an unmistakable visual confirmation.
  sentBadgeRow: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  // Email-verification helper lines — secondary hint under the subtitle, and
  // a green "we resent it" confirmation that swaps in after the resend button.
  verifyHint: {
    fontFamily: 'Fredoka-Regular',
    fontSize: 13,
    color: colors.textDark,
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 6,
    lineHeight: 18,
  },
  verifyOk: {
    fontFamily: 'Fredoka-SemiBold',
    fontSize: 13,
    color: colors.successDark,
    textAlign: 'center',
    marginBottom: 10,
  },

  // Legacy aliases kept so Register/Forgot/EmailVerification screens still
  // resolve their style references during this incremental redesign — they
  // will be retired when those screens get their own card-layout pass.
  title: {
    fontFamily: 'Fredoka-Bold',
    fontSize: 26,
    color: colors.textDark,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 14,
    fontFamily: 'Fredoka-Regular',
    fontSize: 16,
    color: colors.textDark,
    borderWidth: 1.5,
    borderColor: '#E6D5BB',
  },
  inputError: { borderColor: colors.dangerDark },
  primaryBtnPlain: {
    backgroundColor: colors.primary,
    borderRadius: 28,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  terms: {
    fontFamily: 'Fredoka-Regular',
    fontSize: 12,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: 24,
    paddingHorizontal: 16,
    lineHeight: 18,
  },
});
