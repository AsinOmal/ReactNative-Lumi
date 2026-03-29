import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  overlay:   { ...StyleSheet.absoluteFillObject, alignItems: 'center' },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center',
    width: '100%', paddingHorizontal: 16, paddingTop: 8, gap: 8,
  },
  closeBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center', justifyContent: 'center',
  },
  scorePill: {
    backgroundColor: '#5B2DC0', borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 6,
  },
  scorePillText: { fontFamily: 'Fredoka-Bold', fontSize: 16, color: '#FFF' },

  timerPill: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 1.5, borderColor: 'rgba(196,181,253,0.4)',
  },
  timerPillUrgent: {
    backgroundColor: 'rgba(220,38,38,0.85)',
    borderColor: '#FCA5A5',
  },
  timerText: { fontFamily: 'Fredoka-Bold', fontSize: 16, color: '#E2E8F0' },
  timerTextUrgent: { color: '#FFF' },

  progressPill: {
    marginLeft: 'auto', backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6,
  },
  progressText: { fontFamily: 'Fredoka-SemiBold', fontSize: 15, color: '#E2E8F0' },

  // Target card
  targetCard: {
    marginTop: 14, backgroundColor: 'rgba(15,7,40,0.90)',
    borderRadius: 26, paddingVertical: 14, paddingHorizontal: 28,
    alignItems: 'center',
    borderWidth: 1.5, borderColor: 'rgba(196,181,253,0.35)', gap: 2,
  },
  tapThe:      { fontFamily: 'Fredoka-Regular', fontSize: 12, color: '#C4B5FD', letterSpacing: 2 },
  targetEmoji: { fontSize: 52 },
  targetWord:  { fontFamily: 'Fredoka-Bold', fontSize: 30, color: '#FFF' },

  // Feedback
  feedbackBanner: {
    marginTop: 12, borderRadius: 22, paddingHorizontal: 24, paddingVertical: 10,
  },
  feedbackGreen: { backgroundColor: 'rgba(5,150,105,0.92)' },
  feedbackRed:   { backgroundColor: 'rgba(220,38,38,0.92)' },
  feedbackText:  { fontFamily: 'Fredoka-Bold', fontSize: 18, color: '#FFF' },

  // Hint
  hintRow: { position: 'absolute', bottom: 32, alignSelf: 'center' },
  hintText: {
    fontFamily: 'Fredoka-Regular', fontSize: 13,
    color: 'rgba(255,255,255,0.5)', textAlign: 'center',
  },

  // Loading overlay
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0D0728',
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 24, gap: 20,
  },
  loadingTitle: {
    fontFamily: 'Fredoka-Bold', fontSize: 36, color: '#FFF', textAlign: 'center',
    marginTop: -20, textShadowColor: 'rgba(124,58,237,0.5)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 10,
  },
  instructionsBox: {
    backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 24,
    padding: 24, width: '100%', gap: 14,
    borderWidth: 1.5, borderColor: 'rgba(196,181,253,0.2)',
  },
  instructionLine: {
    fontFamily: 'Fredoka-SemiBold', fontSize: 17, color: '#E2E8F0',
  },
  loadingActionArea: {
    width: '100%', height: 80, justifyContent: 'center', alignItems: 'center', marginTop: 10,
  },
  progressContainer: { width: '100%', alignItems: 'center', gap: 8 },
  loadingSubtitle: {
    fontFamily: 'Fredoka-SemiBold', fontSize: 16, color: '#A78BFA',
  },
  progressBarTrack: {
    width: '100%', height: 12, backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 6, overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%', backgroundColor: '#7C3AED', borderRadius: 6,
  },
  progressCount: {
    fontFamily: 'Fredoka-Regular', fontSize: 14, color: '#7C5CBF',
  },
  startGameBtn: {
    backgroundColor: '#10B981', paddingVertical: 18, paddingHorizontal: 40,
    borderRadius: 30, width: '100%', alignItems: 'center',
    shadowColor: '#10B981', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 5,
  },
  startGameBtnText: {
    fontFamily: 'Fredoka-Bold', fontSize: 22, color: '#FFF',
  },
  emojiGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    justifyContent: 'center', gap: 12, marginTop: 10,
  },
  emojiCell: {
    width: 54, height: 54, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.08)',
  },
  emojiCellLoaded: {
    backgroundColor: 'rgba(124,58,237,0.3)',
    borderColor: '#7C3AED',
  },
  emojiIcon:    { fontSize: 28 },
  emojiIconDim: { opacity: 0.25 },

  // Game Over
  gameOverBg: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.88)',
    alignItems: 'center', justifyContent: 'center', padding: 32,
  },
  gameOverCard: {
    backgroundColor: '#1A1050', borderRadius: 32,
    paddingVertical: 40, paddingHorizontal: 36,
    alignItems: 'center', gap: 10, width: '100%',
    borderWidth: 1.5, borderColor: 'rgba(196,181,253,0.3)',
  },
  gameOverEmoji:  { fontSize: 72, marginBottom: 4 },
  gameOverTitle:  { fontFamily: 'Fredoka-Bold', fontSize: 30, color: '#FFF' },
  timedOutSub:    { fontFamily: 'Fredoka-Regular', fontSize: 16, color: '#A78BFA' },
  scoreRow:       { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginTop: 4 },
  scoreLabel:     { fontFamily: 'Fredoka-Regular', fontSize: 17, color: '#A78BFA' },
  scoreNum:       { fontFamily: 'Fredoka-Bold', fontSize: 40, color: '#C4B5FD' },
  mistakesText:   { fontFamily: 'Fredoka-Regular', fontSize: 15, color: '#6B7280' },
  playAgainBtn: {
    marginTop: 12, backgroundColor: '#5B2DC0',
    borderRadius: 20, paddingHorizontal: 36, paddingVertical: 14,
    width: '100%', alignItems: 'center',
  },
  playAgainText: { fontFamily: 'Fredoka-Bold', fontSize: 18, color: '#FFF' },
  doneBtn: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20, paddingHorizontal: 36, paddingVertical: 12,
    width: '100%', alignItems: 'center',
  },
  doneBtnText: { fontFamily: 'Fredoka-SemiBold', fontSize: 17, color: '#A78BFA' },
});
