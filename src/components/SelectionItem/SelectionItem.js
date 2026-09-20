import { Pressable, View, Text } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { styles } from './SelectionItem.styles';

const GOAL_ICONS = {
  star: 'star-outline',
  people: 'people-outline',
  briefcase: 'briefcase-outline',
  school: 'school-outline',
  happy: 'happy-outline',
  book: 'book-outline',
};

const GOAL_ICONS_MCI = {
  brain: 'brain',
};

export default function SelectionItem({
  label,
  selected,
  onPress,
  flag,
  icon,
  iconColor,
  iconBg,
  showChevron = false,
  tone = 'default',
}) {
  const isWarm = tone === 'warm';
  const resolvedIconColor = iconColor || (isWarm ? colors.accentWarmDark : colors.primary);

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.item,
        isWarm && styles.itemWarm,
        selected && (isWarm ? styles.itemWarmSelected : styles.itemSelected),
      ]}
    >
      <View
        style={[
          styles.leftIcon,
          isWarm && styles.leftIconWarm,
          iconBg ? { backgroundColor: iconBg } : null,
        ]}
      >
        {flag ? (
          <Text style={styles.flag}>{flag}</Text>
        ) : GOAL_ICONS_MCI[icon] ? (
          <MaterialCommunityIcons
            name={GOAL_ICONS_MCI[icon]}
            size={22}
            color={resolvedIconColor}
          />
        ) : (
          <Ionicons
            name={GOAL_ICONS[icon] || 'ellipse-outline'}
            size={22}
            color={resolvedIconColor}
          />
        )}
      </View>
      <Text style={styles.label}>{label}</Text>
      {selected ? (
        <View style={[styles.check, isWarm && styles.checkWarm]}>
          <Ionicons name="checkmark" size={16} color={colors.white} />
        </View>
      ) : showChevron ? (
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      ) : null}
    </Pressable>
  );
}
