import { StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { radius, spacing } from '../../theme/spacing';

export const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.navy,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  content: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    marginBottom: spacing.md,
  },
  meta: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
    marginBottom: spacing.sm,
  },
  smallBtn: {
    alignSelf: 'flex-start',
    backgroundColor: colors.white,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
  },
  smallBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.navy,
  },
});
