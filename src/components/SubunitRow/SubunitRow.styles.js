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
    top: 32,
    bottom: -8,
    width: 2,
    backgroundColor: colors.border,
    left: 15,
  },
  dotCompleted: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotCurrent: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotCurrentText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.white,
  },
  dotPending: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  content: {
    flex: 1,
    marginLeft: spacing.sm,
    paddingTop: 2,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  meta: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
  },
});
