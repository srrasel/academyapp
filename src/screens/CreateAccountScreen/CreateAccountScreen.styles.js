import { StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { radius, spacing } from '../../theme/spacing';
import { shadows } from '../../theme/shadows';

export const styles = StyleSheet.create({
  screenContent: {
    paddingTop: 0,
    paddingBottom: spacing.xxl,
  },
  form: {
    gap: spacing.md + 4,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingLeft: spacing.lg,
    paddingRight: spacing.md,
    paddingVertical: 16,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.white,
    minHeight: 54,
    ...shadows.soft,
  },
  passwordWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    minHeight: 54,
    paddingRight: spacing.sm,
    ...shadows.soft,
  },
  passwordInput: {
    flex: 1,
    paddingLeft: spacing.lg,
    paddingRight: spacing.sm,
    paddingVertical: 16,
    fontSize: 16,
    color: colors.text,
  },
  eyeButton: {
    padding: 6,
  },
  passwordHint: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: -4,
    paddingLeft: spacing.xs,
  },
  primaryCta: {
    marginTop: spacing.lg,
  },
  socialSection: {
    marginTop: spacing.xl,
  },
  footer: {
    marginTop: spacing.xl,
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  footerText: {
    fontSize: 15,
    color: colors.textMuted,
    lineHeight: 22,
  },
  footerLink: {
    color: colors.primary,
    fontWeight: '700',
  },
});
