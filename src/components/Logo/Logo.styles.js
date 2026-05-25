import { StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

export const styles = StyleSheet.create({
  logoImage: {
    width: 220,
    height: 88,
    backgroundColor: 'transparent',
  },
  container: {
    alignItems: 'center',
  },
  iconWrap: {
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: colors.primary,
  },
  titleLight: {
    color: colors.white,
  },
  tagline: {
    marginTop: spacing.xs,
    fontSize: 13,
    color: colors.textMuted,
  },
  taglineLight: {
    color: 'rgba(255,255,255,0.9)',
  },
});
