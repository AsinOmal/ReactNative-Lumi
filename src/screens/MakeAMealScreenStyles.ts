import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  overlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 10,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recipePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: 'rgba(196,181,253,0.3)',
  },
  recipeEmoji: { fontSize: 20 },
  recipeName: { fontFamily: 'Fredoka-Bold', fontSize: 16, color: '#FFF' },

  feedbackBanner: {
    marginTop: 12,
    borderRadius: 22,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  feedbackGreen: { backgroundColor: 'rgba(5,150,105,0.92)' },
  feedbackRed: { backgroundColor: 'rgba(220,38,38,0.92)' },
  feedbackText: { fontFamily: 'Fredoka-Bold', fontSize: 18, color: '#FFF' },

  loadingCover: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(13,7,40,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingText: {
    fontFamily: 'Fredoka-SemiBold',
    fontSize: 18,
    color: '#A78BFA',
  },
});
