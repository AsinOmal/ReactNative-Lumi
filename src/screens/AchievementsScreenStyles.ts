import { StyleSheet } from 'react-native';
import { colors } from '../constants/colors';

export const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.backgroundMain },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 12 },
  backBtn: { padding: 8 },
  headerTitle: { flex: 1, textAlign: 'center', fontFamily: 'Fredoka-Bold', fontSize: 22, color: colors.textDark },
  scroll: { paddingHorizontal: 16, paddingBottom: 40, gap: 12 },

  card: {
    backgroundColor: colors.backgroundCard,
    borderRadius: 24, padding: 16,
    flexDirection: 'row', alignItems: 'center', gap: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.14, shadowRadius: 16, elevation: 4,
  },
  cardLocked: {
    backgroundColor: '#F8F9FA', shadowOpacity: 0, elevation: 0,
    borderColor: '#E2E8F0', borderWidth: 1,
  },

  iconContainer: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: '#FFF9C4', alignItems: 'center', justifyContent: 'center',
  },
  iconContainerLocked: { backgroundColor: '#F1F5F9' },

  cardText: { flex: 1, gap: 4 },
  title:       { fontFamily: 'Fredoka-Bold', fontSize: 18, color: colors.primary },
  titleLocked: { fontFamily: 'Fredoka-Bold', fontSize: 18, color: '#94A3B8' },
  description: { fontFamily: 'Fredoka-Regular', fontSize: 14, color: '#64748B' },

  metaRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6,
    backgroundColor: '#F8F5FF', alignSelf: 'flex-start',
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8,
  },
  unlockedWith: { fontFamily: 'Fredoka-Regular', fontSize: 12, color: '#6B7280' },
  triggerWord:  { fontFamily: 'Fredoka-SemiBold', color: colors.primary },

  shareHint: { flexDirection: 'column', alignItems: 'center', gap: 4 },
});
