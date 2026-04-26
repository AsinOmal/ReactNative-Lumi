import { StyleSheet, Platform } from 'react-native';
import { colors } from '../constants/colors';

const SCAN_BTN_SIZE = 68;

export const styles = StyleSheet.create({
  // Outer wrapper — full-width column, scan button stacked above pill
  tabBarWrapper: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: 16,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },

  // Scan button container — negative marginBottom = half the button height
  // so the bottom half of the button overlaps the pill top edge
  scanBtnOuter: {
    marginBottom: -(SCAN_BTN_SIZE / 2),
    zIndex: 10,
  },

  scanBtn: {
    width: SCAN_BTN_SIZE, height: SCAN_BTN_SIZE, borderRadius: SCAN_BTN_SIZE / 2,
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
    ...Platform.select({
      ios:     { shadowColor: colors.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.5, shadowRadius: 10 },
      android: { elevation: 10 },
    }),
  },

  // White pill — height set by tab items, not the scan button
  tabBarPill: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 36,
    paddingHorizontal: 4,
    paddingVertical: 6,
    alignItems: 'center',
    width: '100%',
    ...Platform.select({
      ios:     { shadowColor: '#7B3FC4', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 16 },
      android: { elevation: 14 },
    }),
  },

  tabButton: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
  },
  tabInner: { alignItems: 'center', gap: 3, paddingVertical: 4 },
  tabLabel: {
    fontFamily: 'Fredoka-SemiBold', fontSize: 11,
  },

  // Transparent gap in the pill under the scan button
  scanSpacer: {
    width: SCAN_BTN_SIZE + 14,
  },
});
