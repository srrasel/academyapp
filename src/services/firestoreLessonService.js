import { collection, getDocs, query, where } from 'firebase/firestore';
import { db, isFirebaseReady } from '../config/firebase';
import { mergeLessonsForUnit } from './lessonMergeService';

const cache = new Map();

export function clearFirestoreLessonCache() {
  cache.clear();
}

export async function fetchFirestoreLessonsForUnit(unitId) {
  const unitKey = String(unitId);
  if (cache.has(unitKey)) return cache.get(unitKey);

  if (!isFirebaseReady()) {
    cache.set(unitKey, null);
    return null;
  }

  try {
    const snap = await getDocs(
      query(collection(db, 'lessons'), where('unitId', '==', unitKey))
    );

    if (snap.empty) {
      cache.set(unitKey, null);
      return null;
    }

    const lessons = snap.docs
      .map((item) => ({ id: item.id, ...item.data() }))
      .sort((a, b) => Number(a.order) - Number(b.order));

    cache.set(unitKey, lessons);
    return lessons;
  } catch {
    cache.set(unitKey, null);
    return null;
  }
}

export async function mergeWithFirestoreLessons(unitId, bundledLessons, options = {}) {
  const remoteLessons = await fetchFirestoreLessonsForUnit(unitId);
  return mergeLessonsForUnit(bundledLessons, remoteLessons, options);
}
