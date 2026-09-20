import { StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { radius, spacing } from '../../theme/spacing';

export const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.cardBg,
    marginBottom: spacing.sm + 4,
  },
  itemSelected: {
    borderColor: colors.borderSelected,
    backgroundColor: '#F0F7FF',
  },
  leftIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  flag: {
    fontSize: 22,
  },
  label: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  itemWarm: {
    backgroundColor: colors.accentWarmCard,
    borderColor: colors.accentWarmBorder,
  },
  itemWarmSelected: {
    borderColor: colors.accentWarmDark,
    backgroundColor: colors.accentWarmSoft,
    borderWidth: 2,
  },
  leftIconWarm: {
    backgroundColor: colors.accentWarmSoft,
  },
  checkWarm: {
    backgroundColor: colors.accentWarmDark,
  },
  check: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
