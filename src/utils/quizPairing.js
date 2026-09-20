import { resolveLessonType } from '../services/lessonMergeService';

/** Minimum score percent required to unlock the next lesson. */
export const QUIZ_PASS_PERCENT = 60;

function normalizeTitle(title) {
  return String(title || '')
    .trim()
    .toLowerCase()
    .replace(/[’']/g, "'")
    .replace(/[–—]/g, '-')
    .replace(/\s+/g, ' ');
}

export function isQuizLesson(lesson) {
  if (!lesson) return false;
  return resolveLessonType(lesson) === 'quiz' || String(lesson.type || '').toLowerCase() === 'quiz';
}

/**
 * Find the quiz that belongs to a content lesson (same title, next in order).
 */
export function getPairedQuiz(contentLesson, lessons) {
  if (!contentLesson || isQuizLesson(contentLesson)) return null;

  const list = Array.isArray(lessons) ? lessons : [];
  const index = list.findIndex((item) => String(item.id) === String(contentLesson.id));
  if (index < 0 || index >= list.length - 1) return null;

  const next = list[index + 1];
  if (!isQuizLesson(next)) return null;

  const contentTitle = normalizeTitle(contentLesson.title);
  const quizTitle = normalizeTitle(next.title);
  if (contentTitle && quizTitle && contentTitle === quizTitle) {
    return next;
  }

  // Fallback: consecutive quiz after content is treated as belonging to it.
  return next;
}

/**
 * Find the content lesson a quiz belongs to.
 */
export function getContentLessonForQuiz(quizLesson, lessons) {
  if (!isQuizLesson(quizLesson)) return null;

  const list = Array.isArray(lessons) ? lessons : [];
  const index = list.findIndex((item) => String(item.id) === String(quizLesson.id));
  if (index <= 0) return null;

  const prev = list[index - 1];
  if (isQuizLesson(prev)) return null;

  const contentTitle = normalizeTitle(prev.title);
  const quizTitle = normalizeTitle(quizLesson.title);
  if (contentTitle && quizTitle && contentTitle !== quizTitle) {
    // Still pair by position when titles nearly match / orphan cases.
  }
  return prev;
}

/** Lessons shown on the unit path (quizzes are merged into the previous content lesson). */
export function getTimelineLessons(lessons) {
  return (lessons || []).filter((lesson) => !isQuizLesson(lesson));
}

export function getNextContentLesson(lessons, currentLessonId) {
  const timeline = getTimelineLessons(lessons);
  const index = timeline.findIndex((item) => String(item.id) === String(currentLessonId));
  if (index < 0 || index >= timeline.length - 1) return null;
  return timeline[index + 1];
}

export function getQuizScoreEntry(progress, unitId, quizLessonId) {
  if (!progress?.quizScores || quizLessonId == null) return null;
  return progress.quizScores[`${String(unitId)}_${String(quizLessonId)}`] ?? null;
}

export function hasPassedQuiz(progress, unitId, quizLessonId) {
  const entry = getQuizScoreEntry(progress, unitId, quizLessonId);
  if (!entry || !entry.total) return false;
  const percent = Math.round((entry.score / entry.total) * 100);
  return percent >= QUIZ_PASS_PERCENT;
}

export function isContentLessonComplete(contentLesson, lessons, progress, unitId) {
  if (!contentLesson) return false;
  const completedIds = (progress?.completedLessons?.[String(unitId)] ?? []).map(String);
  const contentDone = completedIds.includes(String(contentLesson.id));
  const pairedQuiz = getPairedQuiz(contentLesson, lessons);

  if (!pairedQuiz) return contentDone;
  return hasPassedQuiz(progress, unitId, pairedQuiz.id);
}

export function formatScoreLabel(score, total) {
  if (typeof score !== 'number' || typeof total !== 'number' || total <= 0) return '';
  return `${score}/${total}`;
}
