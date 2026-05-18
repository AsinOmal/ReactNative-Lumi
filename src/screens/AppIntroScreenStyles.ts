import { StyleSheet, Dimensions } from 'react-native';
import { colors } from '../constants/colors';

export const SLIDE_W = Dimensions.get('window').width;

export const styles = StyleSheet.create({
  // Root bg switched from skyBottom (blue) to white so the safe-area regions
  // above the status bar and below the home indicator don't show a hard blue
  // strip where the panoramic image doesn't reach.
  root: { flex: 1, backgroundColor: '#FFFFFF' },
  // Panoramic bg image sized to span every slide. translateX is bound to the
  // ScrollView's scrollX (driven natively) so the image slides at the same
  // rate as the carousel — each slide reveals a different region of the art.
  panoramicBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    height: '100%',
  },
  // Translucent white wash above the panorama — softens the busy artwork so
  // dark-brown title/body text reads cleanly on every slide. Stops at root's
  // padding box, so safe areas stay clean white via the root bg.
  bgOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.28)',
  },
  // Skip wrapped in its own cream pill — matches the textPanel treatment so
  // the action reads as a deliberate UI control rather than floating text.
  skip: {
    position: 'absolute',
    top: 0,
    right: 16,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: 'rgba(255,248,231,0.92)',
    borderWidth: 1,
    borderColor: 'rgba(230,213,187,0.9)',
    shadowColor: '#3D2008',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 3,
  },
  skipText: {
    fontFamily: 'Fredoka-Bold',
    fontSize: 14,
    color: colors.primary,
  },
  scroll: { flex: 1 },
  // Content (media + textPanel) is centered as a single block. space-between
  // left a huge sky gap between hero and card on tall devices; center keeps
  // them visually tied together regardless of screen height.
  slide: {
    width: SLIDE_W,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  // Fixed-size media slot so anything inside (hero art, icon chip, language
  // glyph) lands centered in the same box. Without this the title shifts up
  // on icon-only slides because the chip is smaller than the hero images.
  slideMedia: {
    width: 260,
    height: 260,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
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
  // Hero art swap — when a slide has its own illustration, the icon chip
  // disappears and the image fills the same visual slot at a larger scale so
  // the slide reads as a poster, not a label.
  heroArt: {
    width: 260,
    height: 260,
    marginBottom: 20,
  },
  // Opt-in size bump for slides whose artwork reads small at the default 260px
  // slot (e.g. Made-for-Families uses two figures + a UI card, so individual
  // elements shrink). Overflowing the slideMedia box is intentional — the
  // surrounding layout doesn't clip, and the art still lands above the panel.
  heroArtLg: {
    width: 320,
    height: 320,
  },
  // Cream-tinted card at the bottom of each slide. Wraps step badge, title,
  // body, and optional feature pills — the visual centerpiece of the slide.
  textPanel: {
    width: '100%',
    backgroundColor: 'rgba(255,248,231,0.92)',
    borderRadius: 28,
    paddingTop: 22,
    paddingBottom: 22,
    paddingHorizontal: 22,
    borderWidth: 1,
    borderColor: 'rgba(230,213,187,0.85)',
    shadowColor: '#3D2008',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 14,
    elevation: 6,
    alignItems: 'center',
  },
  // "Step N" badge above the title — orange pill, white text.
  stepBadge: {
    backgroundColor: colors.primary,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 14,
    marginBottom: 10,
  },
  stepText: {
    fontFamily: 'Fredoka-Bold',
    fontSize: 12,
    color: '#FFFFFF',
    letterSpacing: 0.4,
  },
  // Two-column feature-pill row under the body — quick visual hints of what
  // the user will do. Soft cream-tinted with a primary-orange icon chip.
  pillRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
    width: '100%',
  },
  featurePill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#EFE2C9',
  },
  featurePillIcon: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: 'rgba(255,154,46,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featurePillText: {
    fontFamily: 'Fredoka-SemiBold',
    fontSize: 12,
    color: colors.textDark,
    flex: 1,
  },
  title: {
    fontFamily: 'Fredoka-Bold',
    fontSize: 28,
    color: colors.textDark,
    textAlign: 'center',
    marginBottom: 8,
  },
  body: {
    fontFamily: 'Fredoka-Medium',
    fontSize: 16,
    color: colors.textDark,
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
  // Same cream pill treatment as textPanel so the warning reads cleanly
  // against the grass/landscape backdrop instead of fading into it.
  disclaimer: {
    marginTop: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 18,
    backgroundColor: 'rgba(255,248,231,0.9)',
    borderWidth: 1,
    borderColor: 'rgba(230,213,187,0.85)',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    shadowColor: '#3D2008',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.16,
    shadowRadius: 8,
    elevation: 3,
  },
  disclaimerText: {
    fontFamily: 'Fredoka-Medium',
    fontSize: 13,
    color: colors.textDark,
    textAlign: 'left',
    lineHeight: 18,
    flex: 1,
  },
  // Reserved-but-invisible disclaimer state for English. The View still
  // occupies its natural height (so the rest of the slide doesn't shift),
  // but it reads as empty space to the user.
  disclaimerHidden: {
    opacity: 0,
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
