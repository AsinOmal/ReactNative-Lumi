import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
    // transparent — background image shows through
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: { padding: 8, width: 44 },
  appName: {
    flex: 1,
    textAlign: 'center',
    fontFamily: 'Fredoka-Bold',
    fontSize: 22,
    color: '#FFF',
    letterSpacing: 1,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  navSpacer: { width: 44 },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  // Soft peach glow wraps only the title — lets background art bleed through
  // on either side while keeping the text readable.
  titleGlow: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 4,
  },
  packName: {
    fontFamily: 'Fredoka-Bold',
    fontSize: 36,
    color: '#FFF',
    lineHeight: 42,
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  subtitle: {
    fontFamily: 'Fredoka-Regular',
    fontSize: 15,
    color: 'rgba(255,255,255,0.9)',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  coverArt: {
    width: 110,
    height: 110,
    borderRadius: 14,
  },
});
