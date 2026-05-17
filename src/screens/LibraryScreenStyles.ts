import { StyleSheet } from 'react-native';
import { colors } from '../constants/colors';

export const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 28,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  // imageStyle inherits the parent's border-radius so the bottom corners curve
  // naturally and the header reads as one rounded card.
  headerImage: {
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  titleBlock: { flex: 1, paddingRight: 8 },
  title: {
    fontFamily: 'Fredoka-Bold',
    fontSize: 52,
    color: colors.textDark,
    lineHeight: 58,
  },
  countRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  subtitle: {
    fontFamily: 'Fredoka-SemiBold',
    fontSize: 18,
    color: colors.textMid,
  },

  icon: { width: 165, height: 165 },

  body: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingTop: 14, gap: 14 },

  // Rounded section pill: cream-translucent surface so headings feel anchored.
  sectionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: 'rgba(255,253,247,0.78)',
    marginTop: 10,
    marginBottom: 4,
    shadowColor: '#3D2008',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionLabel: {
    fontFamily: 'Fredoka-Bold',
    fontSize: 20,
    color: colors.textDark,
  },

  // Library-themed background decoration. pointerEvents="none" on the parent
  // wrapper so the icons never intercept scroll or tap events. Kept sparse and
  // faint per the brief — three quiet shapes, not a busy scene.
  decorLayer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  decorBook: { position: 'absolute', top: 260, left: 14, opacity: 0.05 },
  decorStar: { position: 'absolute', top: 480, right: 28, opacity: 0.06 },
  decorMark: { position: 'absolute', top: 700, left: 60, opacity: 0.05 },
});
