import { StyleSheet } from 'react-native';
import { colors } from '../constants/colors';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundMain },
  safeArea:  { flex: 1 },
  scroll:    { paddingHorizontal: 16, paddingTop: 16 },

  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 6 },
  title:    { fontFamily: 'Fredoka-Bold', fontSize: 32, color: colors.textDark },
  subtitle: { fontFamily: 'Fredoka-Regular', fontSize: 17, color: colors.textMid, marginBottom: 20 },

  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.backgroundCard, borderRadius: 24,
    padding: 16, marginBottom: 14, gap: 16,
    shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.14, shadowRadius: 16, elevation: 4,
  },
  cardLocked: { opacity: 0.6 },
  iconBlock: {
    width: 56, height: 56, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  cardBody:  { flex: 1, gap: 4 },
  cardTitle: { fontFamily: 'Fredoka-Bold', fontSize: 22, color: colors.textDark },
  cardTitleLocked: { color: colors.textLight },
  cardDesc:  { fontFamily: 'Fredoka-Regular', fontSize: 15, color: colors.textMid, lineHeight: 20 },
  badge: {
    alignSelf: 'flex-start', backgroundColor: '#EDE9FE',
    borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, marginTop: 4,
  },
  badgeText: { fontFamily: 'Fredoka-SemiBold', fontSize: 11, color: colors.primary },
});
