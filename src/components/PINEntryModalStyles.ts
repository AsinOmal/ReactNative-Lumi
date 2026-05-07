import { StyleSheet } from 'react-native';
import { colors } from '../constants/colors';

export const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: colors.backgroundCard,
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    width: 300,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  dots: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: 'transparent',
  },
  dotFilled: {
    backgroundColor: colors.primary,
  },
  dotError: {
    borderColor: colors.error,
    backgroundColor: colors.error,
  },
  error: {
    color: colors.error,
    fontSize: 13,
    marginBottom: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 240,
    marginTop: 16,
    justifyContent: 'center',
    gap: 12,
  },
  key: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyEmpty: {
    backgroundColor: 'transparent',
  },
  keyText: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  cancelBtn: {
    marginTop: 20,
    padding: 8,
  },
  cancelText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
});
