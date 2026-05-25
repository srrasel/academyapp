import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { styles } from './UnitRow.styles';

function StatusIcon({ status }) {
  if (status === 'completed') {
    return <Ionicons name="checkmark-circle" size={24} color={colors.success} />;
  }
  if (status === 'locked') {
    return <Ionicons name="lock-closed" size={20} color={colors.locked} />;
  }
  if (status === 'in_progress') {
    return <Ionicons name="ellipse-outline" size={24} color={colors.primary} />;
  }
  return <Ionicons name="ellipse-outline" size={24} color={colors.border} />;
}

export default function UnitRow({ unit, onPress }) {
  const isLocked = unit.status === 'locked';

  return (
    <Pressable style={styles.row} onPress={onPress} disabled={isLocked}>
      <View style={[styles.number, isLocked && styles.numberLocked]}>
        <Text style={styles.numberText}>{unit.id}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.title}>{unit.title}</Text>
        <Text style={styles.progress}>
          {unit.completed}/{unit.total}
        </Text>
      </View>
      <View style={styles.status}>
        <StatusIcon status={unit.status} />
      </View>
    </Pressable>
  );
}
