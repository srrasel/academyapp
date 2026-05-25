import { StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

export const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  text: {
    marginHorizontal: spacing.md,
    fontSize: 13,
    fontWeight: '500',
    color: colors.textMuted,
    textTransform: 'lowercase',
  },
});
