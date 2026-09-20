import { DEFAULT_LOCALE } from '../i18n';
import {
  filterLearnableUnits,
  filterLearnableLessons,
  filterTimelineLessons,
  isNonLearnableLesson,
  INITIAL_UNLOCKED_UNIT_COUNT,
} from '../utils/courseUnits';
import { getRemoteCoursePack } from './translationRemoteStore';
import { mergeLessonWithEnglishFallback } from './lessonMergeService';

const metaCache = {};
const lessonsCache = {};

function loadBundledMeta(locale) {
  if (metaCache[locale]) return metaCache[locale];

  let meta;
  switch (locale) {
    case 'zh':
      meta = {
        course: require('../data/translations/zh/course.json'),
        units: require('../data/translations/zh/units.json'),
      };
      break;
    case 'vi':
      meta = {
        course: require('../data/translations/vi/course.json'),
        units: require('../data/translations/vi/units.json'),
      };
      break;
    case 'id':
      meta = {
        course: require('../data/translations/id/course.json'),
        units: require('../data/translations/id/units.json'),
      };
      break;
    case 'th':
      meta = {
        course: require('../data/translations/th/course.json'),
        units: require('../data/translations/th/units.json'),
      };
      break;
    case 'km':
      meta = {
        course: require('../data/translations/km/course.json'),
        units: require('../data/translations/km/units.json'),
      };
      break;
    case 'en':
    default:
      meta = {
        course: require('../data/imported/course.json'),
        units: require('../data/imported/units.json'),
      };
      break;
  }

  metaCache[locale] = meta;
  return meta;
}

function loadBundledLessons(locale) {
  if (lessonsCache[locale]) return lessonsCache[locale];

  let lessons;
  switch (locale) {
    case 'zh':
      lessons = require('../data/translations/zh/lessons.json');
      break;
    case 'vi':
      lessons = require('../data/translations/vi/lessons.json');
      break;
    case 'id':
      lessons = require('../data/translations/id/lessons.json');
      break;
    case 'th':
      lessons = require('../data/translations/th/lessons.json');
      break;
    case 'km':
      lessons = require('../data/translations/km/lessons.json');
      break;
    case 'en':
    default:
      lessons = require('../data/imported/lessons.json');
      break;
  }

  lessonsCache[locale] = lessons;
  return lessons;
}

function hasTranslatedCourse(meta) {
  return meta?.course?._translated === true;
}

function getBundledMeta(locale) {
  const normalized = locale === DEFAULT_LOCALE ? DEFAULT_LOCALE : locale;
  const meta = loadBundledMeta(normalized);
  if (normalized === DEFAULT_LOCALE || !hasTranslatedCourse(meta)) {
    return loadBundledMeta(DEFAULT_LOCALE);
  }
  return meta;
}

function getBundledLessons(locale) {
  const normalized = locale === DEFAULT_LOCALE ? DEFAULT_LOCALE : locale;
  const meta = loadBundledMeta(normalized);
  if (normalized === DEFAULT_LOCALE || !hasTranslatedCourse(meta)) {
    return loadBundledLessons(DEFAULT_LOCALE);
  }
  return loadBundledLessons(normalized);
}

function isTranslatedPack(course) {
  return course?._translated === true;
}

function getRemoteMeta(locale) {
  if (locale === DEFAULT_LOCALE) return null;
  const remote = getRemoteCoursePack(locale);
  if (!remote?.course && !remote?.units) return null;
  // Ignore remote packs that are missing or not marked translated (often English leftovers).
  if (remote.course && !isTranslatedPack(remote.course)) return null;
  return {
    course: remote.course ?? loadBundledMeta(locale).course,
    units: remote.units ?? loadBundledMeta(locale).units,
  };
}

function resolveMeta(locale) {
  return getRemoteMeta(locale) ?? getBundledMeta(locale);
}

function resolveLessons(locale) {
  // Always use APK-bundled lesson translations (remote packs are incomplete/English).
  return getBundledLessons(locale);
}

export function clearLocalizedCourseCache() {
  Object.keys(metaCache).forEach((key) => {
    delete metaCache[key];
  });
  Object.keys(lessonsCache).forEach((key) => {
    delete lessonsCache[key];
  });
}

export function getLocalizedCourseData(locale) {
  return {
    ...resolveMeta(locale),
    lessons: resolveLessons(locale),
  };
}

export function getLocalizedCourse(locale) {
  const course = { ...resolveMeta(locale).course };
  const learnableLessonCount = filterLearnableLessons(resolveLessons(locale)).filter(
    (lesson) =>
      String(lesson.unitId) !== '1' && String(lesson?.type || '').toLowerCase() !== 'quiz'
  ).length;
  if (learnableLessonCount > 0) {
    course.stats = {
      ...(course.stats || {}),
      lessons: learnableLessonCount,
    };
  }
  return course;
}

export function getLocalizedUnits(locale) {
  const allLessons = resolveLessons(locale);
  return filterLearnableUnits(resolveMeta(locale).units).map((unit, index) => {
    const lessonCount = filterTimelineLessons(
      allLessons.filter((lesson) => String(lesson.unitId) === String(unit.id))
    ).length;
    const fallbackTotal = Math.max(0, (unit.total ?? unit.totalLessons ?? 1) - 1);
    const total = lessonCount || fallbackTotal;
    return {
      ...unit,
      total,
      totalLessons: total,
      completed: 0,
      status: index < INITIAL_UNLOCKED_UNIT_COUNT ? 'unlocked' : 'locked',
    };
  });
}

export function getLocalizedLessons(locale, unitId) {
  const lessons = filterLearnableLessons(
    resolveLessons(locale)
      .filter((lesson) => String(lesson.unitId) === String(unitId))
      .sort((a, b) => a.order - b.order)
  );

  if (locale === DEFAULT_LOCALE) {
    return lessons;
  }

  const englishLessons = loadBundledLessons(DEFAULT_LOCALE);
  const englishById = new Map(englishLessons.map((lesson) => [String(lesson.id), lesson]));

  return lessons.map((lesson) =>
    // Fill only missing media/text from English; never overwrite translated fields.
    mergeLessonWithEnglishFallback(lesson, englishById.get(String(lesson.id)))
  );
}

export function getLocalizedLesson(locale, lessonId) {
  const lessons = resolveLessons(locale);
  const lesson =
    lessons.find((item) => String(item.id) === String(lessonId)) ?? lessons[0];

  // Prefer next learnable lesson if someone opens a removed intro/toolkit doc by id.
  if (isNonLearnableLesson(lesson)) {
    const unitLessons = getLocalizedLessons(locale, lesson.unitId);
    return unitLessons[0] ?? lesson;
  }

  if (locale === DEFAULT_LOCALE) {
    return lesson;
  }

  const english = loadBundledLessons(DEFAULT_LOCALE).find(
    (item) => String(item.id) === String(lessonId)
  );

  return mergeLessonWithEnglishFallback(lesson, english);
}
