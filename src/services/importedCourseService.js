import { buildQuizQuestionsForLesson } from '../utils/quizQuestions';
import { enrichLessonMedia } from '../utils/lessonMedia';
import { translate, DEFAULT_LOCALE } from '../i18n';
import {
  getLocalizedCourse,
  getLocalizedUnits,
  getLocalizedLessons,
  getLocalizedLesson,
} from './localizedCourseService';

export const COURSE_ID = 'general-psychology';

function tForLocale(locale, key, params) {
  return translate(locale, key, params);
}

function enrichLesson(lesson, locale = DEFAULT_LOCALE) {
  const withMedia = enrichLessonMedia(lesson);
  if ((withMedia.type || '').toLowerCase() !== 'quiz') return withMedia;
  if (withMedia.questions?.length) return withMedia;

  return {
    ...withMedia,
    questions: buildQuizQuestionsForLesson(withMedia, (key, params) =>
      tForLocale(locale, key, params)
    ),
  };
}

export function getImportedCourse(locale = DEFAULT_LOCALE) {
  return { ...getLocalizedCourse(locale) };
}

export function getImportedUnits(locale = DEFAULT_LOCALE) {
  return getLocalizedUnits(locale);
}

export function getImportedLessons(unitId, locale = DEFAULT_LOCALE) {
  return getLocalizedLessons(locale, unitId)
    .sort((a, b) => a.order - b.order)
    .map((lesson) => enrichLesson(lesson, locale));
}

export function getImportedLesson(lessonId, locale = DEFAULT_LOCALE) {
  const lesson = getLocalizedLesson(locale, lessonId);
  return enrichLesson(lesson, locale);
}
