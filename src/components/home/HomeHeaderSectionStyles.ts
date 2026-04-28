import { StyleSheet } from 'react-native';
import { colors } from '../../constants/colors';

export const styles = StyleSheet.create({
  container:   { gap: 16, paddingHorizontal: 16 },
  logoRow:     { alignItems: 'center', marginBottom: 4, marginTop: 12 },
  logoPlaceholder: { backgroundColor: colors.primary, borderRadius: 16, paddingHorizontal: 20, paddingVertical: 6 },
  logoText:    { fontFamily: 'Fredoka-Bold', fontSize: 24, color: '#FFF', letterSpacing: 3 },

  headerCard: {
    borderRadius: 28, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 12,
    overflow: 'hidden',
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25, shadowRadius: 18, elevation: 8,
  },
  deco1: { position: 'absolute', top: 12, right: 54 },
  deco2: { position: 'absolute', top: 28, right: 36 },
  deco3: { position: 'absolute', bottom: 14, left: 110 },

  mascotCircle: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center', justifyContent: 'center',
  },
  greetingBlock: { flex: 1, gap: 2 },
  greeting:      { fontFamily: 'Fredoka-Bold', fontSize: 24, color: '#FFF' },
  subGreeting:   { fontFamily: 'Fredoka-Regular', fontSize: 15, color: 'rgba(255,255,255,0.8)' },
  streakBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 4,
    backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 10, alignSelf: 'flex-start',
    paddingHorizontal: 8, paddingVertical: 3,
  },
  streakText: { fontFamily: 'Fredoka-Bold', fontSize: 13, color: '#FFF' },
  trophyBtn:  { padding: 6 },

  progressBanner: {
    backgroundColor: colors.backgroundCard, borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 14,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 10, elevation: 3,
  },
  progressLeft:  { flexDirection: 'row', alignItems: 'center', gap: 12 },
  progressCount: { fontFamily: 'Fredoka-Bold', fontSize: 18, color: colors.textDark },
  progressSub:   { fontFamily: 'Fredoka-Regular', fontSize: 13, color: colors.textMid },

  sectionRow:   { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  sectionTitle: { fontFamily: 'Fredoka-Bold', fontSize: 22, color: colors.textDark },
});
