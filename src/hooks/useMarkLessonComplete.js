import { useCallback } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useCourse } from '../context/CourseContext';
import { markLessonComplete } from '../services/progressService';
import { getProgressUserId } from '../services/progressEvents';

export function useMarkLessonComplete() {
  const { user } = useAuth();
  const { progressUserId } = useCourse();
  const userId = getProgressUserId(user) || progressUserId;

  return useCallback(
    async ({ unitId, lessonId, minutes = 15, silent = false }) => {
      if (!lessonId) return false;
      try {
        await markLessonComplete(userId, {
          unitId,
          lessonId: String(lessonId),
          minutes,
        });
        if (!silent) {
          Alert.alert('Lesson complete', 'This lesson has been marked as done.');
        }
        return true;
      } catch {
        Alert.alert('Error', 'Could not save progress. Please try again.');
        return false;
      }
    },
    [userId]
  );
}
