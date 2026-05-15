import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3D0',
    borderLeftWidth: 4,
    borderLeftColor: '#FF9A2E',
    paddingVertical: 11,
    paddingHorizontal: 14,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 10,
    shadowColor: '#C96B00',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  bannerText: {
    flex: 1,
    fontFamily: 'Fredoka-SemiBold',
    fontSize: 14,
    color: '#7A4A00',
    lineHeight: 18,
  },
  dismissBtn: {
    marginLeft: 8,
  },
});
