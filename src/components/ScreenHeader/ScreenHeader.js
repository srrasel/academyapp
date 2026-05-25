import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { styles } from './ScreenHeader.styles';

export default function ScreenHeader({
  title,
  subtitle,
  onBack,
  showBack = true,
  topIcon,
}) {
  return (
    <View>
      <View style={styles.row}>
        {showBack ? (
          <Pressable onPress={onBack} style={styles.backButton} hitSlop={8}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </Pressable>
        ) : (
          <View style={styles.spacer} />
        )}
        <View style={styles.spacer} />
      </View>
      {topIcon ? <View style={styles.topIconWrap}>{topIcon}</View> : null}
      <View style={styles.centerBlock}>
        {title ? <Text style={styles.title}>{title}</Text> : null}
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
    </View>
  );
}
