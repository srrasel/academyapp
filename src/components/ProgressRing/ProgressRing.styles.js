import { StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

export const styles = StyleSheet.create({
  ring: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  ringSmall: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  ringDark: {
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  percent: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.white,
  },
  percentDark: {
    color: colors.primary,
  },
});
