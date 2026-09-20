import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getUnitDisplayNumber, getUnitDisplayTitle } from '../../utils/courseUnits';
import { colors } from '../../theme/colors';
import { styles } from './UnitRow.styles';

function StatusIcon({ status }) {
  if (status === 'completed') {
    return <Ionicons name="checkmark-circle" size={22} color={colors.success} />;
  }
  if (status === 'locked') {
    return <Ionicons name="lock-closed" size={18} color={colors.locked} />;
  }
  if (status === 'in_progress') {
    return <View style={styles.progressDot} />;
  }
  if (status === 'unlocked') {
    return <View style={styles.emptyDot} />;
  }
  return <View style={styles.emptyDot} />;
}

export default function UnitRow({ unit, onPress, showDivider = true, isActive = false }) {
  const isLocked = unit.status === 'locked';
  const isInProgress = unit.status === 'in_progress';
  const isCompleted = unit.status === 'completed';
  const highlight = isActive || isInProgress;

  return (
    <Pressable
      style={[
        styles.row,
        highlight && styles.rowActive,
        showDivider && !highlight && styles.rowDivider,
      ]}
      onPress={onPress}
      disabled={isLocked}
    >
      <View
        style={[
          styles.number,
          isLocked && styles.numberLocked,
          highlight && styles.numberActive,
        ]}
      >
        <Text
          style={[
            styles.numberText,
            isLocked && styles.numberTextLocked,
            highlight && styles.numberTextActive,
          ]}
        >
          {getUnitDisplayNumber(unit)}
        </Text>
      </View>
      <Text
        style={[
          styles.title,
          isLocked && styles.titleLocked,
          highlight && styles.titleActive,
        ]}
        numberOfLines={2}
      >
        {getUnitDisplayTitle(unit)}
      </Text>
      <View style={styles.right}>
        <Text
          style={[
            styles.progress,
            highlight && styles.progressActive,
            isCompleted && styles.progressDone,
            isLocked && styles.progressLocked,
          ]}
        >
          {unit.completed}/{unit.total}
        </Text>
        <StatusIcon status={unit.status} />
      </View>
    </Pressable>
  );
}
