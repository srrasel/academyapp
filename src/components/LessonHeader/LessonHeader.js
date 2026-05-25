import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { styles } from './LessonHeader.styles';

export default function LessonHeader({ title, subtitle, onBack }) {
  return (
    <View style={styles.row}>
      <Pressable onPress={onBack} style={styles.backBtn} hitSlop={8}>
        <Ionicons name="chevron-back" size={24} color={colors.text} />
      </Pressable>
      <View style={styles.center}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      <Pressable style={styles.bookmarkBtn}>
        <Ionicons name="bookmark-outline" size={22} color={colors.text} />
      </Pressable>
    </View>
  );
}
