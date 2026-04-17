import { StyleSheet, Platform } from 'react-native';

export const styles = StyleSheet.create({
  tabBarWrapper: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    alignItems: 'center', paddingHorizontal: 24,
    backgroundColor: 'transparent',
  },
  tabBarPill: {
    flexDirection: 'row', backgroundColor: '#FFFFFF',
    borderRadius: 40, paddingHorizontal: 8, paddingVertical: 10,
    alignItems: 'center', justifyContent: 'space-between', width: '100%',
    ...Platform.select({
      ios: { shadowColor: '#5B2DC0', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.18, shadowRadius: 20 },
      android: { elevation: 12 },
    }),
  },
  tabButton: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingVertical: 4, gap: 2,
  },
  tabLabel: {
    fontFamily: 'Fredoka-SemiBold', fontSize: 10, marginTop: 1,
  },
  activeDot: {
    width: 4, height: 4, borderRadius: 2,
    backgroundColor: '#5B2DC0', marginTop: 2,
  },
  // Scan button — stays elevated as the primary action
  scanWrapper: {
    flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: -28,
  },
  scanGlow: {
    position: 'absolute', width: 68, height: 68, borderRadius: 34,
    backgroundColor: '#5B2DC0', opacity: 0.18, top: -2,
  },
  scanCircle: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: '#5B2DC0', alignItems: 'center', justifyContent: 'center',
    ...Platform.select({
      ios: { shadowColor: '#5B2DC0', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.5, shadowRadius: 12 },
      android: { elevation: 14 },
    }),
  },
});
