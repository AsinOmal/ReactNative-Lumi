import { StyleSheet, Platform } from 'react-native';
import { colors } from '../constants/colors';
import { tabBarPillStyle } from '../constants/skeuomorphicTokens';

const SCAN_BTN_SIZE = 68;

export const styles = StyleSheet.create({
  // Outer wrapper — full-width column, scan button stacked above pill
  tabBarWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },

  // Scan button container — negative marginBottom = half the button height
  // so the bottom half of the button overlaps the pill top edge
  scanBtnLift: {
    marginBottom: -(SCAN_BTN_SIZE / 2),
    zIndex: 10,
  },

  // Scan button: 3-layer wood bevel + glossy orange face — matches the
  // "Find it" CTA on the daily word card. Outer dark wood, inner light wood
  // highlight, then the orange gradient face with a top sheen for the gloss.
  scanBtnShadow: {
    ...Platform.select({
      ios: {
        shadowColor: '#C96B00',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.6,
        shadowRadius: 10,
      },
      android: { elevation: 12 },
    }),
  },
  scanBtnOuter: {
    width: SCAN_BTN_SIZE,
    height: SCAN_BTN_SIZE,
    borderRadius: SCAN_BTN_SIZE / 2,
    padding: 2,
    backgroundColor: '#5C3317',
  },
  scanBtnInner: {
    width: SCAN_BTN_SIZE - 4,
    height: SCAN_BTN_SIZE - 4,
    borderRadius: (SCAN_BTN_SIZE - 4) / 2,
    padding: 1.5,
    backgroundColor: '#C48A4A',
  },
  scanBtnFace: {
    width: SCAN_BTN_SIZE - 7,
    height: SCAN_BTN_SIZE - 7,
    borderRadius: (SCAN_BTN_SIZE - 7) / 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  // White pill — tabBarPillStyle provides bg, border, and shadow
  tabBarPill: {
    flexDirection: 'row',
    paddingHorizontal: 6,
    paddingVertical: 10,
    alignItems: 'center',
    width: '100%',
    ...tabBarPillStyle,
  },

  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabInner: {
    alignItems: 'center',
    gap: 3,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 18,
  },
  activeTabPill: {
    backgroundColor: 'rgba(255,154,46,0.15)',
  },
  tabLabel: {
    fontFamily: 'Fredoka-SemiBold',
    fontSize: 13,
    color: colors.tabInactive,
  },

  // Transparent gap in the pill under the scan button
  scanSpacer: {
    width: SCAN_BTN_SIZE + 14,
  },
});
