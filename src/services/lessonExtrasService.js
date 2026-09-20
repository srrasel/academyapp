import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTES_KEY = '@academy_lesson_notes';
const BOOKMARKS_KEY = '@academy_lesson_bookmarks';

function lessonKey(unitId, lessonId) {
  return `${unitId}_${lessonId}`;
}

export async function getLessonNote(unitId, lessonId) {
  const raw = await AsyncStorage.getItem(NOTES_KEY);
  const all = raw ? JSON.parse(raw) : {};
  return all[lessonKey(unitId, lessonId)] || '';
}

export async function saveLessonNote(unitId, lessonId, text) {
  const raw = await AsyncStorage.getItem(NOTES_KEY);
  const all = raw ? JSON.parse(raw) : {};
  all[lessonKey(unitId, lessonId)] = text;
  await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(all));
}

export async function isBookmarked(unitId, lessonId) {
  const raw = await AsyncStorage.getItem(BOOKMARKS_KEY);
  const all = raw ? JSON.parse(raw) : {};
  return Boolean(all[lessonKey(unitId, lessonId)]);
}

export async function toggleBookmark(unitId, lessonId) {
  const raw = await AsyncStorage.getItem(BOOKMARKS_KEY);
  const all = raw ? JSON.parse(raw) : {};
  const key = lessonKey(unitId, lessonId);
  all[key] = !all[key];
  if (!all[key]) delete all[key];
  await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(all));
  return Boolean(all[key]);
}
