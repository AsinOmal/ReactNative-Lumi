import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  arView: { flex: 1 },

  noCamera: { justifyContent: 'center', alignItems: 'center', gap: 12, backgroundColor: '#0d0d0d' },
  noCameraText: { fontFamily: 'Fredoka-Regular', fontSize: 16, color: 'rgba(255,255,255,0.4)', textAlign: 'center', paddingHorizontal: 32 },

  backButton: {
    position: 'absolute', top: 56, left: 16,
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center', justifyContent: 'center',
  },
  resetButton: {
    position: 'absolute', top: 56, right: 16,
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(91,45,192,0.75)',
    alignItems: 'center', justifyContent: 'center',
  },
  packBadge: {
    position: 'absolute', top: 56,
    alignSelf: 'center', left: '50%',
    transform: [{ translateX: -70 }],
    backgroundColor: 'rgba(91,45,192,0.85)',
    borderRadius: 20, paddingHorizontal: 16, paddingVertical: 7,
  },
  packBadgeText: { fontFamily: 'Fredoka-SemiBold', fontSize: 14, color: '#fff' },

  statusBar: {
    position: 'absolute', top: 136,
    alignSelf: 'center',
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: 'rgba(91,45,192,0.82)',
    borderRadius: 28, paddingHorizontal: 24, paddingVertical: 13,
    borderWidth: 1.5, borderColor: 'rgba(167,139,250,0.55)',
    shadowColor: '#8B5CF6', shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.75, shadowRadius: 18, elevation: 10,
  },
  statusDotWrapper: { width: 16, height: 16, alignItems: 'center', justifyContent: 'center' },
  statusDotRing: {
    position: 'absolute',
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: 'rgba(74,222,128,0.25)',
  },
  statusDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: '#4ADE80' },
  statusText: {
    fontFamily: 'Fredoka-Bold', fontSize: 26, color: '#FFFFFF', letterSpacing: 0.5,
    textShadowColor: '#A78BFA', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 10,
  },

  resultCard: {
    position: 'absolute', bottom: 24, left: 16, right: 16,
    backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20,
    shadowColor: '#5B2DC0', shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15, shadowRadius: 20, elevation: 12,
  },
  resultCardHandle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: '#E0D7F5', alignSelf: 'center', marginBottom: 16,
  },
  resultCardRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 12,
  },
  resultWordBlock: { flex: 1 },
  resultWord: { fontFamily: 'Fredoka-Bold', fontSize: 28, color: '#1A1050' },
  resultPack: { fontFamily: 'Fredoka-Regular', fontSize: 13, color: '#9B87CC', marginTop: 1 },
  pronunciationBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#5B2DC0', alignItems: 'center', justifyContent: 'center', marginLeft: 12,
  },
  factBox: {
    flexDirection: 'row', backgroundColor: '#F0EBFF',
    borderRadius: 14, padding: 12, gap: 8, marginBottom: 16, alignItems: 'flex-start',
  },
  factEmoji: { fontSize: 16, marginTop: 1 },
  factText: { fontFamily: 'Fredoka-Regular', fontSize: 14, color: '#4B3D7A', flex: 1, lineHeight: 20 },
  cardActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dismissBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#F0EBFF', alignItems: 'center', justifyContent: 'center',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#5B2DC0',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
  },
  saveBtnDisabled: {
    backgroundColor: 'rgba(91, 45, 192, 0.3)',
    borderColor: 'rgba(139, 92, 246, 0.4)',
    borderWidth: 1,
  },
  saveBtnText: {
    fontFamily: 'Fredoka-SemiBold',
    fontSize: 15,
    color: '#fff',
  },
  saveBtnTextDisabled: {
    color: '#A78BFA',
  },

  unknownChip: {
    position: 'absolute',
    bottom: 160,
    alignSelf: 'center',
    backgroundColor: 'rgba(20,10,50,0.88)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.4)',
    maxWidth: '90%',
  },
  unknownChipText: {
    fontFamily: 'Fredoka-Regular',
    fontSize: 14,
    color: '#C4B5FD',
    flexShrink: 1,
  },
  unknownWord: {
    fontFamily: 'Fredoka-Bold',
    color: '#FFFFFF',
  },
  wishBtn: {
    backgroundColor: '#5B2DC0',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  wishBtnDone: {
    backgroundColor: '#059669',
  },
  wishBtnText: {
    fontFamily: 'Fredoka-SemiBold',
    fontSize: 13,
    color: '#FFF',
  },
});
