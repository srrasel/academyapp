import { StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

export const styles = StyleSheet.create({
  wrap: {
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 10,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringFill: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 10,
    borderColor: colors.primary,
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
  },
  percent: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
  },
  label: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
});
