import { StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

export const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    flex: 1,
    backgroundColor: colors.white,
  },
  contentInner: {
    padding: spacing.lg,
    paddingBottom: spacing.xl * 2,
    backgroundColor: colors.white,
  },
  videoWrap: {
    marginBottom: spacing.lg,
    borderRadius: 12,
    overflow: 'hidden',
  },
  lessonTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  lessonMeta: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
  about: {
    fontSize: 15,
    lineHeight: 24,
    color: colors.text,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    marginTop: 20,
    marginBottom: 8,
  },
  bullet: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.text,
    marginBottom: 6,
  },
  highlightLabel: {
    fontWeight: '700',
  },
  audioOnlyBanner: {
    backgroundColor: '#EAF0FB',
    borderRadius: 12,
    padding: 12,
    marginBottom: spacing.lg,
  },
  audioOnlyText: {
    fontSize: 13,
    color: colors.primary,
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.white,
  },
  nextBtn: {
    minWidth: 100,
  },
  adOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  adCard: {
    width: '100%',
    maxWidth: 420,
  },
});
