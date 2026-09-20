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
  forgotPressable: {
    alignSelf: 'flex-end',
    marginTop: -4,
  },
  forgotText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  primaryCta: {
    marginTop: spacing.lg,
  },
  socialSection: {
    marginTop: spacing.xl,
  },
  switchPressable: {
    marginTop: spacing.xl,
    alignSelf: 'center',
    paddingVertical: spacing.sm,
  },
  switchText: {
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
  },
  switchLink: {
    color: colors.primary,
    fontWeight: '700',
  },
});
