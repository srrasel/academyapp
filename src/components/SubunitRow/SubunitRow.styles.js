import { StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

export const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingVertical: spacing.md,
  },
  timeline: {
    width: 32,
    alignItems: 'center',
  },
  line: {
    position: 'absolute',
    top: 28,
    bottom: -8,
    width: 2,
    backgroundColor: colors.border,
    left: 15,
  },
  content: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  meta: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
});
