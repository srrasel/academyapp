import { StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { radius, spacing } from '../../theme/spacing';
import { shadows } from '../../theme/shadows';

export const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  subGreeting: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  unitCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  unitRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  thumb: {
    width: 72,
    height: 72,
    borderRadius: radius.md,
    backgroundColor: colors.border,
  },
  unitInfo: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.xs,
  },
  unitTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    lineHeight: 20,
  },
  unitMeta: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  continueBtn: {
    marginTop: spacing.md,
  },
  quoteCard: {
    flexDirection: 'row',
    backgroundColor: colors.quoteBg,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  quoteBody: {
    flex: 1,
  },
  quoteText: {
    fontSize: 15,
    fontStyle: 'italic',
    color: colors.navy,
    lineHeight: 22,
  },
  quoteAuthor: {
    marginTop: spacing.sm,
    fontSize: 12,
    color: colors.textMuted,
  },
});
