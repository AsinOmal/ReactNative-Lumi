import { StyleSheet } from 'react-native';
import { colors } from '../../constants/colors';

export const overlayStyles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0D0728',
    alignItems: 'center',
  },
  safeArea: { flex: 1, width: '100%' },
  scroll: { width: '100%' },
  scrollContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 32,
  },

  mascotWrap: { marginBottom: 2 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  title: { fontFamily: 'Fredoka-Bold', fontSize: 34, color: '#FFD700' },
  tagline: {
    fontFamily: 'Fredoka-Regular', fontSize: 15,
    color: 'rgba(255,255,255,0.65)', marginBottom: 18,
  },

  sectionLabel: {
    fontFamily: 'Fredoka-SemiBold', fontSize: 12,
    color: '#9B8FD4', letterSpacing: 2, marginBottom: 10,
  },

  instrGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, width: '100%', marginBottom: 16 },
  instrCard: {
    width: '48%', backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16, padding: 12,
    borderWidth: 1, borderColor: 'rgba(196,181,253,0.18)', gap: 5,
  },
  instrTitle: { fontFamily: 'Fredoka-SemiBold', fontSize: 14, color: '#FFF' },
  instrDesc: {
    fontFamily: 'Fredoka-Regular', fontSize: 12,
    color: 'rgba(255,255,255,0.58)', lineHeight: 16,
  },

  emojiGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    justifyContent: 'center', gap: 8, marginBottom: 20,
  },
  emojiCell: {
    width: 48, height: 48, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.08)',
  },
  emojiCellLoaded: { backgroundColor: 'rgba(124,58,237,0.3)', borderColor: '#7C3AED' },
  emojiIcon: { fontSize: 26 },
  emojiIconDim: { opacity: 0.25 },

  progressContainer: { width: '100%', alignItems: 'center', gap: 8, marginBottom: 16 },
  progressSubtitle: { fontFamily: 'Fredoka-SemiBold', fontSize: 15, color: colors.primaryLight },
  progressBarTrack: {
    width: '100%', height: 10, backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 5, overflow: 'hidden',
  },
  progressBarFill: { height: '100%', backgroundColor: '#7C3AED', borderRadius: 5 },
  progressCount: { fontFamily: 'Fredoka-Regular', fontSize: 13, color: '#7C5CBF' },

  startBtn: {
    width: '100%', backgroundColor: '#10B981', borderRadius: 28,
    paddingVertical: 18, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 10,
    shadowColor: '#10B981', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45, shadowRadius: 12, elevation: 6,
  },
  startBtnText: { fontFamily: 'Fredoka-Bold', fontSize: 22, color: '#FFF' },

  tipRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 16 },
  tipText: { fontFamily: 'Fredoka-Regular', fontSize: 12, color: 'rgba(255,255,255,0.42)' },
});
