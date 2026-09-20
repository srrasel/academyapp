import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { db, isFirebaseReady } from '../config/firebase';
import { notifyProgressUpdate } from './progressEvents';
import {
  filterLearnableUnits,
  getLearnableUnitCount,
  getUnitDisplayNumber,
  getUnitDisplayTitle,
  countCompletedLearnableLessons,
  INITIAL_UNLOCKED_UNIT_COUNT,
} from '../utils/courseUnits';

const LOCAL_KEY = '@academy_local_progress';

const EMPTY_PROGRESS = {
  completedLessons: {},
  quizScores: {},
  streak: 0,
  studyMinutes: 0,
};

function hasSavedProgress(data) {
  if (!data || typeof data !== 'object') return false;
  const lessons = data.completedLessons ?? {};
  const quizzes = data.quizScores ?? {};
  const lessonCount = Object.values(lessons).reduce(
    (sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0),
    0
  );
  return lessonCount > 0 || Object.keys(quizzes).length > 0;
}

async function getLocalProgress(userId) {
  try {
    const raw = await import('@react-native-async-storage/async-storage').then((m) =>
      m.default.getItem(`${LOCAL_KEY}:${userId}`)
    );
    return raw ? JSON.parse(raw) : { ...EMPTY_PROGRESS };
  } catch {
    return { ...EMPTY_PROGRESS };
  }
}

async function saveLocalProgress(userId, data) {
  const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
  const toStore = {
    ...data,
    updatedAt: typeof data.updatedAt === 'number' ? data.updatedAt : Date.now(),
  };
  await AsyncStorage.setItem(`${LOCAL_KEY}:${userId}`, JSON.stringify(toStore));
}

