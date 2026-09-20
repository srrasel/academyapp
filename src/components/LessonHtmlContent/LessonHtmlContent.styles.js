import { StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

export const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    minHeight: 120,
    backgroundColor: colors.white,
  },
  webview: {
    width: '100%',
    backgroundColor: colors.white,
  },
  plainText: {
    fontSize: 15,
    lineHeight: 24,
    color: colors.text,
    textAlign: 'left',
  },
  loader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
});
