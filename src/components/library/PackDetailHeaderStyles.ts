import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    gap: 12,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: { padding: 8, width: 44 },
  appName: {
    flex: 1,
    textAlign: 'center',
    fontFamily: 'Fredoka-Bold',
    fontSize: 22,
    color: '#FFF',
    letterSpacing: 1,
  },
  navSpacer: { width: 44 },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 4,
  },
  titleBlock: {
    flex: 1,
    gap: 4,
  },
  packName: {
    fontFamily: 'Fredoka-Bold',
    fontSize: 38,
    color: '#FFF',
    lineHeight: 44,
  },
  subtitle: {
    fontFamily: 'Fredoka-Regular',
    fontSize: 16,
    color: 'rgba(255,255,255,0.85)',
  },
  coverArt: {
    width: 120,
    height: 120,
    borderRadius: 16,
  },
});
