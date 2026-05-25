import { StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { radius, spacing } from '../../theme/spacing';

export const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  subGreeting: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  unitCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  unitRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  thumb: {
    width: 80,
    height: 80,
    borderRadius: radius.md,
    backgroundColor: colors.border,
  },
  unitInfo: {
    flex: 1,
  },
  unitTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  unitMeta: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  quoteCard: {
    backgroundColor: colors.quoteBg,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
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
  nextCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  nextThumb: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    backgroundColor: colors.border,
  },
  nextTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMuted,
  },
});
