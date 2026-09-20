import { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, Modal } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import ScreenFooter from '../../components/ScreenFooter/ScreenFooter';
import { Ionicons } from '@expo/vector-icons';
import LessonHeader from '../../components/LessonHeader/LessonHeader';
import QuizOption from '../../components/QuizOption/QuizOption';
import PrimaryButton from '../../components/PrimaryButton/PrimaryButton';
import OutlineButton from '../../components/OutlineButton/OutlineButton';
import AdBanner from '../../components/AdBanner/AdBanner';
import LoadingScreen from '../../components/LoadingScreen/LoadingScreen';
import { useAuth } from '../../context/AuthContext';
import { useCourse } from '../../context/CourseContext';
import { useLesson } from '../../hooks/useLesson';
import { useMarkLessonComplete } from '../../hooks/useMarkLessonComplete';
import { useMembership } from '../../hooks/useMembership';
import { requestUnitAdSlot } from '../../services/adFrequencyService';
import { useLocale } from '../../context/LocaleContext';
import { saveQuizResult } from '../../services/progressService';
import { getProgressUserId } from '../../services/progressEvents';
import { buildQuizQuestionsForLesson } from '../../utils/quizQuestions';
import { completeAndGoNext, formatLessonSubtitle } from '../../utils/lessonNavigation';
import {
  getContentLessonForQuiz,
  QUIZ_PASS_PERCENT,
} from '../../utils/quizPairing';
import { getUnitDisplayNumber } from '../../utils/courseUnits';
import { colors } from '../../theme/colors';
import { styles } from './QuizScreen.styles';

function normalizeAnswers(raw) {
  if (!raw || typeof raw !== 'object') return {};
  const next = {};
  Object.entries(raw).forEach(([key, value]) => {
    next[Number(key)] = value;
  });
  return next;
}

