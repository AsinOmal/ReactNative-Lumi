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
  // Translucent disc + soft shadow keeps the back affordance readable over the
  // pack's busy hero artwork (the previous bare chevron disappeared on light
  // backgrounds like the fruits pack).
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 4,
  },
  // Image is sized by height + contain — flex:1 lets the bounding box span the
  // row so the artwork stays optically centred between back button and spacer.
  appLogo: {
    flex: 1,
    height: 44,
  },
  navSpacer: { width: 40 },
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
