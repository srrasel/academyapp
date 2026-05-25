import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { styles } from './SubunitRow.styles';

export default function SubunitRow({ subunit, isLast, onPress }) {
  const done = subunit.status === 'completed';

  return (
    <Pressable style={styles.row} onPress={onPress}>
      <View style={styles.timeline}>
        {!isLast && <View style={styles.line} />}
        <Ionicons
          name={done ? 'checkmark-circle' : 'ellipse-outline'}
          size={24}
          color={done ? colors.success : colors.border}
        />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{subunit.title}</Text>
        <Text style={styles.meta}>
          {subunit.type} • {subunit.duration}
        </Text>
      </View>
    </Pressable>
  );
}
