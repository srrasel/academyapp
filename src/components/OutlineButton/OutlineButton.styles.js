import { StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { radius, spacing } from '../../theme/spacing';

export const styles = StyleSheet.create({
  button: {
    borderWidth: 1.5,
    borderColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  label: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '600',
  },
});
