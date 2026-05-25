import { View, Text } from 'react-native';
import { styles } from './ProgressRing.styles';

export default function ProgressRing({ percent, size = 'medium', variant = 'light' }) {
  const isDark = variant === 'dark';
  const isSmall = size === 'small';

  return (
    <View style={[styles.ring, isSmall && styles.ringSmall, isDark && styles.ringDark]}>
      <Text style={[styles.percent, isDark && styles.percentDark]}>{percent}%</Text>
    </View>
  );
}
