import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { spacing } from '../../theme/spacing';
import { styles } from './ScreenFooter.styles';

export default function ScreenFooter({ children, absolute = true, style }) {
  const insets = useSafeAreaInsets();
  const paddingBottom = spacing.lg + insets.bottom;

  return (
    <View
      style={[
        absolute ? styles.footer : styles.footerInline,
        { paddingBottom },
        style,
      ]}
    >
      {children}
    </View>
  );
}
