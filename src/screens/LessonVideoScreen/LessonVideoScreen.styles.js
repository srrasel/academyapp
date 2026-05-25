import { StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { radius, spacing } from '../../theme/spacing';

export const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  about: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
  keyPoints: {
    backgroundColor: colors.quoteBg,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  point: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  pointText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  tabContent: {
    fontSize: 14,
    color: colors.textMuted,
    paddingVertical: spacing.lg,
  },
});
