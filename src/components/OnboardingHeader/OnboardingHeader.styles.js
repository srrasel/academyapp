import { StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { shadows } from '../../theme/shadows';

export const styles = StyleSheet.create({
  wrap: {
    paddingBottom: spacing.lg,
  },
  wrapLeft: {
    paddingBottom: spacing.xl,
  },
  wrapCompact: {
    paddingBottom: spacing.md,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
    marginBottom: spacing.xs,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  backButtonOverlay: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  navSpacer: {
    width: 40,
  },
  iconWrap: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 86, 210, 0.12)',
    ...shadows.sm,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
    letterSpacing: -0.3,
  },
  titleLeft: {
    textAlign: 'left',
    paddingHorizontal: 0,
    fontSize: 28,
    marginTop: spacing.md,
  },
  titleLeftCompact: {
    textAlign: 'left',
    paddingHorizontal: 0,
    fontSize: 26,
    marginTop: spacing.xs,
    letterSpacing: -0.5,
  },
  titleLight: {
    color: colors.white,
  },
  subtitle: {
    marginTop: spacing.sm,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: spacing.lg,
  },
  subtitleLeft: {
    textAlign: 'left',
    paddingHorizontal: 0,
    marginTop: spacing.sm,
    lineHeight: 24,
  },
  subtitleCompact: {
    marginTop: spacing.xs,
    lineHeight: 22,
  },
  subtitleLight: {
    color: 'rgba(255,255,255,0.92)',
  },
  statsBar: {
    marginTop: spacing.sm,
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
  statsBarLight: {
    color: 'rgba(255,255,255,0.9)',
  },
});
