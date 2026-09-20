import { View, Text } from 'react-native';
import { styles } from './TopicsQuizTable.styles';

export default function TopicsQuizTable({ rows = [] }) {
  if (!rows.length) return null;

  return (
    <View style={styles.wrap}>
      <View style={[styles.row, styles.headerRow]}>
        <View style={[styles.cell, styles.colNo]}>
          <Text style={styles.headerText}>No.</Text>
        </View>
        <View style={[styles.cell, styles.colTopic]}>
          <Text style={styles.headerText}>Topics</Text>
        </View>
        <View style={[styles.cell, styles.colQuiz]}>
          <Text style={styles.headerText}>Quiz</Text>
        </View>
      </View>

      {rows.map((row, index) => (
        <View
          key={`${row.num}-${row.topic}`}
          style={[
            styles.row,
            index % 2 === 1 && styles.dataRowEven,
            index === rows.length - 1 && styles.rowLast,
          ]}
        >
          <View style={[styles.cell, styles.colNo]}>
            <Text style={styles.numText}>{row.num}</Text>
          </View>
          <View style={[styles.cell, styles.colTopic]}>
            <Text style={styles.topicText}>{row.topic}</Text>
          </View>
          <View style={[styles.cell, styles.colQuiz]}>
            <Text style={styles.quizText}>{row.quiz}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}
