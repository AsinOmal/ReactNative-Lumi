import { StyleSheet, Dimensions } from 'react-native';
import { colors } from '../constants/colors';

export const SLIDE_W = Dimensions.get('window').width;

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.skyTop },

  pager: { flex: 1 },

  slide: {
    width: SLIDE_W,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 36,
    gap: 20,
  },

  // Wraps the floating mascot. Sized to host the 220-px mascot.
  mascotWrapper: {
    width: 240,
    height: 240,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },

  // Decoration Lotties — absolute positioned around the slide so the mascot
  // and text stay centred while the background reads as a "scene". Sparkles
  // appear on every slide; sun + cloud only on slide 0 (sky theme).
  decoSun: {
    position: 'absolute',
    top: 70,
    right: 24,
    width: 90,
    height: 90,
  },
  decoCloud: {
    position: 'absolute',
    top: 130,
    left: -30,
    width: 200,
    height: 80,
  },
  decoTL: { position: 'absolute', top: 60, left: 20, width: 90, height: 90 },
  decoTR: { position: 'absolute', top: 90, right: 30, width: 110, height: 110 },
  decoBL: {
    position: 'absolute',
    bottom: 220,
    left: 30,
    width: 100,
    height: 100,
  },
  decoBR: {
    position: 'absolute',
    bottom: 280,
    right: 40,
    width: 120,
    height: 120,
  },

  slideTitle: {
    fontFamily: 'Fredoka-Bold',
    fontSize: 38,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 46,
  },
  slideDesc: {
    fontFamily: 'Fredoka-Regular',
    fontSize: 20,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    lineHeight: 30,
  },

  footer: {
    paddingHorizontal: 28,
    paddingBottom: 40,
    gap: 24,
    alignItems: 'center',
  },

  dots: { flexDirection: 'row', gap: 8 },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  dotActive: { backgroundColor: '#FFFFFF' },
});
