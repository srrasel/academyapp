import { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import ScreenFooter from '../../components/ScreenFooter/ScreenFooter';
import { Ionicons } from '@expo/vector-icons';
import LessonHeader from '../../components/LessonHeader/LessonHeader';
import QuizOption from '../../components/QuizOption/QuizOption';
import PrimaryButton from '../../components/PrimaryButton/PrimaryButton';
import { quizData } from '../../data/lessons';
import { styles } from './QuizScreen.styles';

export default function QuizScreen({ navigation }) {
  const [selected, setSelected] = useState(quizData.selectedId);
  const quiz = quizData;
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        <LessonHeader
          title={quiz.title}
          subtitle={quiz.subtitle}
          onBack={() => navigation.goBack()}
        />
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${quiz.progress}%` }]} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.question}>{quiz.question}</Text>
          {quiz.options.map((opt) => (
            <QuizOption
              key={opt.id}
              id={opt.id}
              text={opt.text}
              selected={selected === opt.id}
              onPress={() => setSelected(opt.id)}
            />
          ))}
          <View style={styles.explanation}>
            <Ionicons name="bulb-outline" size={22} color="#0056D2" />
            <Text style={styles.explanationText}>{quiz.explanation}</Text>
          </View>
        </ScrollView>
      </View>

      <ScreenFooter absolute={false} style={{ paddingBottom: 16 + insets.bottom }}>
        <PrimaryButton label="Next Question" onPress={() => navigation.goBack()} />
      </ScreenFooter>
    </SafeAreaView>
  );
}
