import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import { useLocale } from './LocaleContext';
import {
  fetchAppConfig,
  fetchCourse,
  subscribeUnits,
  setActiveLocale,
  COURSE_ID,
} from '../services/courseService';
import {
  subscribeUserProgress,
  mergeUnitsWithProgress,
  fetchUserProgress,
} from '../services/progressService';
import { subscribeProgressUpdates, LOCAL_GUEST_ID } from '../services/progressEvents';
import { quoteOfDay } from '../data/course';
import { getImportedCourse, getImportedUnits } from '../services/importedCourseService';

const emptyProgress = {
  completedLessons: {},
  quizScores: {},
  streak: 0,
  studyMinutes: 0,
};

const CourseContext = createContext(null);

const FALLBACK_UNIT = {
  id: '2',
  order: 2,
  displayNumber: 1,
  title: '',
  completed: 0,
  total: 1,
  status: 'in_progress',
};

export function CourseProvider({ children }) {
  const { user } = useAuth();
  const { locale, translationsVersion } = useLocale();
  const progressUserId = user?.uid || LOCAL_GUEST_ID;
  const [course, setCourse] = useState(null);
  const [units, setUnits] = useState([]);
  const [progress, setProgress] = useState(emptyProgress);
  const [appConfig, setAppConfig] = useState({ quoteOfDay });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const loadCourseData = () => {
      if (!active) return;
      setCourse(getImportedCourse(locale));
      setUnits(getImportedUnits(locale));
    };

    if (typeof requestAnimationFrame === 'function') {
      requestAnimationFrame(loadCourseData);
    } else {
      setTimeout(loadCourseData, 0);
    }

    return () => {
      active = false;
    };
  }, [locale]);

  useEffect(() => {
    setActiveLocale(locale);
    fetchCourse().then(setCourse);
    const unsubUnits = subscribeUnits(COURSE_ID, setUnits);
    return unsubUnits;
  }, [locale, translationsVersion]);

  useEffect(() => {
    fetchAppConfig().then(setAppConfig);
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);

    fetchUserProgress(progressUserId).then((initial) => {
      if (active) setProgress(initial ?? emptyProgress);
    });

    const unsubRemote = subscribeUserProgress(progressUserId, (data) => {
      if (!active) return;
      setProgress((prev) => {
        const next = data ?? emptyProgress;
        const prevCount = Object.values(prev?.completedLessons ?? {}).reduce(
          (sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0),
          0
        );
        const nextCount = Object.values(next?.completedLessons ?? {}).reduce(
          (sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0),
          0
        );
        if (prevCount > 0 && nextCount === 0) return prev;
        return next;
      });
      setLoading(false);
    });

    const unsubLocal = subscribeProgressUpdates((data) => {
      if (!active || !data) return;
      setProgress((prev) => {
        const prevCount = Object.values(prev?.completedLessons ?? {}).reduce(
          (sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0),
          0
        );
        const nextCount = Object.values(data?.completedLessons ?? {}).reduce(
          (sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0),
          0
        );
        if (prevCount > 0 && nextCount === 0) return prev;
        return data;
      });
    });

    return () => {
      active = false;
      unsubRemote();
      unsubLocal();
    };
  }, [progressUserId]);

  const mergedUnits = useMemo(
    () => mergeUnitsWithProgress(units, progress),
    [units, progress]
  );

  const currentUnit = useMemo(() => {
    if (!mergedUnits.length) return FALLBACK_UNIT;

    const inProgress = mergedUnits.find((unit) => unit.status === 'in_progress');
    if (inProgress) return inProgress;
    const unlocked = mergedUnits.find(
      (unit) => unit.status !== 'locked' && unit.status !== 'completed'
    );
    return unlocked ?? mergedUnits[0] ?? FALLBACK_UNIT;
  }, [mergedUnits]);

  const value = useMemo(
    () => ({
      course,
      units: mergedUnits,
      rawUnits: units,
      progress,
      appConfig,
      currentUnit,
      loading,
      progressUserId,
    }),
    [course, mergedUnits, units, progress, appConfig, currentUnit, loading, progressUserId]
  );

  return <CourseContext.Provider value={value}>{children}</CourseContext.Provider>;
}

export function useCourse() {
  const ctx = useContext(CourseContext);
  if (!ctx) throw new Error('useCourse must be used within CourseProvider');
  return ctx;
}
