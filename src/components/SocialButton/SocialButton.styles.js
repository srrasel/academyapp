import { StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { radius, spacing } from '../../theme/spacing';
import { shadows } from '../../theme/shadows';

export const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md - 2,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginBottom: spacing.sm + 4,
    minHeight: 52,
    gap: spacing.md,
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBadgeGoogle: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconBadgeApple: {
    backgroundColor: '#000000',
  },
  iconBadgeFacebook: {
    backgroundColor: '#1877F2',
  },
  label: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  chevron: {
    opacity: 0.45,
  },
});
