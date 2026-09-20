import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { styles } from './ActionRow.styles';

const ACTIONS = [
  { key: 'download', icon: 'download-outline', label: 'Download' },
  { key: 'note', icon: 'create-outline', label: 'Add Note' },
  { key: 'share', icon: 'share-outline', label: 'Share' },
  { key: 'more', icon: 'ellipsis-horizontal', label: 'More' },
];

export default function ActionRow({ onAction, style }) {
  return (
    <View style={[styles.row, style]}>
      {ACTIONS.map((action) => (
        <Pressable
          key={action.key}
          style={styles.item}
          onPress={() => onAction?.(action.key)}
        >
          <Ionicons name={action.icon} size={22} color={colors.primary} />
          <Text style={styles.label}>{action.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}
