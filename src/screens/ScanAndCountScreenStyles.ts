import { StyleSheet } from 'react-native';
import { colors } from '../constants/colors';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerSpacer: { flex: 1 },
  roundPill: {
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 5,
  },
  roundPillText: {
    fontFamily: 'Fredoka-SemiBold',
    fontSize: 14,
    color: '#FFFFFF',
  },

  // Wrong-tap feedback banner
  wrongBanner: {
    alignSelf: 'center',
    marginTop: 8,
    backgroundColor: 'rgba(239,68,68,0.85)',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  wrongText: { fontFamily: 'Fredoka-Bold', fontSize: 16, color: '#FFFFFF' },

  // Loading cover
  loadingCover: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontFamily: 'Fredoka-Regular',
    fontSize: 16,
    color: '#FFFFFF',
  },

  // Round won banner
  roundWonOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(5,46,22,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roundWonText: { fontFamily: 'Fredoka-Bold', fontSize: 36, color: '#FFFFFF' },

  // Session complete overlay
  sessionOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  sessionEmoji: { fontSize: 72, marginBottom: 8 },
  sessionTitle: { fontFamily: 'Fredoka-Bold', fontSize: 34, color: '#FFFFFF' },
  sessionSub: {
    fontFamily: 'Fredoka-Regular',
    fontSize: 18,
    color: '#C4B5FD',
    marginBottom: 24,
  },
  doneBtn: {
    backgroundColor: colors.primary,
    borderRadius: 28,
    paddingHorizontal: 48,
    paddingVertical: 16,
  },
  doneBtnText: { fontFamily: 'Fredoka-Bold', fontSize: 20, color: '#FFFFFF' },
});
