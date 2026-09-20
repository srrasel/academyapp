import { StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { radius, spacing } from '../../theme/spacing';

export const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xl * 2,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  currentBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.accentWarmSoft,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.accentWarmBorder,
  },
  currentBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.accentWarmDark,
  },
  planCard: {
    backgroundColor: colors.accentWarmSoft,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.accentWarmBorder,
  },
  planCardActive: {
    borderColor: colors.accentWarmDark,
    backgroundColor: colors.accentWarmSoft,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  planTitleCol: {
    flex: 1,
  },
  planName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  planPrice: {
    marginTop: 4,
    fontSize: 22,
    fontWeight: '800',
    color: colors.primary,
  },
  planPaymentType: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  planBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.white,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 8,
  },
  featureText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: colors.text,
  },
  selectBtn: {
    marginTop: spacing.md,
  },
  note: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: spacing.md,
    lineHeight: 18,
  },
});
