import { Pressable, Text } from 'react-native';
import { styles } from './PrimaryButton.styles';

export default function PrimaryButton({ label, onPress, disabled, style }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        disabled && styles.buttonDisabled,
        pressed && { opacity: 0.9 },
        style,
      ]}
    >
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}
