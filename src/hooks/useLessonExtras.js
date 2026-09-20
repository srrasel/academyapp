import { useCallback, useEffect, useState } from 'react';
import {
  getLessonNote,
  saveLessonNote,
  isBookmarked,
  toggleBookmark,
} from '../services/lessonExtrasService';

export function useLessonExtras(unitId, lessonId) {
  const [note, setNote] = useState('');
  const [bookmarked, setBookmarked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!unitId || !lessonId) return undefined;
    let active = true;
    setLoading(true);
    setSaved(false);
    Promise.all([getLessonNote(unitId, lessonId), isBookmarked(unitId, lessonId)]).then(
      ([savedNote, savedBookmark]) => {
        if (active) {
          setNote(savedNote);
          setBookmarked(savedBookmark);
          setLoading(false);
        }
      }
    );
    return () => {
      active = false;
    };
  }, [unitId, lessonId]);

  const updateNote = useCallback((text) => {
    setNote(text);
    setSaved(false);
  }, []);

  const publishNote = useCallback(async () => {
    if (!unitId || !lessonId) return false;
    await saveLessonNote(unitId, lessonId, note);
    setSaved(true);
    return true;
  }, [unitId, lessonId, note]);

  const toggleBookmarkState = useCallback(async () => {
    const next = await toggleBookmark(unitId, lessonId);
    setBookmarked(next);
    return next;
  }, [unitId, lessonId]);

  return {
    note,
    updateNote,
    publishNote,
    bookmarked,
    toggleBookmarkState,
    loading,
    saved,
  };
}
