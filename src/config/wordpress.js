export const wordpressConfig = {
  baseUrl: (process.env.EXPO_PUBLIC_WORDPRESS_URL ?? '').replace(/\/$/, ''),
  courseId: process.env.EXPO_PUBLIC_WORDPRESS_COURSE_ID ?? '',
  apiPrefix: '/wp-json/ms_lms/v1',
};

export function isWordPressConfigured() {
  return Boolean(wordpressConfig.baseUrl);
}

export function wpApiUrl(path) {
  return `${wordpressConfig.baseUrl}${wordpressConfig.apiPrefix}${path}`;
}
