import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0EBFF' },
  safeArea: { flex: 1 },
  scroll: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 20 },
  userCard: {
    backgroundColor: '#FFFFFF', borderRadius: 24,
    padding: 24, alignItems: 'center', marginBottom: 24,
    shadowColor: '#5B2DC0', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 12, elevation: 4,
  },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#5B2DC0', alignItems: 'center',
    justifyContent: 'center', marginBottom: 12,
  },
  avatarText: { fontFamily: 'Fredoka-Bold', fontSize: 28, color: '#FFF' },
  displayName: { fontFamily: 'Fredoka-Bold', fontSize: 22, color: '#1A1050', marginBottom: 4 },
  email: { fontFamily: 'Fredoka-Regular', fontSize: 14, color: '#888' },
  sectionLabel: {
    fontFamily: 'Fredoka-SemiBold', fontSize: 13,
    color: '#9B87CC', textTransform: 'uppercase',
    letterSpacing: 0.8, marginBottom: 6, paddingHorizontal: 4,
  },
  section: {
    backgroundColor: '#FFFFFF', borderRadius: 16,
    marginBottom: 16, overflow: 'hidden',
    shadowColor: '#5B2DC0', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
});
