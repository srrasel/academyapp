import { StyleSheet } from 'react-native';
import { spacing } from '../../theme/spacing';

export const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  background: {
    flex: 1,
    justifyContent: 'space-between',
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  topSection: {
    alignItems: 'center',
    paddingTop: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  bottomContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  headline: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 32,
    letterSpacing: 0.2,
  },
  button: {
    borderRadius: 8,
  },
});
