import AsyncStorage from '@react-native-async-storage/async-storage';
import { wpApiUrl, isWordPressConfigured, wordpressConfig } from '../config/wordpress';

const WP_TOKEN_KEY = '@academy_wp_token';

async function wpFetch(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json', Accept: 'application/json' };
  const options = { method, headers };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const url =
    method === 'GET' && body
      ? `${wpApiUrl(path)}?${new URLSearchParams(body).toString()}`
      : wpApiUrl(path);

  const res = await fetch(url, options);
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data?.message || data?.error || `WordPress API error (${res.status})`);
  }

  return data;
}

export async function saveWpToken(token) {
  if (token) await AsyncStorage.setItem(WP_TOKEN_KEY, token);
  else await AsyncStorage.removeItem(WP_TOKEN_KEY);
}

export async function getWpToken() {
  return AsyncStorage.getItem(WP_TOKEN_KEY);
}

/** Login with WordPress / MasterStudy credentials */
export async function loginWordPress(login, password) {
  const data = await wpFetch('/login', {
    method: 'POST',
    body: { login, password },
  });
  const token = data?.token || data?.data?.token;
  if (token) await saveWpToken(token);
  return { ...data, token };
}

/** Public course list (may not need token) */
export async function fetchWordPressCourses(params = {}) {
  return wpFetch('/courses', { method: 'GET', body: params });
}

/** Single course details */
export async function fetchWordPressCourse(courseId = wordpressConfig.courseId) {
  return wpFetch('/course', { method: 'GET', body: { id: String(courseId) } });
}

/** Curriculum: sections, lessons, quizzes */
export async function fetchWordPressCurriculum(courseId, token) {
  const authToken = token || (await getWpToken());
  return wpFetch('/course_curriculum', {
    method: 'POST',
    body: { id: Number(courseId), token: authToken },
  });
}

/** Full lesson content (video URL, text, etc.) */
export async function fetchWordPressLesson(courseId, itemId, token) {
  const authToken = token || (await getWpToken());
  return wpFetch('/course/lesson', {
    method: 'POST',
    body: {
      course_id: Number(courseId),
      item_id: Number(itemId),
      token: authToken,
    },
  });
}

/** Mark lesson complete on WordPress */
export async function completeWordPressLesson(courseId, itemId, token) {
  const authToken = token || (await getWpToken());
  return wpFetch('/course/lesson/complete', {
    method: 'PUT',
    body: {
      course_id: Number(courseId),
      item_id: Number(itemId),
      token: authToken,
    },
  });
}

/**
 * Map MasterStudy curriculum → app units + lessons.
 * Adjust field names once you inspect real API JSON from your site.
 */
export function mapWordPressCurriculum(curriculum, courseId = 'main') {
  const sections = curriculum?.sections || curriculum?.curriculum || curriculum?.items || [];
  const units = [];
  const lessonsByUnit = {};

  sections.forEach((section, sectionIndex) => {
    const unitId = String(section.id || section.section_id || sectionIndex + 1);
    const items = section.items || section.lessons || section.materials || [];

    units.push({
      id: unitId,
      courseId,
      order: sectionIndex + 1,
      title: section.title || section.label || `Unit ${sectionIndex + 1}`,
      description: section.description || '',
      total: items.length || 5,
      totalLessons: items.length || 5,
      completed: 0,
      status: sectionIndex === 0 ? 'in_progress' : 'locked',
    });

    lessonsByUnit[unitId] = items.map((item, lessonIndex) => {
      const type = normalizeLessonType(item.type || item.lesson_type);
      return {
        id: String(item.id || item.post_id || item.item_id),
        unitId,
        courseId,
        order: lessonIndex + 1,
        title: item.title || item.post_title || `Lesson ${lessonIndex + 1}`,
        type,
        duration: item.duration || item.video_duration || '15 min',
        about: item.excerpt || item.content || '',
        videoUrl: item.video_url || item.video || item.stream_url || '',
        audioUrl: item.audio_url || item.audio || '',
        resources: item.files || item.attachments || [],
        questions: type === 'quiz' ? item.questions || [] : [],
      };
    });
  });

  return { units, lessonsByUnit };
}

function normalizeLessonType(raw) {
  const value = String(raw || 'video').toLowerCase();
  if (value.includes('quiz')) return 'quiz';
  if (value.includes('audio')) return 'audio';
  if (value.includes('video') || value.includes('stream')) return 'video';
  return 'video';
}

export async function testWordPressConnection() {
  if (!isWordPressConfigured()) {
    return { ok: false, message: 'Set EXPO_PUBLIC_WORDPRESS_URL in .env' };
  }
  try {
    const courses = await fetchWordPressCourses({ per_page: 5 });
    return { ok: true, courses };
  } catch (error) {
    return { ok: false, message: error.message };
  }
}
