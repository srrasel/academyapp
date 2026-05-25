import { StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { radius, spacing } from '../../theme/spacing';

export const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  number: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  numberLocked: {
    backgroundColor: colors.border,
  },
  numberText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
  },
  progress: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  status: {
    marginLeft: spacing.sm,
  },
});
