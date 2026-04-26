import { StyleSheet } from 'react-native';
import { colors } from '../constants/colors';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundMain },
  safeArea:  { flex: 1 },

  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 12 },
  backBtn: { padding: 8 },
  headerCenter: { flex: 1, alignItems: 'center' },
  packEmoji: { fontSize: 28 },
  packName: { fontFamily: 'Fredoka-Bold', fontSize: 22, color: colors.textDark, marginTop: 2 },

  scroll: { paddingHorizontal: 16, paddingTop: 8, gap: 10 },

  wordRow: {
    backgroundColor: colors.backgroundCard, borderRadius: 20,
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12, gap: 14,
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  wordEmoji:     { fontSize: 28 },
  wordLabel:     { fontFamily: 'Fredoka-Bold', fontSize: 18, color: colors.textDark, flex: 1 },
  wordSyllables: { fontFamily: 'Fredoka-Regular', fontSize: 13, color: colors.textMid },

  teaserCard: {
    backgroundColor: colors.primaryDark, borderRadius: 28,
    marginTop: 16, marginHorizontal: 4, padding: 28,
    alignItems: 'center', gap: 12,
  },
  teaserTitle: { fontFamily: 'Fredoka-Bold', fontSize: 26, color: '#FFF', textAlign: 'center' },
  teaserBody:  { fontFamily: 'Fredoka-Regular', fontSize: 15, color: colors.primaryLight, textAlign: 'center', lineHeight: 22 },
  teaserWords: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 4 },
  teaserChip: {
    backgroundColor: 'rgba(196,181,253,0.2)', borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 1, borderColor: 'rgba(196,181,253,0.3)',
  },
  teaserChipText: { fontFamily: 'Fredoka-SemiBold', fontSize: 13, color: '#E0D4FF' },
  unlockBtn: {
    backgroundColor: colors.primary, borderRadius: 32,
    paddingHorizontal: 32, paddingVertical: 16, marginTop: 8,
    width: '100%', alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 10,
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
  },
  unlockBtnText: { fontFamily: 'Fredoka-Bold', fontSize: 18, color: '#FFF' },
  comingSoon:    { fontFamily: 'Fredoka-Regular', fontSize: 13, color: colors.textMid, marginTop: 4 },

  arBtn: {
    backgroundColor: colors.primary, borderRadius: 32,
    marginHorizontal: 16, marginBottom: 32, marginTop: 8,
    paddingVertical: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 10,
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35, shadowRadius: 14, elevation: 6,
  },
  arBtnText: { fontFamily: 'Fredoka-Bold', fontSize: 18, color: '#FFF' },
});
