import { View, Text } from 'react-native';
import { styles } from './Divider.styles';

export default function Divider({ label = 'or' }) {
  return (
    <View style={styles.row}>
      <View style={styles.line} />
      <Text style={styles.text}>{label}</Text>
      <View style={styles.line} />
    </View>
  );
}
