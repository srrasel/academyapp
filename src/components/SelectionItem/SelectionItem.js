import { Pressable, View, Text } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { styles } from './SelectionItem.styles';

const GOAL_ICONS = {
  star: 'star-outline',
  people: 'people-outline',
  briefcase: 'briefcase-outline',
  school: 'school-outline',
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
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.item, selected && styles.itemSelected]}
    >
      <View style={styles.leftIcon}>
        {flag ? (
          <Text style={styles.flag}>{flag}</Text>
        ) : GOAL_ICONS_MCI[icon] ? (
          <MaterialCommunityIcons
            name={GOAL_ICONS_MCI[icon]}
            size={22}
            color={colors.primary}
          />
        ) : (
          <Ionicons
            name={GOAL_ICONS[icon] || 'ellipse-outline'}
            size={22}
            color={colors.primary}
          />
        )}
      </View>
      <Text style={styles.label}>{label}</Text>
      {selected && (
        <View style={styles.check}>
          <Ionicons name="checkmark" size={16} color={colors.white} />
        </View>
      )}
    </Pressable>
  );
}
