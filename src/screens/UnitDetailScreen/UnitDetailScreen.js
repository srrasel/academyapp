import { ScrollView, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenFooter from '../../components/ScreenFooter/ScreenFooter';
import AppHeader from '../../components/AppHeader/AppHeader';
import ProgressBar from '../../components/ProgressBar/ProgressBar';
import ProgressRing from '../../components/ProgressRing/ProgressRing';
import SubunitRow from '../../components/SubunitRow/SubunitRow';
import PrimaryButton from '../../components/PrimaryButton/PrimaryButton';
import { useCourse } from '../../context/CourseContext';
import { useLocale } from '../../context/LocaleContext';
import { useUnitLessons } from '../../hooks/useLesson';
import { getUnitDisplayNumber, getUnitDisplayTitle } from '../../utils/courseUnits';
import { openLesson, formatLessonAvailability } from '../../utils/lessonNavigation';
import {
  getPairedQuiz,
  getQuizScoreEntry,
  getTimelineLessons,
  isContentLessonComplete,
  formatScoreLabel,
} from '../../utils/quizPairing';
import { styles } from './UnitDetailScreen.styles';

function buildTimelineStatus(subunits) {
  const firstPending = subunits.findIndex((s) => s.status !== 'completed');
  return subunits.map((sub, index) => ({
    ...sub,
    timelineStatus:
      sub.status === 'completed'
        ? 'completed'
        : index === firstPending
          ? 'current'
          : 'pending',
  }));
}

export default function UnitDetailScreen({ navigation, route }) {
  const unitId = route.params?.unitId ?? 2;
  const { units, progress } = useCourse();
  const { t } = useLocale();
  const { lessons, loading } = useUnitLessons(unitId);
  const unit = units.find((u) => String(u.id) === String(unitId)) || units[0];
  const timelineLessons = getTimelineLessons(lessons);
  const subunits = buildTimelineStatus(
    timelineLessons.map((lesson) => {
      const pairedQuiz = getPairedQuiz(lesson, lessons);
      const quizScore = pairedQuiz
        ? getQuizScoreEntry(progress, unitId, pairedQuiz.id)
        : null;
      const scoreLabel = quizScore
        ? formatScoreLabel(quizScore.score, quizScore.total)
        : null;
      const features = formatLessonAvailability(lesson, {
        hasQuestions: Boolean(pairedQuiz),
        t,
      });
      return {
        id: lesson.id,
        title: lesson.title,
        meta: scoreLabel ? `${features} • Score ${scoreLabel}` : features,
        status: isContentLessonComplete(lesson, lessons, progress, unitId)
          ? 'completed'
          : 'pending',
      };
    })
  );
  const percent = Math.round((unit.completed / unit.total) * 100);
  const nextSubunit = subunits.find((s) => s.timelineStatus === 'current') || subunits[0];

  return (
    <SafeAreaView style={styles.scroll} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <AppHeader variant="back" onBack={() => navigation.goBack()} />
        <Text style={styles.unitLabel}>
          {t('course.unitLabel', { id: getUnitDisplayNumber(unit) })}
        </Text>
        <Text style={styles.title}>{getUnitDisplayTitle(unit)}</Text>

        <View style={styles.progressRow}>
          <View style={styles.progressMeta}>
            <Text style={styles.progressLabel}>
              {unit.completed}/{unit.total}
            </Text>
            <ProgressBar progress={percent} />
          </View>
          <ProgressRing percent={percent} size="small" variant="dark" />
        </View>

        <View style={styles.timelineCard}>
          {!loading &&
            subunits.map((sub, index) => (
              <SubunitRow
                key={sub.id}
                subunit={sub}
                index={index}
                isLast={index === subunits.length - 1}
                onPress={() => {
                  const fullLesson = lessons.find((l) => String(l.id) === String(sub.id));
                  if (fullLesson) openLesson(navigation, unitId, fullLesson);
                }}
              />
            ))}
        </View>

        <Text style={styles.sectionTitle}>About this Unit</Text>
        <Text style={styles.about}>
          {unit.description ||
            'Learn core coaching concepts through structured lessons, practical exercises, and assessments.'}
        </Text>
      </ScrollView>

      {nextSubunit ? (
        <ScreenFooter absolute={false}>
          <PrimaryButton
            label={t('unit.continueNext')}
            onPress={() => {
              const fullLesson = lessons.find((l) => String(l.id) === String(nextSubunit.id));
              if (fullLesson) openLesson(navigation, unitId, fullLesson);
            }}
          />
        </ScreenFooter>
      ) : null}
    </SafeAreaView>
  );
}
