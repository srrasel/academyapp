import { StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { radius, spacing } from '../../theme/spacing';

export const styles = StyleSheet.create({
  actions: {
    marginTop: spacing.sm,
  },
  emailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md + 2,
    borderRadius: radius.sm,
    backgroundColor: colors.primary,
    gap: spacing.sm,
    minHeight: 52,
    marginTop: spacing.sm,
  },
  emailLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  dividerWrap: {
    marginVertical: spacing.lg,
  },
  footer: {
    paddingTop: spacing.xxl,
    paddingBottom: spacing.lg,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 15,
    color: colors.textMuted,
  },
  footerLink: {
    color: colors.primary,
    fontWeight: '600',
  },
});
