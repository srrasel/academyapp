import { Pressable, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { styles } from './LanguageListItem.styles';

export default function LanguageListItem({ label, flag, selected, onPress }) {
  return (
    <Pressable
      style={[styles.row, selected && styles.rowSelected]}
      onPress={onPress}
    >
      <View style={[styles.flagWrap, selected && styles.flagWrapSelected]}>
        <Text style={styles.flag}>{flag}</Text>
      </View>
      <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
      {selected ? (
        <View style={styles.check}>
          <Ionicons name="checkmark" size={16} color={colors.white} />
        </View>
      ) : (
        <View style={styles.radio} />
      )}
    </Pressable>
  );
}
