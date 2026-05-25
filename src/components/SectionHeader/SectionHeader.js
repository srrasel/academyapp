import { View, Text, Pressable } from 'react-native';
import { styles } from './SectionHeader.styles';

export default function SectionHeader({ title, linkLabel, onLinkPress }) {
  return (
    <View style={styles.row}>
      <Text style={styles.title}>{title}</Text>
      {linkLabel ? (
        <Pressable onPress={onLinkPress}>
          <Text style={styles.link}>{linkLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
