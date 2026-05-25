import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { styles } from './AppHeader.styles';

export default function AppHeader({ variant = 'home', title, onBack }) {
  if (variant === 'back') {
    return (
      <View style={styles.row}>
        <Pressable onPress={onBack} style={styles.iconBtn} hitSlop={8}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </Pressable>
        <View style={styles.center} />
        <View style={styles.right} />
      </View>
    );
  }

  if (variant === 'title') {
    return (
      <View style={styles.row}>
        <View style={styles.iconBtn} />
        <Text style={styles.title}>{title}</Text>
        <Pressable style={styles.iconBtn}>
          <Ionicons name="search-outline" size={22} color={colors.text} />
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.row}>
      <Pressable style={styles.iconBtn}>
        <Ionicons name="menu" size={24} color={colors.text} />
      </Pressable>
      <View style={styles.center}>
        <Text style={styles.logoText}>BRIDGE ACADEMY</Text>
      </View>
      <Pressable style={styles.iconBtn}>
        <Ionicons name="notifications-outline" size={22} color={colors.text} />
      </Pressable>
    </View>
  );
}
