import { StyleSheet } from 'react-native';
import { colors } from '../constants/colors';

export const styles = StyleSheet.create({
  root:             { flex: 1, backgroundColor: '#000' },
  arView:           { flex: 1 },
  backBtn:          { position: 'absolute', left: 16, zIndex: 10, backgroundColor: 'rgba(0,0,0,0.45)', borderRadius: 20, padding: 8 },

  // Searching
  searchingOverlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  pulseRing:        { width: 80, height: 80, borderRadius: 40, borderWidth: 3, borderColor: 'rgba(255,255,255,0.7)', marginBottom: 20 },
  searchingHint:    { fontFamily: 'Fredoka-SemiBold', fontSize: 18, color: '#fff', textAlign: 'center', paddingHorizontal: 32, textShadowColor: 'rgba(0,0,0,0.6)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 },

  // Placed
  placedOverlay:    { position: 'absolute', bottom: 0, left: 0, right: 0, alignItems: 'center', gap: 8 },
  placedWord:       { fontFamily: 'Fredoka-Bold', fontSize: 32, color: '#fff', textShadowColor: 'rgba(0,0,0,0.7)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 6 },
  placedLabel:      { fontFamily: 'Fredoka-Regular', fontSize: 16, color: 'rgba(255,255,255,0.8)', marginBottom: 4 },
  replaceBtn:       { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fff', borderRadius: 20, paddingHorizontal: 20, paddingVertical: 11 },
  replaceBtnText:   { fontFamily: 'Fredoka-SemiBold', fontSize: 16, color: colors.primary },

  // Timeout
  timeoutOverlay:   { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.55)' },
  timeoutCard:      { backgroundColor: colors.backgroundCard, borderRadius: 24, padding: 28, alignItems: 'center', gap: 10, marginHorizontal: 32 },
  timeoutTitle:     { fontFamily: 'Fredoka-Bold', fontSize: 22, color: colors.textDark, textAlign: 'center' },
  timeoutSub:       { fontFamily: 'Fredoka-Regular', fontSize: 15, color: colors.textMid, textAlign: 'center', lineHeight: 22 },
  tryAgainBtn:      { backgroundColor: colors.primary, borderRadius: 16, paddingHorizontal: 28, paddingVertical: 12, marginTop: 4 },
  tryAgainText:     { fontFamily: 'Fredoka-Bold', fontSize: 16, color: '#fff' },
  goBackText:       { fontFamily: 'Fredoka-Regular', fontSize: 15, color: colors.textMid, paddingVertical: 8 },
});
