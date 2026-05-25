import { View, Text } from 'react-native';
import { styles } from './SimpleLineChart.styles';

export default function SimpleLineChart({ data, title, trend, averageLabel, averageValue }) {
  const max = Math.max(...data);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {trend ? <Text style={styles.trend}>{trend}</Text> : null}
      </View>
      <View style={styles.chart}>
        {data.map((value, index) => (
          <View
            key={index}
            style={[styles.bar, { height: `${(value / max) * 100}%` }]}
          />
        ))}
      </View>
      <Text style={styles.avg}>
        {averageLabel}: <Text style={styles.avgValue}>{averageValue}</Text>
      </Text>
    </View>
  );
}
