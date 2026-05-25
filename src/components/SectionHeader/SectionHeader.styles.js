import { StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

export const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    marginTop: spacing.lg,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  link: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
});
