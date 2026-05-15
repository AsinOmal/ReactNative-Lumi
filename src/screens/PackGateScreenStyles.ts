import { StyleSheet, Dimensions } from 'react-native';
import { colors } from '../constants/colors';

const { height } = Dimensions.get('window');

export const styles = StyleSheet.create({
  bg: { flex: 1 },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 28,
  },
  containerHero: {
    flex: 1,
    paddingHorizontal: 28,
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 48,
    paddingTop: height * 0.4,
    gap: 14,
  },
  headingLight: {
    fontFamily: 'Fredoka-Bold',
    fontSize: 28,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  subtextLight: {
    fontFamily: 'Fredoka-Regular',
    fontSize: 16,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    paddingHorizontal: 8,
    lineHeight: 22,
  },
  progressTextLight: {
    fontFamily: 'Fredoka-Medium',
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  barTrackLight: {
    width: '80%',
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  dismissTextLight: {
    fontFamily: 'Fredoka-Medium',
    fontSize: 15,
    color: 'rgba(255,255,255,0.7)',
  },
  dismiss: {
    alignSelf: 'flex-end',
    padding: 8,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
  },
  bubble: {
    width: 168,
    height: 168,
    borderRadius: 84,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 8,
  },
  heading: {
    fontFamily: 'Fredoka-Bold',
    fontSize: 26,
    color: colors.textDark,
    textAlign: 'center',
  },
  subtext: {
    fontFamily: 'Fredoka-Regular',
    fontSize: 16,
    color: colors.textMid,
    textAlign: 'center',
    paddingHorizontal: 8,
    lineHeight: 22,
  },
  progressBlock: {
    width: '100%',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  progressText: {
    fontFamily: 'Fredoka-Medium',
    fontSize: 14,
    color: colors.textMid,
  },
  barTrack: {
    width: '80%',
    height: 8,
    backgroundColor: '#EEE',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  errorText: {
    fontFamily: 'Fredoka-Regular',
    fontSize: 14,
    color: '#C0392B',
    textAlign: 'center',
    paddingHorizontal: 12,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.primary,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 28,
    marginTop: 8,
  },
  ctaDisabled: {
    backgroundColor: colors.textMid,
  },
  ctaText: {
    fontFamily: 'Fredoka-SemiBold',
    fontSize: 17,
    color: '#FFFFFF',
  },
  dismissLink: {
    paddingVertical: 10,
  },
  dismissText: {
    fontFamily: 'Fredoka-Medium',
    fontSize: 15,
    color: colors.textMid,
  },
});
