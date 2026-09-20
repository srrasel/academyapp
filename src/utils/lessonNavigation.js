import { getUnitDisplayNumber } from '../utils/courseUnits';
import { resolveLessonType } from '../services/lessonMergeService';
import { getMembershipAccess } from '../services/membershipAccess';
import { resolveLessonAudioUrl } from './lessonMedia';
import {
  getContentLessonForQuiz,
  getNextContentLesson,
  getPairedQuiz,
  getTimelineLessons,
  hasPassedQuiz,
  isQuizLesson,
  QUIZ_PASS_PERCENT,
} from './quizPairing';

function hasSupportSheet(lesson) {
  if (!lesson) return false;
  if (lesson.supportSheetUrl || lesson.supportSheet || lesson.pdfUrl) return true;

  const resources = lesson.resources;
  if (Array.isArray(resources) && resources.length > 0) return true;
  if (typeof resources === 'string' && resources.trim()) return true;

  const haystack = `${lesson.htmlContent || ''} ${lesson.content || ''} ${lesson.about || ''}`;
  return /\.pdf(\?|"|'|\s|$)/i.test(haystack);
}

export function resolveLessonScreen(lesson, access = getMembershipAccess()) {
  const type = (lesson?.type || 'text').toLowerCase();
  if (type === 'quiz') return 'Quiz';

  const wantsVideo = Boolean(lesson?.videoUrl) || type === 'video';
  if (wantsVideo && access.hasVideo) return 'LessonVideo';
  if (lesson?.audioUrl || type === 'audio') return 'LessonAudio';
  if (type === 'video' && !access.hasVideo) return 'LessonText';
  if (type === 'text') return 'LessonText';
  return 'LessonText';
}

export function openLesson(navigation, unitId, lesson, { replace = false } = {}) {
  const params = { unitId: String(unitId), lessonId: String(lesson.id) };
  const screen = resolveLessonScreen(lesson);

  if (replace) {
    navigation.replace(screen, params);
    return;
  }
  navigation.navigate(screen, params);
}

export function getNextLesson(lessons, currentLessonId) {
  return getNextContentLesson(lessons, currentLessonId);
}

/**
 * After reading/watching a content lesson:
 * - If it has a paired quiz that is not passed yet → open the quiz (do not mark complete)
 * - Otherwise mark complete and advance to the next content lesson
 */
export async function completeAndGoNext({
  navigation,
  unitId,
  lesson,
  lessons,
  markComplete,
  minutes = 10,
  progress = null,
  skipQuizHandoff = false,
}) {
  if (!lesson) return;

  // Finishing a quiz: mark paired content + quiz, then go to next content lesson.
  if (isQuizLesson(lesson)) {
    const contentLesson = getContentLessonForQuiz(lesson, lessons);
    if (contentLesson) {
      await markComplete({
        unitId,
        lessonId: contentLesson.id,
        minutes,
        silent: true,
      });
    }
    await markComplete({
      unitId,
      lessonId: lesson.id,
      minutes: 0,
      silent: true,
    });

    const nextFrom =
      contentLesson?.id != null ? contentLesson.id : lesson.id;
    const nextLesson = getNextContentLesson(lessons, nextFrom);
    if (nextLesson) {
      openLesson(navigation, unitId, nextLesson, { replace: true });
      return;
    }
    navigation.goBack();
    return;
  }

  const pairedQuiz = getPairedQuiz(lesson, lessons);
  if (pairedQuiz && !skipQuizHandoff) {
    const alreadyPassed = hasPassedQuiz(progress, unitId, pairedQuiz.id);
    if (!alreadyPassed) {
      openLesson(navigation, unitId, pairedQuiz, { replace: true });
      return;
    }
  }

  await markComplete({
    unitId,
    lessonId: lesson.id,
    minutes,
    silent: true,
  });

  const nextLesson = getNextContentLesson(lessons, lesson.id);
  if (nextLesson) {
    openLesson(navigation, unitId, nextLesson, { replace: true });
    return;
  }

  navigation.goBack();
}

export function lessonTypeLabel(type, t, lesson) {
  const value = resolveLessonType(lesson || { type });

  if (t) {
    if (value === 'quiz') return t('lesson.typeQuiz');
    if (value === 'audio') return t('lesson.typeAudio');
    if (value === 'text') return t('lesson.typeText');
    if (value === 'video') return t('lesson.typeVideo');
    return t('lesson.typeText');
  }
  if (value === 'quiz') return 'Quiz';
  if (value === 'audio') return 'Audio';
  if (value === 'text') return 'Text';
  if (value === 'video') return 'Video';
  return 'Text';
}

/** Comma-separated list of available lesson features (Audio, Video, Questions, Support sheet). */
export function formatLessonAvailability(lesson, { hasQuestions = false, t } = {}) {
  const label = (key, fallback) => (t ? t(key) : null) || fallback;
  const parts = [];

  const hasAudio = Boolean(resolveLessonAudioUrl(lesson));
  const hasVideo = Boolean(lesson?.videoUrl?.trim());

  if (hasAudio) parts.push(label('lesson.typeAudio', 'Audio'));
  if (hasVideo) parts.push(label('lesson.typeVideo', 'Video'));
  if (hasQuestions) parts.push(label('lesson.questions', 'Questions'));
  if (hasSupportSheet(lesson)) {
    parts.push(label('lesson.supportSheet', 'Support sheet'));
  }

  if (parts.length) return parts.join(', ');

  return label('lesson.textLesson', 'Text lesson');
}

export function formatLessonSubtitle(t, unitId, lessonId, lessons) {
  const timeline = getTimelineLessons(lessons);
  const index = timeline.findIndex((lesson) => String(lesson.id) === String(lessonId));
  // Quizzes share the parent content lesson position when possible.
  let position = index >= 0 ? index + 1 : 1;
  if (index < 0) {
    const quizLesson = (lessons || []).find((l) => String(l.id) === String(lessonId));
    const content = getContentLessonForQuiz(quizLesson, lessons);
    if (content) {
      const contentIndex = timeline.findIndex((l) => String(l.id) === String(content.id));
      position = contentIndex >= 0 ? contentIndex + 1 : 1;
    }
  }
  return t('lesson.unitChapterOf', {
    unitId: getUnitDisplayNumber(unitId),
    current: position,
    total: timeline.length || lessons.length,
  });
}

export function lessonIcon(type, lesson) {
  const screen = lesson ? resolveLessonScreen(lesson) : '';
  if (screen === 'Quiz') return 'help-circle-outline';
  if (screen === 'LessonAudio') return 'headset-outline';
  if (screen === 'LessonText') return 'document-text-outline';
  if (screen === 'LessonVideo') return 'play-circle-outline';

  const value = (type || 'text').toLowerCase();
  if (value === 'quiz') return 'help-circle-outline';
  if (value === 'audio') return 'headset-outline';
  if (value === 'text') return 'document-text-outline';
  return 'play-circle-outline';
}

export { QUIZ_PASS_PERCENT };
