import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTabBarPadding } from '../../hooks/useTabBarPadding';
import { styles } from './PlaceholderScreen.styles';

export default function PlaceholderScreen({ route }) {
  const title = route.params?.title ?? 'Coming Soon';
  const bottomPad = useTabBarPadding(0);

  return (
    <SafeAreaView style={[styles.container, { paddingBottom: bottomPad }]} edges={['top']}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.text}>This section will be available in a future update.</Text>
    </SafeAreaView>
  );
}
