import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { styles } from './ActionRow.styles';

const ACTIONS = [
  { icon: 'download-outline', label: 'Download' },
  { icon: 'create-outline', label: 'Add Note' },
  { icon: 'share-outline', label: 'Share' },
  { icon: 'ellipsis-horizontal', label: 'More' },
];

export default function ActionRow() {
  return (
    <View style={styles.row}>
      {ACTIONS.map((action) => (
        <Pressable key={action.label} style={styles.item}>
          <Ionicons name={action.icon} size={22} color={colors.primary} />
          <Text style={styles.label}>{action.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}
