import { enrichLessonMedia } from '../utils/lessonMedia';

const MEDIA_FIELDS = [
  'videoUrl',
  'audioUrl',
  'thumbnailUrl',
  'resources',
  'type',
];

const TEXT_FIELDS = [
  'content',
  'body',
  'htmlContent',
  'description',
  'keyPoints',
  'questions',
  'about',
  'duration',
  'meta',
  'title',
];

export function resolveLessonType(lesson) {
  if (!lesson) return 'text';
  const declared = (lesson.type || 'text').toLowerCase();
  if (declared === 'quiz') return 'quiz';
  if (lesson.videoUrl) return 'video';
  if (lesson.audioUrl) return 'audio';
  if (declared === 'video' || declared === 'audio' || declared === 'text') return declared;
  return 'text';
}

export function mergeLessonRecords(bundled, remote) {
  if (!remote) return bundled;

  const merged = { ...bundled };
  const fields = [...TEXT_FIELDS, ...MEDIA_FIELDS];

  for (const field of fields) {
    const value = remote[field];
    if (value === undefined || value === null) continue;
    if (Array.isArray(value) && value.length === 0) continue;
    if (typeof value === 'string' && !value.trim()) continue;

    if (
      field === 'htmlContent' &&
      typeof bundled.htmlContent === 'string' &&
      bundled.htmlContent.includes('<table') &&
      typeof value === 'string' &&
      !value.includes('<table')
    ) {
      continue;
    }

    if (
      field === 'content' &&
      typeof bundled.content === 'string' &&
      /Topics\s*\n+\s*Quiz/i.test(bundled.content) &&
      typeof value === 'string' &&
      !/Topics\s*\n+\s*Quiz/i.test(value)
    ) {
      continue;
    }

    if (
      field === 'questions' &&
      Array.isArray(bundled.questions) &&
      bundled.questions.length > 0 &&
      Array.isArray(value)
    ) {
      const remotePrompt = String(value[0]?.question || '');
      const remoteLooksMatching =
        value.length === 1 && /match/i.test(remotePrompt);
      // Keep fixed bundled MCQs when Firestore still has the broken matching quiz,
      // or when the bundle has a fuller question set.
      if (remoteLooksMatching || bundled.questions.length >= value.length) {
        continue;
      }
    }

    merged[field] = value;
  }

  merged.type = resolveLessonType(merged);
  return enrichLessonMedia(merged);
}

function isEmptyMediaValue(value) {
  if (value === undefined || value === null) return true;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'string') return !value.trim();
  return false;
}

/** Fill missing media from the English lesson; keep translated text when present. */
export function mergeLessonWithEnglishFallback(translated, english, { mediaOnly = false } = {}) {
  if (!english) return translated;

  const merged = { ...translated };
  for (const field of MEDIA_FIELDS) {
    if (isEmptyMediaValue(merged[field]) && !isEmptyMediaValue(english[field])) {
      merged[field] = english[field];
    }
  }

  if (!mediaOnly) {
    for (const field of TEXT_FIELDS) {
      if (isEmptyMediaValue(merged[field]) && !isEmptyMediaValue(english[field])) {
        merged[field] = english[field];
      }
    }
  }

  merged.type = resolveLessonType(merged);
  return enrichLessonMedia(merged);
}

/** Merge remote into bundled. When mediaOnly, keep localized text and only fill media. */
export function mergeLessonsForUnit(bundledLessons, remoteLessons, { mediaOnly = false } = {}) {
  if (!remoteLessons?.length) return bundledLessons;

  const remoteById = new Map(remoteLessons.map((lesson) => [String(lesson.id), lesson]));

  return bundledLessons.map((lesson) => {
    const remote = remoteById.get(String(lesson.id));
    if (!remote) return lesson;
    if (mediaOnly) {
      return mergeLessonWithEnglishFallback(lesson, remote, { mediaOnly: true });
    }
    return mergeLessonRecords(lesson, remote);
  });
}