export default function QuizScreen({ navigation, route }) {
  const unitId = route.params?.unitId ?? 2;
  const lessonId = route.params?.lessonId ?? 1;
  const { user } = useAuth();
  const { progress, progressUserId } = useCourse();
  const userId = getProgressUserId(user) || progressUserId;
  const { lesson, lessons, loading } = useLesson(lessonId, unitId);
  const markComplete = useMarkLessonComplete();
  const { features } = useMembership();
  const { t } = useLocale();
  const questions = lesson ? buildQuizQuestionsForLesson(lesson) : [];
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [showAd, setShowAd] = useState(false);
  const [reviewMode, setReviewMode] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const insets = useSafeAreaInsets();

  const contentLesson = useMemo(
    () => getContentLessonForQuiz(lesson, lessons),
    [lesson, lessons]
  );

  const quizKey = useMemo(
    () => `${String(unitId)}_${String(lesson?.id || lessonId)}`,
    [unitId, lesson?.id, lessonId]
  );

  const savedQuiz = progress?.quizScores?.[quizKey] ?? null;

  useEffect(() => {
    if (hydrated || loading || !questions.length) return;

    if (savedQuiz?.answers && Object.keys(savedQuiz.answers).length > 0) {
      const restored = normalizeAnswers(savedQuiz.answers);
      const percent =
        typeof savedQuiz.score === 'number' && typeof savedQuiz.total === 'number'
          ? Math.round((savedQuiz.score / savedQuiz.total) * 100)
          : 0;
      const passed = percent >= QUIZ_PASS_PERCENT;

      setAnswers(restored);
      setSelected(restored[0] ?? null);
      setIndex(0);
      setReviewMode(passed);
      setResult({
        score: savedQuiz.score,
        total: savedQuiz.total,
        percent,
        passed,
        review: true,
        showModal: true,
      });
    }

    setHydrated(true);
  }, [hydrated, loading, questions.length, savedQuiz]);

  const current = questions[index];
  const progressPct = questions.length ? ((index + 1) / questions.length) * 100 : 0;

  if (loading || !hydrated) return <LoadingScreen />;
  if (!questions.length) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <LessonHeader
          title={contentLesson?.title || lesson?.title || 'Questions'}
          onBack={() => navigation.goBack()}
        />
        <View style={styles.content}>
          <Text style={styles.question}>No questions available for this lesson.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const calcScore = (answerMap) =>
    Object.entries(answerMap).reduce((sum, [qIndex, optionId]) => {
      const q = questions[Number(qIndex)];
      const correct = q?.options?.find((o) => o.correct)?.id;
      return sum + (optionId === correct ? 1 : 0);
    }, 0);

  const finishQuizFlow = async () => {
    if (!lesson) {
      navigation.goBack();
      return;
    }

    await completeAndGoNext({
      navigation,
      unitId,
      lesson,
      lessons,
      markComplete,
      minutes: 10,
      progress,
    });
  };

  const startRetry = () => {
    setResult(null);
    setReviewMode(false);
    setAnswers({});
    setSelected(null);
    setIndex(0);
  };

  const startReview = () => {
    setReviewMode(true);
    setIndex(0);
    setSelected(answers[0] ?? null);
    // Keep score/passed for navigation labels, but hide score modals.
    setResult((prev) =>
      prev
        ? { ...prev, review: false, showModal: false }
        : { score: 0, total: questions.length, percent: 0, passed: false, showModal: false }
    );
  };

  const handleResultPrimary = async () => {
    if (!result?.passed) {
      startRetry();
      return;
    }

    setResult((prev) => (prev ? { ...prev, showModal: false, review: false } : null));
    if (features.hasAds && result?.passed) {
      const show = await requestUnitAdSlot(unitId);
      if (show) {
        setShowAd(true);
        return;
      }
    }
    finishQuizFlow();
  };

  const handleNext = async () => {
    if (reviewMode) {
      if (index < questions.length - 1) {
        const nextIndex = index + 1;
        setIndex(nextIndex);
        setSelected(answers[nextIndex] ?? null);
        return;
      }
      if (result?.passed) {
        finishQuizFlow();
        return;
      }
      navigation.goBack();
      return;
    }

    if (!selected) return;

    const nextAnswers = { ...answers, [index]: selected };
    setAnswers(nextAnswers);

    if (index < questions.length - 1) {
      setIndex((value) => value + 1);
      setSelected(nextAnswers[index + 1] ?? null);
      return;
    }

    const finalScore = calcScore(nextAnswers);
    const total = questions.length;
    const percent = Math.round((finalScore / total) * 100);
    const passed = percent >= QUIZ_PASS_PERCENT;

    await saveQuizResult(userId, {
      unitId,
      lessonId: lesson?.id || lessonId,
      score: finalScore,
      total,
      answers: nextAnswers,
      markComplete: passed,
    });

    // Mark the parent content lesson complete when the student passes.
    if (passed && contentLesson) {
      await markComplete({
        unitId,
        lessonId: contentLesson.id,
        minutes: 10,
        silent: true,
      });
    }

    setResult({ score: finalScore, total, percent, passed, showModal: true });
  };

  const handlePrevious = () => {
    if (index <= 0) return;
    const prevIndex = index - 1;
    setIndex(prevIndex);
    setSelected(answers[prevIndex] ?? null);
  };

  const getOptionState = (opt) => {
    if (!reviewMode) {
      return selected === opt.id ? 'selected' : 'default';
    }

    const userAnswer = answers[index];
    const correctId = current?.options?.find((o) => o.correct)?.id;

    if (opt.id === correctId) return 'correct';
    if (opt.id === userAnswer && userAnswer !== correctId) return 'wrong';
    return 'default';
  };

  const headerTitle = contentLesson?.title || lesson?.title || 'Questions';
  const unitDisplayNumber = getUnitDisplayNumber(unitId);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        <LessonHeader
          title={headerTitle}
          subtitle={formatLessonSubtitle(
            t,
            unitId,
            contentLesson?.id || lesson.id,
            lessons
          )}
          onBack={() => navigation.goBack()}
        />

        <Text style={styles.progressLabel}>
          {reviewMode
            ? t('lesson.reviewQuestions') || 'Review'
            : t('lesson.questions') || 'Questions'}{' '}
          {index + 1} of {questions.length}
          {result ? `  •  ${result.score}/${result.total}` : ''}
        </Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.question}>{current?.question}</Text>
          {current.options.map((opt) => (
            <QuizOption
              key={opt.id}
              id={opt.id}
              text={opt.text}
              selected={!reviewMode && selected === opt.id}
              state={getOptionState(opt)}
              disabled={reviewMode}
              onPress={() => {
                if (!reviewMode) setSelected(opt.id);
              }}
            />
          ))}
          {reviewMode ? (
            <View style={styles.explanation}>
              <Ionicons
                name={
                  answers[index] === current?.options?.find((o) => o.correct)?.id
                    ? 'checkmark-circle'
                    : 'close-circle'
                }
                size={18}
                color={
                  answers[index] === current?.options?.find((o) => o.correct)?.id
                    ? colors.success
                    : '#DC2626'
                }
              />
              <Text style={styles.explanationText}>
                {answers[index] === current?.options?.find((o) => o.correct)?.id
                  ? t('lesson.answerCorrect') || 'Your answer was correct.'
                  : t('lesson.answerIncorrect') ||
                    'Correct answer is highlighted in green.'}
              </Text>
            </View>
          ) : null}
        </ScrollView>
      </View>

      <ScreenFooter absolute={false} style={{ paddingBottom: 16 + insets.bottom, gap: 10 }}>
        {reviewMode && index > 0 ? (
          <OutlineButton
            label={t('common.previous') || 'Previous'}
            onPress={handlePrevious}
          />
        ) : null}
        <PrimaryButton
          label={
            reviewMode
              ? index < questions.length - 1
                ? t('lesson.nextQuestion') || 'Next Question'
                : result?.passed
                  ? t('lesson.nextLesson')
                  : t('common.done') || 'Done'
              : index < questions.length - 1
                ? t('lesson.nextQuestion') || 'Next Question'
                : t('lesson.submitAnswers') || 'Submit answers'
          }
          onPress={handleNext}
          disabled={!reviewMode && !selected}
        />
      </ScreenFooter>

      <Modal
        visible={Boolean(result?.showModal) && !result?.review}
        transparent
        animationType="fade"
      >
        <View style={styles.resultOverlay}>
          {result?.passed ? (
            <LinearGradient
              colors={['#FFF7E0', '#E8FFF3', '#EAF0FB', '#FFE8F3']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.successCard}
            >
              <View style={[styles.confettiDot, styles.confettiGold]} />
              <View style={[styles.confettiDot, styles.confettiGreen]} />
              <View style={[styles.confettiDot, styles.confettiPink]} />
              <View style={[styles.confettiDot, styles.confettiBlue]} />
              <View style={styles.successBadge}>
                <Ionicons name="trophy" size={40} color={colors.white} />
              </View>
              <Text style={styles.successTitle}>
                {t('lesson.quizPassedTitle') || 'Congratulations!'}
              </Text>
              <Text style={styles.successMessage}>
                {unitDisplayNumber != null
                  ? t('lesson.quizPassedMessage', { unitId: unitDisplayNumber }) ||
                    `You successfully passed Unit ${unitDisplayNumber}`
                  : t('lesson.questionsComplete') || 'Questions complete'}
              </Text>
              <View style={styles.successScorePill}>
                <Text style={styles.successScoreText}>
                  {t('lesson.quizPassedScore', {
                    score: result?.score,
                    total: result?.total,
                    percent: result?.percent,
                  }) ||
                    `Your score: ${result?.score}/${result?.total} (${result?.percent}%)`}
                </Text>
              </View>
              <PrimaryButton
                label={t('lesson.nextLesson')}
                onPress={handleResultPrimary}
                style={{ marginTop: 18, width: '100%' }}
              />
              <OutlineButton
                label={t('lesson.reviewAnswers') || 'Review answers'}
                onPress={startReview}
                style={{ marginTop: 10, width: '100%' }}
              />
            </LinearGradient>
          ) : (
            <View style={styles.resultCard}>
              <Ionicons name="alert-circle-outline" size={48} color="#DC2626" />
              <Text style={styles.resultTitle}>
                {t('lesson.scoreTooLow') || 'Score too low'}
              </Text>
              <Text style={styles.resultScore}>
                {result?.score}/{result?.total}
              </Text>
              <Text style={[styles.resultScore, { marginTop: 4 }]}>
                {result?.percent}%
                {`  •  ${t('lesson.needPassPercent', { percent: QUIZ_PASS_PERCENT }) || `Need ${QUIZ_PASS_PERCENT}% to continue`}`}
              </Text>
              <PrimaryButton
                label={t('lesson.tryAgain') || 'Try again'}
                onPress={handleResultPrimary}
                style={{ marginTop: 16, width: '100%' }}
              />
            </View>
          )}
        </View>
      </Modal>

      <Modal
        visible={Boolean(result?.review) && Boolean(result?.showModal !== false)}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setResult((prev) => (prev ? { ...prev, review: false, showModal: false } : null))
        }
      >
        <View style={styles.resultOverlay}>
          <View style={styles.resultCard}>
            <Ionicons
              name={result?.passed ? 'document-text-outline' : 'alert-circle-outline'}
              size={48}
              color={result?.passed ? colors.primary : '#DC2626'}
            />
            <Text style={styles.resultTitle}>
              {t('lesson.previousScore') || 'Your score'}
            </Text>
            <Text style={styles.resultScore}>
              {result?.score}/{result?.total} ({result?.percent}%)
            </Text>
            {result?.passed ? (
              <>
                <PrimaryButton
                  label={t('lesson.reviewAnswers') || 'Review answers'}
                  onPress={startReview}
                  style={{ marginTop: 16, width: '100%' }}
                />
                <OutlineButton
                  label={t('lesson.nextLesson')}
                  onPress={handleResultPrimary}
                  style={{ marginTop: 10, width: '100%' }}
                />
              </>
            ) : (
              <PrimaryButton
                label={t('lesson.tryAgain') || 'Try again'}
                onPress={startRetry}
                style={{ marginTop: 16, width: '100%' }}
              />
            )}
          </View>
        </View>
      </Modal>

      <Modal visible={showAd} transparent animationType="slide">
        <View style={styles.resultOverlay}>
          <View style={[styles.resultCard, { width: '92%' }]}>
            <AdBanner
              onContinue={() => {
                setShowAd(false);
                finishQuizFlow();
              }}
              onNavigate={(screen) => {
                setShowAd(false);
                navigation.navigate(screen);
              }}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
