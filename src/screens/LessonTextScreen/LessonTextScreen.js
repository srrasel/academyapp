import { useState } from 'react';
import { ScrollView, View, Text, Alert, Modal } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import LessonHeader from '../../components/LessonHeader/LessonHeader';
import LessonHtmlContent from '../../components/LessonHtmlContent/LessonHtmlContent';
import PrimaryButton from '../../components/PrimaryButton/PrimaryButton';
import VideoPlayer from '../../components/VideoPlayer/VideoPlayer';
import LoadingScreen from '../../components/LoadingScreen/LoadingScreen';
import AdBanner from '../../components/AdBanner/AdBanner';
import { useLesson } from '../../hooks/useLesson';
import { useLessonExtras } from '../../hooks/useLessonExtras';
import { useMarkLessonComplete } from '../../hooks/useMarkLessonComplete';
import { useMembership } from '../../hooks/useMembership';
import { requestUnitAdSlot } from '../../services/adFrequencyService';
import { useLocale } from '../../context/LocaleContext';
import { useCourse } from '../../context/CourseContext';
import { formatLessonSubtitle, completeAndGoNext } from '../../utils/lessonNavigation';
import { getPairedQuiz } from '../../utils/quizPairing';
import { styles } from './LessonTextScreen.styles';

function getLessonBody(lesson) {
  return lesson.content || lesson.body || lesson.description || lesson.about || '';
}

function getLessonHtml(lesson) {
  return lesson.htmlContent || lesson.html || '';
}

function renderKeyPoint(point) {
  const match = point.match(/^([^:?]+[?:])\s*(.*)$/s);
  if (!match) {
    return <Text style={styles.bullet}>• {point}</Text>;
  }

  return (
    <Text style={styles.bullet}>
      • <Text style={styles.highlightLabel}>{match[1].trim()}</Text>
      {match[2] ? ` ${match[2]}` : ''}
    </Text>
  );
}

export default function LessonTextScreen({ navigation, route }) {
  const unitId = route.params?.unitId ?? 2;
  const lessonId = route.params?.lessonId ?? 1;
  const { lesson, lessons, loading } = useLesson(lessonId, unitId);
  const { progress } = useCourse();
  const { t } = useLocale();
  const activeLessonId = lesson?.id ?? lessonId;
  const { bookmarked, toggleBookmarkState } = useLessonExtras(unitId, activeLessonId);
  const markComplete = useMarkLessonComplete();
  const { features } = useMembership();
  const insets = useSafeAreaInsets();
  const pairedQuiz = lesson ? getPairedQuiz(lesson, lessons) : null;
  const [showAd, setShowAd] = useState(false);

  const goNext = () =>
    completeAndGoNext({
      navigation,
      unitId,
      lesson,
      lessons,
      markComplete,
      minutes: 10,
      progress,
    });

  const handleContinue = async () => {
    if (features.hasAds) {
      const show = await requestUnitAdSlot(unitId);
      if (show) {
        setShowAd(true);
        return;
      }
    }
    goNext();
  };

  if (loading) return <LoadingScreen />;

  if (!lesson) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <LessonHeader title={t('lesson.textLesson')} onBack={() => navigation.goBack()} />
        <View style={styles.contentInner}>
          <Text style={styles.about}>{t('lesson.contentFallback', { title: lessonId })}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const body = getLessonBody(lesson);
  const html = getLessonHtml(lesson);
  const keyPoints = lesson.keyPoints?.filter(Boolean) ?? [];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <LessonHeader
        title={lesson.title}
        subtitle={formatLessonSubtitle(t, unitId, lesson.id, lessons)}
        onBack={() => navigation.goBack()}
        bookmarked={bookmarked}
        onBookmarkPress={async () => {
          const next = await toggleBookmarkState();
          Alert.alert(
            next ? t('lesson.bookmarkAdded') : t('lesson.bookmarkRemoved')
          );
        }}
      />

      <ScrollView style={styles.content} contentContainerStyle={styles.contentInner}>
        {lesson.videoUrl && features.hasVideo ? (
          <View style={styles.videoWrap}>
            <VideoPlayer videoUrl={lesson.videoUrl} posterUrl={lesson.thumbnailUrl} />
          </View>
        ) : null}

        {!features.hasVideo && lesson.videoUrl ? (
          <View style={styles.audioOnlyBanner}>
            <Text style={styles.audioOnlyText}>{t('membership.audioOnlyNotice')}</Text>
          </View>
        ) : null}

        <Text style={styles.lessonTitle}>{lesson.title}</Text>
        <Text style={styles.lessonMeta}>
          {lesson.meta || lesson.duration || t('lesson.textLesson')}
        </Text>
        <LessonHtmlContent
          html={html}
          text={body || t('lesson.contentFallback', { title: lesson.title })}
          textStyle={styles.about}
        />
        {keyPoints.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Key Points</Text>
            {keyPoints.map((point) => (
              <View key={point}>{renderKeyPoint(point)}</View>
            ))}
          </>
        )}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        <PrimaryButton
          label={
            pairedQuiz
              ? t('lesson.continueToQuestions') || 'Continue to Questions'
              : t('lesson.nextLesson')
          }
          onPress={handleContinue}
          style={{ flex: 1 }}
        />
      </View>

      <Modal visible={showAd} transparent animationType="slide">
        <View style={styles.adOverlay}>
          <View style={styles.adCard}>
            <AdBanner
              onContinue={() => {
                setShowAd(false);
                goNext();
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
