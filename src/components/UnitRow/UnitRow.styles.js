import { StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

export const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    marginHorizontal: -spacing.sm,
    borderRadius: 12,
    gap: spacing.md,
  },
  rowActive: {
    backgroundColor: colors.accentWarmCard,
    borderWidth: 1,
    borderColor: colors.accentWarmBorder,
    marginBottom: 4,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  number: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberLocked: {
    backgroundColor: colors.border,
  },
  numberActive: {
    backgroundColor: colors.accentWarmDark,
  },
  numberText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  numberTextLocked: {
    color: colors.textMuted,
  },
  numberTextActive: {
    color: colors.white,
  },
  title: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
    lineHeight: 20,
  },
  titleLocked: {
    color: colors.textMuted,
  },
  titleActive: {
    fontWeight: '700',
    color: colors.text,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minWidth: 56,
    justifyContent: 'flex-end',
  },
  progress: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
  },
  progressActive: {
    color: colors.accentWarmDark,
  },
  progressDone: {
    color: colors.textMuted,
  },
  progressLocked: {
    color: colors.locked,
  },
  progressDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.accentWarmDark,
  },
  emptyDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border,
  },
});
