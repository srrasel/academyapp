import { View, Text } from 'react-native';
import { styles } from './DonutChart.styles';

export default function DonutChart({ percent, size = 100 }) {
  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <View style={[styles.ring, { width: size, height: size, borderRadius: size / 2 }]}>
        <Text style={styles.percent}>{percent}%</Text>
        <Text style={styles.label}>Completed</Text>
      </View>
    </View>
  );
}
