import { Pressable, Text } from 'react-native';
import { styles } from './OutlineButton.styles';

export default function OutlineButton({ label, onPress, style }) {
  return (
    <Pressable style={[styles.button, style]} onPress={onPress}>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}
