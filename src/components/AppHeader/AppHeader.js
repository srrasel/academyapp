import { View, Text, Pressable, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { styles } from './AppHeader.styles';

const logoImage = require('../../../assets/logo.png');

export default function AppHeader({
  variant = 'home',
  title,
  onBack,
  onMenuPress,
  onNotificationsPress,
  onSearchPress,
}) {
  if (variant === 'back') {
    return (
      <View style={styles.backRow}>
        <Pressable onPress={onBack} style={styles.iconBtn} hitSlop={8}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </Pressable>
        <View style={styles.center} />
        <View style={styles.right} />
      </View>
    );
  }

  if (variant === 'backTitle') {
    return (
      <View style={styles.backRow}>
        <Pressable onPress={onBack} style={styles.iconBtn} hitSlop={8}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.backTitle} numberOfLines={1}>
          {title}
        </Text>
        <View style={styles.right} />
      </View>
    );
  }

  if (variant === 'title') {
    return (
      <View style={styles.backRow}>
        <Text style={styles.screenTitle}>{title}</Text>
        <Pressable
          style={styles.iconBtn}
          onPress={onSearchPress || onNotificationsPress}
          hitSlop={8}
        >
          <Ionicons name="search-outline" size={22} color={colors.text} />
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.row}>
      <Pressable style={styles.iconBtn} onPress={onMenuPress} hitSlop={8}>
        <Ionicons name="menu" size={24} color={colors.text} />
      </Pressable>
      <View style={styles.center}>
        <Image source={logoImage} style={styles.headerLogo} resizeMode="contain" />
      </View>
      <Pressable style={styles.iconBtn} onPress={onNotificationsPress} hitSlop={8}>
        <Ionicons name="notifications-outline" size={22} color={colors.text} />
      </Pressable>
    </View>
  );
}
