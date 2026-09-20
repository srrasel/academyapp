import { View, Text } from 'react-native';
import Svg, { Polyline, Circle } from 'react-native-svg';
import { colors } from '../../theme/colors';
import { styles } from './SimpleLineChart.styles';

export default function SimpleLineChart({
  data = [],
  title,
  trend,
  averageLabel,
  averageValue,
  emptyLabel,
}) {
  const width = 280;
  const height = 80;
  const padding = 8;
  const hasData = Array.isArray(data) && data.length > 0;
  const max = hasData ? Math.max(...data, 1) : 1;
  const min = hasData ? Math.min(...data, 0) : 0;
  const range = max - min || 1;

  const points = hasData
    ? data
        .map((value, index) => {
          const x = padding + (index / Math.max(data.length - 1, 1)) * (width - padding * 2);
          const y = height - padding - ((value - min) / range) * (height - padding * 2);
          return `${x},${y}`;
        })
        .join(' ')
    : '';

  const lastPoint = hasData ? data[data.length - 1] : 0;
  const lastX = padding + ((data.length - 1) / Math.max(data.length - 1, 1)) * (width - padding * 2);
  const lastY = height - padding - ((lastPoint - min) / range) * (height - padding * 2);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {trend ? <Text style={styles.trend}>{trend}</Text> : null}
      </View>
      <View style={styles.chartWrap}>
        {hasData ? (
          <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
            <Polyline
              points={points}
              fill="none"
              stroke={colors.primary}
              strokeWidth={2.5}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            <Circle cx={lastX} cy={lastY} r={4} fill={colors.primary} />
          </Svg>
        ) : (
          <Text style={styles.emptyChart}>
            {emptyLabel || 'No quiz scores yet.'}
          </Text>
        )}
      </View>
      <Text style={styles.avg}>
        {averageLabel}: <Text style={styles.avgValue}>{averageValue}</Text>
      </Text>
    </View>
  );
}
