import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },

  // Header overlay
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: 'Fredoka-Bold',
    fontSize: 18,
    color: '#FFFFFF',
    marginHorizontal: 8,
  },
  headerSpacer: { width: 40 },

  // Bottom info card
  bottomCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 36,
    alignItems: 'center',
    gap: 12,
  },
  wordName: {
    fontFamily: 'Fredoka-Bold',
    fontSize: 32,
    color: '#1A1050',
  },
  syllableRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  syllableChip: {
    backgroundColor: '#EDE9FE',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  syllableText: {
    fontFamily: 'Fredoka-SemiBold',
    fontSize: 15,
    color: '#5B2DC0',
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
    marginTop: 4,
  },
  navBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0EBFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBtnDisabled: { opacity: 0.35 },
  navCounter: {
    fontFamily: 'Fredoka-SemiBold',
    fontSize: 16,
    color: '#9B87CC',
    minWidth: 60,
    textAlign: 'center',
  },

  // Loading cover
  loadingCover: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontFamily: 'Fredoka-Regular',
    fontSize: 16,
    color: '#FFFFFF',
  },
});