async function persistProgress(userId, next) {
  // Always mirror to AsyncStorage so Firestore "missing doc" / error fallbacks
  // never wipe in-memory progress with an empty local cache.
  await saveLocalProgress(userId, next);

  if (isFirebaseReady()) {
    await setDoc(
      doc(db, 'users', userId, 'meta', 'progress'),
      {
        ...next,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  }

  notifyProgressUpdate(next);
  return next;
}

export async function fetchUserProgress(userId) {
  if (!userId) return { ...EMPTY_PROGRESS };

  if (!isFirebaseReady()) {
    return getLocalProgress(userId);
  }

  try {
    const snap = await getDoc(doc(db, 'users', userId, 'meta', 'progress'));
    if (snap.exists()) {
      const remote = snap.data();
      // Keep local mirror warm for offline / race fallbacks.
      await saveLocalProgress(userId, remote);
      return remote;
    }
  } catch {
    // Fall through to local.
  }

  return getLocalProgress(userId);
}

export function subscribeUserProgress(userId, callback) {
  if (!userId) {
    callback({ ...EMPTY_PROGRESS });
    return () => {};
  }

  if (!isFirebaseReady()) {
    let cancelled = false;
    getLocalProgress(userId).then((data) => {
      if (!cancelled) callback(data);
    });
    return () => {
      cancelled = true;
    };
  }

  let cancelled = false;
  let generation = 0;
  let lastEmitted = null;

  const emit = (data) => {
    if (cancelled) return;

    // Never replace known progress with an empty fallback (stale local race).
    if (hasSavedProgress(lastEmitted) && !hasSavedProgress(data)) {
      return;
    }

    lastEmitted = data;
    callback(data);
  };

  const emitLocalFallback = () => {
    const gen = ++generation;
    getLocalProgress(userId).then((local) => {
      if (cancelled || gen !== generation) return;
      emit(local);
    });
  };

  return onSnapshot(
    doc(db, 'users', userId, 'meta', 'progress'),
    (snap) => {
      generation += 1;
      if (!snap.exists()) {
        emitLocalFallback();
        return;
      }
      emit(snap.data());
    },
    () => {
      emitLocalFallback();
    }
  );
}

export async function markLessonComplete(userId, { unitId, lessonId, minutes = 0 }) {
  if (!userId) return;

  const current = await fetchUserProgress(userId);
  const unitKey = String(unitId);
  const completed = new Set(
    (current.completedLessons?.[unitKey] ?? []).map((id) => String(id))
  );
  completed.add(String(lessonId));

  const today = new Date().toDateString();
  let streak = current.streak ?? 0;
  if (current.lastStudyDate !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (current.lastStudyDate === yesterday.toDateString()) {
      streak += 1;
    } else {
      streak = 1;
    }
  }

  const next = {
    ...current,
    completedLessons: {
      ...(current.completedLessons ?? {}),
      [unitKey]: Array.from(completed),
    },
    studyMinutes: (current.studyMinutes ?? 0) + minutes,
    streak,
    lastStudyDate: today,
    updatedAt: Date.now(),
  };

  return persistProgress(userId, next);
}

export async function saveQuizResult(userId, { unitId, lessonId, score, total, answers = null, markComplete = false }) {
  if (!userId) return;

  const current = await fetchUserProgress(userId);
  const unitKey = String(unitId);
  const lessonKey = String(lessonId);

  const quizEntry = {
    score,
    total,
    completedAt: Date.now(),
  };
  if (answers && typeof answers === 'object') {
    quizEntry.answers = answers;
  }

  const next = {
    ...current,
    quizScores: {
      ...(current.quizScores ?? {}),
      [`${unitKey}_${lessonKey}`]: quizEntry,
    },
    updatedAt: Date.now(),
  };

  // Only mark the quiz lesson complete when the student passed.
  if (markComplete) {
    const completed = new Set(
      (current.completedLessons?.[unitKey] ?? []).map((id) => String(id))
    );
    completed.add(lessonKey);

    const today = new Date().toDateString();
    let streak = current.streak ?? 0;
    if (current.lastStudyDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      if (current.lastStudyDate === yesterday.toDateString()) {
        streak += 1;
      } else {
        streak = 1;
      }
    }

    next.completedLessons = {
      ...(current.completedLessons ?? {}),
      [unitKey]: Array.from(completed),
    };
    next.studyMinutes = (current.studyMinutes ?? 0) + 15;
    next.streak = streak;
    next.lastStudyDate = today;
  }

  return persistProgress(userId, next);
}

export function mergeUnitsWithProgress(units, progress) {
  const completedLessons = progress?.completedLessons ?? {};
  const learnableUnits = filterLearnableUnits(units);

  return learnableUnits.map((unit, index) => {
    const unitKey = String(unit.id);
    const done = countCompletedLearnableLessons(unitKey, completedLessons);
    const total = unit.total ?? unit.totalLessons ?? 5;

    const canAccess =
      index < INITIAL_UNLOCKED_UNIT_COUNT ||
      areAllPreviousUnitsComplete(learnableUnits, index, completedLessons);

    let status = 'locked';
    if (canAccess) {
      if (done >= total) status = 'completed';
      else if (done > 0) status = 'in_progress';
      else status = 'unlocked';
    }

    return {
      ...unit,
      displayNumber: index + 1,
      completed: done,
      total,
      status,
    };
  });
}

function areAllPreviousUnitsComplete(units, index, completedLessons) {
  if (index <= 0) return true;
  for (let i = 0; i < index; i += 1) {
    const prev = units[i];
    const prevTotal = prev.total ?? prev.totalLessons ?? 5;
    const prevDone = countCompletedLearnableLessons(prev.id, completedLessons);
    if (prevDone < prevTotal) return false;
  }
  return true;
}

export function buildProgressStats(course, units, progress) {
  const merged = mergeUnitsWithProgress(units, progress);
  const totalUnits = getLearnableUnitCount(units, course);
  const unitsCompleted = merged.filter((u) => u.status === 'completed').length;
  const lessonsCompleted = Object.keys(progress?.completedLessons ?? {}).reduce(
    (sum, unitId) => sum + countCompletedLearnableLessons(unitId, progress.completedLessons),
    0
  );
  const totalLessons = course?.stats?.lessons ?? 100;
  const percent = totalLessons ? Math.round((lessonsCompleted / totalLessons) * 100) : 0;

  const quizScores = Object.values(progress?.quizScores ?? {});
  const averageScore = quizScores.length
    ? Math.round(
        quizScores.reduce((sum, q) => {
          const total = Number(q.total) || 0;
          if (!total) return sum;
          return sum + (Number(q.score) / total) * 100;
        }, 0) / quizScores.length
      )
    : 0;

  const studyMinutes = progress?.studyMinutes ?? 0;
  let trend = '';
  if (quizScores.length >= 2) {
    const sorted = [...quizScores].sort(
      (a, b) => (a.completedAt || 0) - (b.completedAt || 0)
    );
    const midpoint = Math.floor(sorted.length / 2);
    const earlier = sorted.slice(0, midpoint);
    const later = sorted.slice(midpoint);
    const avg = (list) =>
      list.reduce((sum, q) => {
        const total = Number(q.total) || 0;
        if (!total) return sum;
        return sum + (Number(q.score) / total) * 100;
      }, 0) / list.length;
    const delta = Math.round(avg(later) - avg(earlier));
    if (delta > 0) trend = `+${delta}% vs earlier quizzes`;
    else if (delta < 0) trend = `${delta}% vs earlier quizzes`;
    else trend = 'Steady vs earlier quizzes';
  }

  return {
    percent,
    unitsCompleted,
    totalUnits,
    lessonsCompleted,
    totalLessons,
    hoursStudied: formatMinutes(studyMinutes),
    averageScore,
    scoreTrend: trend,
    streak: progress?.streak ?? 0,
    monthlyStudyTime: formatMinutes(studyMinutes),
  };
}

export function buildUnitProgressList(units, progress) {
  const merged = mergeUnitsWithProgress(units, progress);
  return merged
    .filter((u) => u.status !== 'locked' && u.completed > 0)
    .sort((a, b) => b.id - a.id)
    .slice(0, 3)
    .map((u) => ({
      id: u.id,
      title: `Unit ${getUnitDisplayNumber(u)}`,
      subtitle: getUnitDisplayTitle(u),
      percent: Math.round((u.completed / u.total) * 100) || 0,
    }));
}

function formatMinutes(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
}

export async function fetchAllUserProgressDocs(userId) {
  if (!isFirebaseReady() || !userId) return null;
  const snap = await getDocs(collection(db, 'users', userId, 'meta'));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
