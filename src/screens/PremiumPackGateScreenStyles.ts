import { StyleSheet } from 'react-native';
import { colors } from '../constants/colors';

export const styles = StyleSheet.create({
  bg: { flex: 1 },

  closeBtn: {
    position: 'absolute',
    right: 20,
    zIndex: 10,
  },
  closeBtnBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Centred card overlay — identical layout to PackGateScreen
  cardWrap: {
    position: 'absolute',
    left: 24,
    right: 24,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: 'rgba(255, 248, 235, 0.83)',
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.72)',
    paddingHorizontal: 24,
    paddingTop: 22,
    paddingBottom: 28,
    alignItems: 'center',
    gap: 8,
    shadowColor: '#3D2008',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 12,
  },

  // Pack icon badge
  badgeWrap: {
    marginBottom: 4,
  },
  badgeCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  badgeEmoji: {
    fontSize: 32,
  },
  sparkleDot: {
    position: 'absolute',
    top: -2,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFF8E7',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,200,50,0.4)',
  },

  foundTitle: {
    fontFamily: 'Fredoka-Bold',
    fontSize: 26,
    color: colors.textDark,
    textAlign: 'center',
  },
  belongsTo: {
    fontFamily: 'Fredoka-Medium',
    fontSize: 14,
    color: colors.textMid,
    textAlign: 'center',
    marginTop: -2,
  },
  subtext: {
    fontFamily: 'Fredoka-Regular',
    fontSize: 14,
    color: colors.textMid,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 8,
  },

  // Premium CTA — white button (dark text) to feel "special"
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderRadius: 28,
    marginTop: 8,
    alignSelf: 'stretch',
    borderWidth: 1.5,
    borderColor: 'rgba(255,154,46,0.35)',
    shadowColor: '#3D2008',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  ctaText: {
    fontFamily: 'Fredoka-SemiBold',
    fontSize: 16,
    color: colors.textDark,
  },

  dismissLink: {
    paddingVertical: 6,
    alignItems: 'center',
  },
  dismissText: {
    fontFamily: 'Fredoka-Medium',
    fontSize: 15,
    color: colors.textMid,
    opacity: 0.85,
  },
});
