import { View, Text } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { styles } from './JourneyPath.styles';

const MILESTONES = [
  { id: '1', type: 'number', value: '1', label: 'Start Your Journey', align: 'left' },
  { id: 'cert', type: 'trophy', label: 'Get Certified Life Coach', align: 'right', gold: true },
  { id: '20', type: 'number', value: '20', label: 'Complete Main Course', align: 'left' },
  { id: 'adv', type: 'grad', label: 'Advanced Courses', align: 'right' },
];

function MilestoneNode({ item }) {
  const nodeStyle = [styles.node, item.gold ? styles.nodeGold : styles.nodeBlue];

  return (
    <View style={nodeStyle}>
      {item.type === 'number' && <Text style={styles.nodeText}>{item.value}</Text>}
      {item.type === 'trophy' && (
        <MaterialCommunityIcons name="trophy" size={22} color={colors.white} />
      )}
      {item.type === 'grad' && (
        <Ionicons name="school" size={22} color={colors.white} />
      )}
    </View>
  );
}

export default function JourneyPath() {
  return (
    <View style={styles.container}>
      <View style={styles.pathLine} />
      <View style={styles.milestones}>
        {MILESTONES.map((item) => (
          <View
            key={item.id}
            style={[
              styles.milestoneRow,
              item.align === 'right' && styles.milestoneRowRight,
            ]}
          >
            <MilestoneNode item={item} />
            <View style={styles.labelBox}>
              <Text style={styles.label}>{item.label}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
