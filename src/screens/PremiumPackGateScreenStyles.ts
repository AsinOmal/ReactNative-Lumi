import { StyleSheet, Dimensions } from 'react-native';

const { height } = Dimensions.get('window');

export const styles = StyleSheet.create({
  bg:          { flex: 1 },
  container:   { flex: 1 },
  closeBtn:    { position: 'absolute', top: 16, left: 16, zIndex: 10, padding: 8 },
  overlay:     { flex: 1, justifyContent: 'flex-end', paddingHorizontal: 28, paddingBottom: 48, paddingTop: height * 0.45 },
  iconBubble:  { width: 96, height: 96, borderRadius: 48, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: 20, alignSelf: 'center' },
  foundLabel:  { fontFamily: 'Fredoka-Regular', fontSize: 18, color: 'rgba(255,255,255,0.8)', textAlign: 'center', marginBottom: 4 },
  packName:    { fontFamily: 'Fredoka-Bold', fontSize: 32, color: '#fff', textAlign: 'center', marginBottom: 10 },
  bodyText:    { fontFamily: 'Fredoka-Regular', fontSize: 17, color: 'rgba(255,255,255,0.75)', textAlign: 'center', marginBottom: 32, lineHeight: 24 },
  ctaBtn:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', borderRadius: 20, paddingVertical: 16, paddingHorizontal: 32, gap: 10, marginBottom: 16 },
  ctaText:     { fontFamily: 'Fredoka-Bold', fontSize: 18, color: '#1A0A4B' },
  dismissLink: { alignItems: 'center', paddingVertical: 8 },
  dismissText: { fontFamily: 'Fredoka-Regular', fontSize: 16, color: 'rgba(255,255,255,0.6)' },
});
