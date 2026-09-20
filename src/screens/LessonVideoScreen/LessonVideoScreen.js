import { useState, useCallback, useRef, useEffect } from 'react';
import {
  ScrollView,
  View,
  Text,
  TextInput,
  Alert,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import LessonHeader from '../../components/LessonHeader/LessonHeader';
import VideoPlayer from '../../components/VideoPlayer/VideoPlayer';
import LessonAudioControls from '../../components/LessonAudioControls/LessonAudioControls';
import LessonHtmlContent from '../../components/LessonHtmlContent/LessonHtmlContent';
import ContentTabs from '../../components/ContentTabs/ContentTabs';
import ActionRow from '../../components/ActionRow/ActionRow';
import PrimaryButton from '../../components/PrimaryButton/PrimaryButton';
import LoadingScreen from '../../components/LoadingScreen/LoadingScreen';
import NoteEditorModal from '../../components/NoteEditorModal/NoteEditorModal';
import { useLesson } from '../../hooks/useLesson';
import { useLessonExtras } from '../../hooks/useLessonExtras';
import { useMarkLessonComplete } from '../../hooks/useMarkLessonComplete';
import { useMembership } from '../../hooks/useMembership';
import { handleLessonAction } from '../../utils/lessonActions';
import { formatLessonSubtitle, completeAndGoNext } from '../../utils/lessonNavigation';
import { getPairedQuiz } from '../../utils/quizPairing';
import { useLocale } from '../../context/LocaleContext';
import { useCourse } from '../../context/CourseContext';
import { openResource } from '../../utils/resourceActions';
import { colors } from '../../theme/colors';
import { styles } from './LessonVideoScreen.styles';

const TABS = ['Overview', 'Notes', 'Resources'];

export default function LessonVideoScreen({ navigation, route }) {
  const { t } = useLocale();
  const { progress } = useCourse();
  const unitId = route.params?.unitId ?? 2;
  const lessonId = route.params?.lessonId ?? 1;
  const { lesson, lessons, loading } = useLesson(lessonId, unitId);
  const activeLessonId = lesson?.id ?? lessonId;
  const { note, updateNote, publishNote, bookmarked, toggleBookmarkState, saved } =
    useLessonExtras(unitId, activeLessonId);
  const markComplete = useMarkLessonComplete();
  const { features } = useMembership();
  const [activeTab, setActiveTab] = useState('Overview');
  const [noteModal, setNoteModal] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const noteRef = useRef(null);
  const scrollRef = useRef(null);
  const insets = useSafeAreaInsets();
  const pairedQuiz = lesson ? getPairedQuiz(lesson, lessons) : null;

  useEffect(() => {
    if (!loading && lesson && !features.hasVideo) {
      navigation.replace('LessonText', { unitId, lessonId });
    }
  }, [loading, lesson, features.hasVideo, navigation, unitId, lessonId]);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSub = Keyboard.addListener(showEvent, (event) => {
      setKeyboardHeight(event.endCoordinates?.height || 0);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => setKeyboardHeight(0));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const handleComplete = useCallback(
    async (silent = false) => {
      if (!lesson) return;
      await markComplete({ unitId, lessonId: lesson.id, minutes: 18, silent });
    },
    [lesson, markComplete, unitId]
  );

  useEffect(() => {
    setActiveTab('Overview');
  }, [activeLessonId]);

  if (loading || !lesson) {
    return <LoadingScreen />;
  }

  const keyPoints = lesson.keyPoints?.length
    ? lesson.keyPoints
    : ['Understand the lesson objectives', 'Apply concepts in practice'];
  const resources = lesson.resources || ['Lesson summary', 'Practice worksheet'];

  const scrollNoteIntoView = () => {
    setTimeout(() => {
      scrollRef.current?.scrollToEnd?.({ animated: true });
    }, 150);
  };

  const onAction = (key) => {
    handleLessonAction(key, {
      lesson,
      onAddNote: () => setNoteModal(true),
      onDownload: () =>
        Alert.alert('Download', 'Use Share to send the video link to yourself.', [
          {
            text: 'Share link',
            onPress: () => handleLessonAction('share', { lesson }),
          },
          { text: 'OK' },
        ]),
      onBookmark: async () => {
        const next = await toggleBookmarkState();
        Alert.alert(next ? 'Bookmarked' : 'Bookmark removed');
      },
    });
  };

  const saveNote = async () => {
    const ok = await publishNote();
    if (ok) {
      Alert.alert('Note saved', 'Your note has been saved for this lesson.');
      setNoteModal(false);
    }
  };

  const bottomPad = 112 + insets.bottom + (activeTab === 'Notes' ? keyboardHeight : 0);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
        <LessonHeader
          title={lesson.title}
          subtitle={formatLessonSubtitle(t, unitId, lesson.id, lessons)}
          onBack={() => navigation.goBack()}
          bookmarked={bookmarked}
          onBookmarkPress={async () => {
            const next = await toggleBookmarkState();
            Alert.alert(next ? 'Bookmarked' : 'Bookmark removed');
          }}
        />

        <ScrollView
          ref={scrollRef}
          style={styles.scroll}
          contentContainerStyle={[styles.content, { paddingBottom: bottomPad }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <VideoPlayer
            videoUrl={lesson.videoUrl}
            posterUrl={lesson.thumbnailUrl}
            onComplete={() => handleComplete(true)}
          />
          <ContentTabs tabs={TABS} active={activeTab} onChange={setActiveTab} />

          {activeTab === 'Overview' ? (
            <>
              {lesson.audioUrl ? (
                <LessonAudioControls audioUrl={lesson.audioUrl} compact />
              ) : null}
              <Text style={styles.sectionTitle}>About this lesson</Text>
              <LessonHtmlContent
                html={lesson.htmlContent || lesson.html}
                text={lesson.content || lesson.about || `Learn about ${lesson.title}.`}
                textStyle={styles.about}
              />
              <Text style={styles.sectionTitle}>Key Points</Text>
              <View style={styles.keyPoints}>
                {keyPoints.map((point) => (
                  <View key={point} style={styles.point}>
                    <Ionicons name="checkmark-circle" size={18} color={colors.success} />
                    <Text style={styles.pointText}>{point}</Text>
                  </View>
                ))}
              </View>
            </>
          ) : activeTab === 'Notes' ? (
            <>
              <Text style={styles.sectionTitle}>Your Notes</Text>
              <TextInput
                ref={noteRef}
                style={styles.noteInput}
                multiline
                placeholder="Write your notes here..."
                placeholderTextColor={colors.textMuted}
                value={note}
                onChangeText={updateNote}
                onFocus={scrollNoteIntoView}
              />
              <PrimaryButton label={saved ? 'Saved ✓' : 'Save Note'} onPress={saveNote} />
              <PrimaryButton
                label="Open full note editor"
                onPress={() => setNoteModal(true)}
                style={{ marginTop: 10 }}
              />
            </>
          ) : (
            <View style={styles.resourcesCard}>
              {resources.map((item) => (
                <Pressable
                  key={item}
                  style={styles.resourceRow}
                  onPress={() => openResource(item, lesson)}
                >
                  <Ionicons name="document-text-outline" size={20} color={colors.primary} />
                  <Text style={styles.pointText}>{item}</Text>
                  <Ionicons name="open-outline" size={18} color={colors.textMuted} />
                </Pressable>
              ))}
            </View>
          )}
        </ScrollView>

        <View style={[styles.bottomBar, { paddingBottom: insets.bottom }]}>
          <View style={styles.footer}>
            <PrimaryButton
              label={
                pairedQuiz
                  ? t('lesson.continueToQuestions') || 'Continue to Questions'
                  : t('lesson.nextLesson')
              }
              onPress={() =>
                completeAndGoNext({
                  navigation,
                  unitId,
                  lesson,
                  lessons,
                  markComplete,
                  minutes: 18,
                  progress,
                })
              }
            />
          </View>
          <ActionRow onAction={onAction} style={styles.actionRow} />
        </View>
      </KeyboardAvoidingView>

      <NoteEditorModal
        visible={noteModal}
        value={note}
        onChangeText={updateNote}
        onSave={saveNote}
        onClose={() => setNoteModal(false)}
        savingLabel={saved ? 'Saved ✓' : 'Save Note'}
      />
    </SafeAreaView>
  );
}
