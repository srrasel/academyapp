export const INTRO_UNIT_ID = '1';
export const LEARNABLE_UNIT_COUNT = 20;
/** First N learnable units (chapters) are open from app start. */
export const INITIAL_UNLOCKED_UNIT_COUNT = 5;

/** Exact titles used for per-unit intro lessons (not "Introduction to …" content lessons). */
const UNIT_INTRO_TITLES = new Set([
  'introduction',
  'giới thiệu',
  'การแนะนำ',
  '介绍',
  'perkenalan',
  'សេចក្តីផ្តើម',
]);

/** Tracking / practitioner documents that belong in the toolkit, not the course path. */
const TOOLKIT_DOCUMENT_IDS = new Set([
  '22636', // Sleep problems
  '22646', // Elderly
  '22655', // Sexual coaching progress
  '22662', // Fear of failure
  '22668', // Eating disorder coaching
  '22674', // Lifestyle stress management
  '22677', // Addiction recovery
]);

let cachedUnitIntroLessonIds = null;
let cachedNonLearnableLessonIds = null;
let cachedQuizLessonIds = null;

export function isIntroUnit(unit) {
  if (!unit) return false;
  if (String(unit.id) === INTRO_UNIT_ID) return true;
  const title = unit.title || unit.wpSectionTitle || '';
  return unit.order === 1 && /introduction/i.test(title);
}

export function filterLearnableUnits(units) {
  return (units || []).filter((unit) => !isIntroUnit(unit));
}

export function getLearnableUnitCount(units, course) {
  const learnable = filterLearnableUnits(units);
  if (learnable.length) return learnable.length;
  return course?.totalUnits ?? course?.stats?.units ?? LEARNABLE_UNIT_COUNT;
}

/** True for the generic per-unit "Introduction" lesson only. */
export function isUnitIntroductionLesson(lesson) {
  const title = String(lesson?.title || '').trim().toLowerCase();
  if (!title) return false;
  return UNIT_INTRO_TITLES.has(title);
}

/** True for tracking documents that live in the Practitioner Toolkit. */
export function isToolkitDocumentLesson(lesson) {
  if (!lesson) return false;
  if (TOOLKIT_DOCUMENT_IDS.has(String(lesson.id))) return true;
  const title = String(lesson.title || '').trim().toLowerCase();
  return /tracking\s*document/i.test(title);
}

/** Intro lessons + toolkit documents — not part of the learnable course path. */
export function isNonLearnableLesson(lesson) {
  return isUnitIntroductionLesson(lesson) || isToolkitDocumentLesson(lesson);
}

export function filterLearnableLessons(lessons) {
  return (lessons || []).filter((lesson) => !isNonLearnableLesson(lesson));
}

/** Content lessons only (quizzes are merged into the preceding lesson). */
export function filterTimelineLessons(lessons) {
  return filterLearnableLessons(lessons).filter(
    (lesson) => String(lesson?.type || '').toLowerCase() !== 'quiz'
  );
}

export function getUnitIntroductionLessonIds() {
  if (cachedUnitIntroLessonIds) return cachedUnitIntroLessonIds;
  try {
    const lessons = require('../data/imported/lessons.json');
    cachedUnitIntroLessonIds = new Set(
      lessons.filter(isUnitIntroductionLesson).map((lesson) => String(lesson.id))
    );
  } catch {
    cachedUnitIntroLessonIds = new Set();
  }
  return cachedUnitIntroLessonIds;
}

export function getNonLearnableLessonIds() {
  if (cachedNonLearnableLessonIds) return cachedNonLearnableLessonIds;
  try {
    const lessons = require('../data/imported/lessons.json');
    cachedNonLearnableLessonIds = new Set(
      lessons.filter(isNonLearnableLesson).map((lesson) => String(lesson.id))
    );
  } catch {
    cachedNonLearnableLessonIds = new Set(TOOLKIT_DOCUMENT_IDS);
  }
  return cachedNonLearnableLessonIds;
}

export function countCompletedLearnableLessons(unitId, completedLessons) {
  const ids = completedLessons?.[String(unitId)] ?? [];
  const excluded = getNonLearnableLessonIds();
  const quizIds = getQuizLessonIds();
  return ids.filter((id) => !excluded.has(String(id)) && !quizIds.has(String(id))).length;
}

function getQuizLessonIds() {
  if (cachedQuizLessonIds) return cachedQuizLessonIds;
  try {
    const lessons = require('../data/imported/lessons.json');
    cachedQuizLessonIds = new Set(
      lessons
        .filter((lesson) => String(lesson?.type || '').toLowerCase() === 'quiz')
        .map((lesson) => String(lesson.id))
    );
  } catch {
    cachedQuizLessonIds = new Set();
  }
  return cachedQuizLessonIds;
}

/** User-facing unit number (1–20). Internal ids are offset by the hidden intro unit. */
export function getUnitDisplayNumber(unitOrId) {
  if (unitOrId && typeof unitOrId === 'object') {
    if (unitOrId.displayNumber != null) return unitOrId.displayNumber;
    if (isIntroUnit(unitOrId)) return null;
    unitOrId = unitOrId.id;
  }

  const id = Number(unitOrId);
  if (!Number.isFinite(id) || String(unitOrId) === INTRO_UNIT_ID) return null;
  return Math.max(1, id - 1);
}

/** Title without a leading "Unit 01:" / "Unit 1 •" prefix (avoids "Unit 1: Unit 01: ..."). */
export function getUnitDisplayTitle(unitOrTitle) {
  const raw =
    typeof unitOrTitle === 'string'
      ? unitOrTitle
      : unitOrTitle?.title || unitOrTitle?.wpSectionTitle || '';
  return String(raw)
    .replace(/^Unit\s*0*\d+\s*[:.\-–—•|]\s*/i, '')
    .trim() || raw;
}
