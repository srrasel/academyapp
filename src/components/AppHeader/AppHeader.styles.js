import { StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

export const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    flex: 1,
    alignItems: 'center',
  },
  logoText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    color: colors.primary,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  right: {
    width: 40,
    alignItems: 'flex-end',
  },
});
