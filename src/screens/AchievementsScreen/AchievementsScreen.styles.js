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
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.lg,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
    paddingRight: spacing.lg,
  },
  badge: {
    alignItems: 'center',
    width: 72,
  },
  badgeCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  badgeLabel: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
  },
  achievementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  achievementIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.quoteBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  achievementTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  achievementDesc: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  achievementTime: {
    fontSize: 11,
    color: colors.textMuted,
  },
  certCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 2,
    borderColor: colors.gold,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  certBorder: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.xl,
    width: '100%',
    alignItems: 'center',
  },
  certTitle: {
    fontSize: 12,
    letterSpacing: 2,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  certName: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.navy,
    marginBottom: spacing.sm,
  },
  certCourse: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
  },
  certAcademy: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
    marginTop: spacing.md,
  },
  seal: {
    marginTop: spacing.lg,
  },
});
