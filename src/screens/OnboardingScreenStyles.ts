import { StyleSheet, Dimensions } from 'react-native';

export const SLIDE_W = Dimensions.get('window').width;

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0728' },

  pager: { flex: 1 },

  slide: {
    width: SLIDE_W,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 36,
    gap: 20,
  },

  iconCircle: {
    width: 130, height: 130, borderRadius: 65,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 8,
  },

  slideTitle: {
    fontFamily: 'Fredoka-Bold', fontSize: 34, color: '#FFFFFF',
    textAlign: 'center', lineHeight: 40,
  },
  slideDesc: {
    fontFamily: 'Fredoka-Regular', fontSize: 17, color: 'rgba(255,255,255,0.7)',
    textAlign: 'center', lineHeight: 26,
  },

  footer: {
    paddingHorizontal: 28,
    paddingBottom: 40,
    gap: 24,
    alignItems: 'center',
  },

  dots: { flexDirection: 'row', gap: 8 },
  dot: {
    height: 8, borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  dotActive: { backgroundColor: '#FFFFFF' },

  nextBtn: {
    width: '100%',
    borderRadius: 32, paddingVertical: 17,
    alignItems: 'center', justifyContent: 'center',
    flexDirection: 'row', gap: 10,
  },
  nextBtnText: { fontFamily: 'Fredoka-Bold', fontSize: 20, color: '#FFF' },
});
