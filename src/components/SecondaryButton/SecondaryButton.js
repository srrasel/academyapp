import { Pressable, Text } from 'react-native';
import { styles } from './SecondaryButton.styles';

export default function SecondaryButton({ label, onPress, variant = 'light', style }) {
  const isDark = variant === 'dark';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        isDark && styles.buttonDark,
        pressed && { opacity: 0.85 },
        style,
      ]}
    >
      <Text style={[styles.label, isDark && styles.labelDark]}>{label}</Text>
    </Pressable>
  );
}
