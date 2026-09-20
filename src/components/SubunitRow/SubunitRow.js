import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { styles } from './SubunitRow.styles';

function TimelineDot({ timelineStatus, index }) {
  if (timelineStatus === 'completed') {
    return (
      <View style={styles.dotCompleted}>
        <Ionicons name="checkmark" size={14} color={colors.white} />
      </View>
    );
  }
  if (timelineStatus === 'current') {
    return (
      <View style={styles.dotCurrent}>
        <Text style={styles.dotCurrentText}>{index + 1}</Text>
      </View>
    );
  }
  return <View style={styles.dotPending} />;
}

export default function SubunitRow({ subunit, index = 0, isLast, onPress }) {
  const timelineStatus = subunit.timelineStatus || subunit.status;

  return (
    <Pressable style={styles.row} onPress={onPress}>
      <View style={styles.timeline}>
        {!isLast && <View style={styles.line} />}
        <TimelineDot timelineStatus={timelineStatus} index={index} />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{subunit.title}</Text>
        <Text style={styles.meta}>
          {subunit.meta ||
            [subunit.type, subunit.duration].filter(Boolean).join(' • ')}
        </Text>
      </View>
    </Pressable>
  );
}
