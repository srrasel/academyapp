import { StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { radius, spacing } from '../../theme/spacing';

export const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  trend: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.success,
  },
  chartWrap: {
    marginBottom: spacing.sm,
    minHeight: 80,
    justifyContent: 'center',
  },
  emptyChart: {
    fontSize: 13,
    lineHeight: 20,
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: spacing.md,
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 80,
    gap: 6,
    marginBottom: spacing.sm,
  },
  bar: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 4,
    minHeight: 8,
  },
  avg: {
    fontSize: 13,
    color: colors.textMuted,
  },
  avgValue: {
    fontWeight: '700',
    color: colors.text,
  },
});
