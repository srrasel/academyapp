import { View } from 'react-native';
import { styles } from './ProgressBar.styles';

export default function ProgressBar({ progress, style }) {
  const value = Math.min(100, Math.max(0, progress));

  return (
    <View style={[styles.track, style]}>
      <View style={[styles.fill, { width: `${value}%` }]} />
    </View>
  );
}
