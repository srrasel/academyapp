import { View, Text, Pressable } from 'react-native';
import { styles } from './QuizOption.styles';

export default function QuizOption({
  id,
  text,
  selected,
  onPress,
  disabled = false,
  state = 'default', // default | selected | correct | wrong
}) {
  const isCorrect = state === 'correct';
  const isWrong = state === 'wrong';
  const isSelected = selected || state === 'selected';

  return (
    <Pressable
      style={[
        styles.option,
        isSelected && styles.optionSelected,
        isCorrect && styles.optionCorrect,
        isWrong && styles.optionWrong,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <View
        style={[
          styles.letter,
          isSelected && styles.letterSelected,
          isCorrect && styles.letterCorrect,
          isWrong && styles.letterWrong,
        ]}
      >
        <Text
          style={[
            styles.letterText,
            (isSelected || isCorrect || isWrong) && styles.letterTextSelected,
          ]}
        >
          {id}
        </Text>
      </View>
      <Text style={styles.text}>{text}</Text>
    </Pressable>
  );
}
