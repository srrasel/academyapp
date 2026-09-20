import { StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

export const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  svg: {
    position: 'absolute',
  },
  percent: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.white,
  },
  percentSmall: {
    fontSize: 12,
  },
  percentDark: {
    color: colors.primary,
  },
});
