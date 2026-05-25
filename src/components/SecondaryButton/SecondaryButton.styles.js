import { StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { radius, spacing } from '../../theme/spacing';

export const styles = StyleSheet.create({
  button: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.white,
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  buttonDark: {
    borderColor: colors.primary,
  },
  label: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  labelDark: {
    color: colors.primary,
  },
});
