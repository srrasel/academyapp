import { StyleSheet } from 'react-native';
import { spacing } from '../../theme/spacing';

export const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  backgroundImage: {
    transform: [{ translateY: -48 }],
    height: '112%',
  },
  background: {
    flex: 1,
  },
  topSection: {
    alignItems: 'center',
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  spacer: {
    flex: 1,
    minHeight: spacing.xxl,
  },
  bottomContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    paddingTop: spacing.md,
    transform: [{ translateY: 20 }],
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
