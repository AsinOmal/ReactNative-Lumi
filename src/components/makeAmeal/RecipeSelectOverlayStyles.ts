import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0D0728',
    paddingTop: 56,
  },
  header: { paddingHorizontal: 20, marginBottom: 8 },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  title:    { fontFamily: 'Fredoka-Bold', fontSize: 30, color: '#FFF' },
  subtitle: { fontFamily: 'Fredoka-Regular', fontSize: 16, color: '#A78BFA', marginTop: 2 },

  scroll: { paddingHorizontal: 16, paddingBottom: 40, gap: 12 },

  card: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 22, padding: 16,
    flexDirection: 'row', alignItems: 'center', gap: 14,
    borderWidth: 1.5, borderColor: 'rgba(196,181,253,0.15)',
  },
  recipeIconCircle: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  cardBody:  { flex: 1, gap: 4 },
  cardName:  { fontFamily: 'Fredoka-Bold', fontSize: 20, color: '#FFF' },
  cardDesc:  { fontFamily: 'Fredoka-Regular', fontSize: 14, color: '#A78BFA', lineHeight: 20 },

  ingredientsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  ingredientChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(196,181,253,0.15)', borderRadius: 12,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  ingredientText: { fontFamily: 'Fredoka-SemiBold', fontSize: 12, color: '#C4B5FD' },
});
