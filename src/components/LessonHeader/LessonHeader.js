import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { styles } from './LessonHeader.styles';

export default function LessonHeader({
  title,
  subtitle,
  onBack,
  bookmarked = false,
  onBookmarkPress,
  variant = 'light',
}) {
  const isDark = variant === 'dark';
  const iconColor = isDark ? colors.white : colors.text;
  const titleColor = isDark ? colors.white : colors.text;
  const subtitleColor = isDark ? '#93C5FD' : colors.textMuted;
  const bookmarkColor = bookmarked ? (isDark ? '#93C5FD' : colors.primary) : iconColor;

  return (
    <View style={styles.row}>
      <Pressable onPress={onBack} style={styles.backBtn} hitSlop={8}>
        <Ionicons name="chevron-back" size={24} color={iconColor} />
      </Pressable>
      <View style={styles.center}>
        <Text style={[styles.title, { color: titleColor }]}>{title}</Text>
        {subtitle ? (
          <Text style={[styles.subtitle, { color: subtitleColor }]}>{subtitle}</Text>
        ) : null}
      </View>
      <Pressable style={styles.bookmarkBtn} onPress={onBookmarkPress} hitSlop={8}>
        <Ionicons
          name={bookmarked ? 'bookmark' : 'bookmark-outline'}
          size={22}
          color={bookmarkColor}
        />
      </Pressable>
    </View>
  );
}
