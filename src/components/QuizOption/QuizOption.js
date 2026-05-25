import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { styles } from './QuizOption.styles';

export default function QuizOption({ id, text, selected, onPress }) {
  return (
    <Pressable
      style={[styles.option, selected && styles.optionSelected]}
      onPress={onPress}
    >
      <View style={styles.letter}>
        <Text style={styles.letterText}>{id}</Text>
      </View>
      <Text style={styles.text}>{text}</Text>
      {selected && <Ionicons name="checkmark-circle" size={22} color={colors.success} />}
    </Pressable>
  );
}
