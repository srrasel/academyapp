import { StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

export const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl * 2,
  },
  welcomeSection: {
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  welcomeTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: spacing.md,
    textAlign: 'left',
  },
  welcomeBody: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: 'justify',
  },
  welcomeListIntro: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.sm,
    textAlign: 'justify',
  },
  welcomeBulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: spacing.sm,
  },
  welcomeBulletText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 22,
    color: colors.text,
    textAlign: 'justify',
  },
  section: {
    width: '100%',
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: spacing.md,
    textAlign: 'left',
  },
  body: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: 'justify',
  },
  bullet: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.primary,
    fontWeight: '700',
  },
  creatorBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  creatorPhoto: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  creatorMeta: {
    flex: 1,
  },
  creatorName: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  creatorRole: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.textMuted,
  },
  closing: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: 0,
    textAlign: 'justify',
  },
});
