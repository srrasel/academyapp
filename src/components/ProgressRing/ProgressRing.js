import { View, Text } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors } from '../../theme/colors';
import { styles } from './ProgressRing.styles';

const SIZES = { small: 48, medium: 56, large: 64 };

export default function ProgressRing({ percent, size = 'medium', variant = 'light' }) {
  const dim = typeof size === 'number' ? size : SIZES[size] || 56;
  const stroke = 4;
  const radius = (dim - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const value = Math.min(100, Math.max(0, percent));
  const strokeDashoffset = circumference - (value / 100) * circumference;
  const isDark = variant === 'dark';

  const trackColor = isDark ? colors.border : 'rgba(255,255,255,0.3)';
  const progressColor = isDark ? colors.primary : colors.white;

  return (
    <View style={[styles.wrap, { width: dim, height: dim }]}>
      <Svg width={dim} height={dim} style={styles.svg}>
        <Circle
          cx={dim / 2}
          cy={dim / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={stroke}
          fill="none"
        />
        <Circle
          cx={dim / 2}
          cy={dim / 2}
          r={radius}
          stroke={progressColor}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${dim / 2} ${dim / 2})`}
        />
      </Svg>
      <Text style={[styles.percent, isDark && styles.percentDark, dim <= 48 && styles.percentSmall]}>
        {value}%
      </Text>
    </View>
  );
}
