import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db, isFirebaseReady } from '../config/firebase';
import { quoteOfDay } from '../data/course';
import { DEFAULT_LOCALE } from '../i18n';
import {
  COURSE_ID,
  getImportedCourse,
  getImportedUnits,
  getImportedLessons,
  getImportedLesson,
} from './importedCourseService';
import { mergeWithFirestoreLessons } from './firestoreLessonService';
import { clearLocalizedCourseCache } from './localizedCourseService';

export { COURSE_ID };

let activeLocale = DEFAULT_LOCALE;

export function setActiveLocale(locale) {
  activeLocale = locale || DEFAULT_LOCALE;
  clearLocalizedCourseCache();
}

export function getActiveLocale() {
  return activeLocale;
}

function normalizeCourseId(courseId) {
  if (!courseId || courseId === 'main') return COURSE_ID;
  return courseId;
}

export async function fetchCourse(courseId = COURSE_ID) {
  normalizeCourseId(courseId);
  return getImportedCourse(activeLocale);
}

export async function fetchUnits(courseId = COURSE_ID) {
  normalizeCourseId(courseId);
  return getImportedUnits(activeLocale);
}

export async function fetchUnit(unitId) {
  const units = await fetchUnits();
  return units.find((unit) => String(unit.id) === String(unitId)) ?? units[0];
}

function firestoreMergeOptions(locale = activeLocale) {
  // Non-English: keep translated text; only fill missing media from Firestore (English seed).
  return { mediaOnly: locale !== DEFAULT_LOCALE };
}

export async function fetchLessons(unitId, locale = activeLocale) {
  const resolvedLocale = locale || activeLocale || DEFAULT_LOCALE;
  if (resolvedLocale !== activeLocale) {
    setActiveLocale(resolvedLocale);
  }
  const bundled = getImportedLessons(unitId, resolvedLocale);
  // For translated locales, skip Firestore text merge entirely — bundled JSON is source of truth.
  if (resolvedLocale !== DEFAULT_LOCALE) {
    return mergeWithFirestoreLessons(unitId, bundled, { mediaOnly: true });
  }
  return mergeWithFirestoreLessons(unitId, bundled, firestoreMergeOptions(resolvedLocale));
}

export async function fetchLesson(lessonId, unitId, locale = activeLocale) {
  const resolvedLocale = locale || activeLocale || DEFAULT_LOCALE;
  const lessons = unitId
    ? await fetchLessons(unitId, resolvedLocale)
    : getImportedLessons('1', resolvedLocale);
  const lesson =
    lessons.find((item) => String(item.id) === String(lessonId)) ??
    getImportedLesson(lessonId, resolvedLocale);
  if (unitId && resolvedLocale === DEFAULT_LOCALE) {
    const merged = await mergeWithFirestoreLessons(unitId, [lesson], firestoreMergeOptions(resolvedLocale));
    return merged[0] ?? lesson;
  }
  return lesson;
}

export async function fetchAppConfig() {
  if (!isFirebaseReady()) {
    return { quoteOfDay };
  }

  const snap = await getDoc(doc(db, 'appConfig', 'main'));
  if (!snap.exists()) {
    return { quoteOfDay };
  }
  return snap.data();
}

export function subscribeUnits(courseId, callback) {
  normalizeCourseId(courseId);
  callback(getImportedUnits(activeLocale));
  return () => {};
}

export async function fetchAllLessonsForUnits(unitsList) {
  if (!unitsList?.length) return [];

  const batches = await Promise.all(
    unitsList.map(async (unit) => {
      const lessons = await fetchLessons(unit.id);
      return lessons.map((lesson) => ({
        ...lesson,
        unitId: String(unit.id),
        unitTitle: unit.title,
        unitOrder: unit.order ?? unit.id,
      }));
    })
  );

  return batches
    .flat()
    .sort((a, b) => {
      const orderA = Number(a.unitOrder) - Number(b.unitOrder);
      if (orderA !== 0) return orderA;
      return Number(a.order) - Number(b.order);
    });
}

export function subscribeLessons(unitId, callback) {
  callback(getImportedLessons(unitId, activeLocale));
  return () => {};
}

export function subscribeAppConfig(callback) {
  if (!isFirebaseReady()) {
    callback({ quoteOfDay });
    return () => {};
  }

  return onSnapshot(
    doc(db, 'appConfig', 'main'),
    (snap) => {
      callback(snap.exists() ? snap.data() : { quoteOfDay });
    },
    () => callback({ quoteOfDay })
  );
}
