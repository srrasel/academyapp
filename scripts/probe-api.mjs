const BASE = 'https://bridge-academy.vn/en/wp-json';
const COURSE_ID = 6382;
const LESSON_ID = process.argv[2] || '6392';

const endpoints = [
  `${BASE}/stm-lms/v1/course/${COURSE_ID}`,
  `${BASE}/stm-lms/v1/courses/${COURSE_ID}`,
  `${BASE}/stm-lms/v1/course/${COURSE_ID}/curriculum`,
  `${BASE}/stm-lms/v1/lesson/${LESSON_ID}`,
  `${BASE}/stm-lms/v1/lessons/${LESSON_ID}`,
  `${BASE}/masterstudy-lms/v2/courses/${COURSE_ID}`,
  `${BASE}/masterstudy-lms/v2/courses/${COURSE_ID}/curriculum`,
  `${BASE}/masterstudy-lms/v2/lessons/${LESSON_ID}`,
  `${BASE}/masterstudy-lms/v2/course-builder/${COURSE_ID}`,
  `${BASE}/wp/v2/posts/${LESSON_ID}`,
  `${BASE}/wp/v2/pages/${LESSON_ID}`,
];

for (const url of endpoints) {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'BridgeAcademyApp/1.0' } });
    const text = await res.text();
    let preview = text.slice(0, 200);
    if (res.headers.get('content-type')?.includes('json')) {
      try {
        const json = JSON.parse(text);
        preview = JSON.stringify(json).slice(0, 250);
      } catch {}
    }
    console.log(res.status, url.replace(BASE, ''));
    console.log(' ', preview.replace(/\s+/g, ' '));
  } catch (e) {
    console.log('ERR', url, e.message);
  }
}
