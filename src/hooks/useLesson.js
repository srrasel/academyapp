import { useEffect, useState } from 'react';
import { fetchLessons } from '../services/courseService';
import { useLocale } from '../context/LocaleContext';

export function useUnitLessons(unitId) {
  const { locale, translationsVersion } = useLocale();
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setLessons([]);
    fetchLessons(unitId, locale).then((data) => {
      if (active) {
        setLessons(data);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [unitId, locale, translationsVersion]);

  return { lessons, loading };
}

export function useLesson(lessonId, unitId) {
  const { lessons, loading } = useUnitLessons(unitId);
  const lesson =
    lessons.find((item) => String(item.id) === String(lessonId)) ?? null;
  return { lesson, lessons, loading };
}
