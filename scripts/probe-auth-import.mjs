const COURSE_ID = 6382;
const LESSON_ID = 6392;
const BASE = 'https://bridge-academy.vn';
const AJAX = `${BASE}/wp-admin/admin-ajax.php`;

function extractJsonAfterMarker(html, marker) {
  const idx = html.indexOf(marker);
  if (idx < 0) return null;
  const start = html.indexOf('{', idx);
  if (start < 0) return null;
  let depth = 0;
  for (let i = start; i < html.length; i += 1) {
    if (html[i] === '{') depth += 1;
    if (html[i] === '}') depth -= 1;
    if (depth === 0) {
      return JSON.parse(html.slice(start, i + 1));
    }
  }
  return null;
}

async function fetchPage(url) {
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 BridgeAcademyApp/1.0' } });
  return { html: await res.text(), cookies: parseCookies(res) };
}

function parseCookies(res) {
  if (!res.headers.getSetCookie) return '';
  return res.headers.getSetCookie().map((c) => c.split(';')[0]).join('; ');
}

async function wpLogin(login, password) {
  const { html, cookies: pageCookies } = await fetchPage(`${BASE}/en/courses-3/general-course/`);
  const nonces = extractJsonAfterMarker(html, 'stm_lms_nonces') || {};

  const body = new URLSearchParams({
    action: 'stm_lms_login',
    user_login: login,
    user_password: password,
    remember: '1',
    nonce: nonces.stm_lms_login || '',
  });

  const res = await fetch(AJAX, {
    method: 'POST',
    body,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Cookie: pageCookies,
      'User-Agent': 'Mozilla/5.0',
    },
  });

  const text = await res.text();
  const authCookies = parseCookies(res);
  const allCookies = [pageCookies, authCookies].filter(Boolean).join('; ');

  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text };
  }

  return { ok: json?.status === 'success' || json?.logged_in || json?.user?.id, json, cookies: allCookies, nonces, html };
}

async function ajaxAction(action, params, cookies, nonce) {
  const body = new URLSearchParams({ action, ...params });
  if (nonce) body.set('nonce', nonce);

  const res = await fetch(AJAX, {
    method: 'POST',
    body,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Cookie: cookies,
      'User-Agent': 'Mozilla/5.0',
    },
  });
  const text = await res.text();
  try {
    return { status: res.status, data: JSON.parse(text) };
  } catch {
    return { status: res.status, data: text.slice(0, 500) };
  }
}

const login = process.env.WP_LOGIN || process.env.WP_EMAIL || '';
const password = process.env.WP_PASSWORD || '';

console.log('Testing public ajax actions...');
const page = await fetchPage(`${BASE}/en/courses-3/general-course/6392`);
const nonces = extractJsonAfterMarker(page.html, 'stm_lms_nonces') || {};

for (const [action, extra] of [
  ['stm_lms_get_curriculum_v2', { course_id: String(COURSE_ID) }],
  ['load_content', { course_id: String(COURSE_ID), item_id: String(LESSON_ID) }],
  ['start_quiz', { course_id: String(COURSE_ID), item_id: String(LESSON_ID) }],
]) {
  const result = await ajaxAction(action, extra, page.cookies, nonces[action]);
  console.log(`\n${action}:`, result.status, JSON.stringify(result.data).slice(0, 300));
}

if (!login || !password) {
  console.log('\nNo WP_LOGIN/WP_PASSWORD in .env — add your bridge-academy.vn account to fetch full content.');
  process.exit(0);
}

console.log('\nLogging in as', login);
const auth = await wpLogin(login, password);
console.log('Login result:', JSON.stringify(auth.json).slice(0, 400));

if (!auth.ok) {
  console.error('Login failed. Check WP_LOGIN and WP_PASSWORD in .env');
  process.exit(1);
}

for (const [action, extra] of [
  ['stm_lms_get_curriculum_v2', { course_id: String(COURSE_ID) }],
  ['load_content', { course_id: String(COURSE_ID), item_id: String(LESSON_ID) }],
  ['start_quiz', { course_id: String(COURSE_ID), item_id: String(LESSON_ID) }],
]) {
  const result = await ajaxAction(action, extra, auth.cookies, auth.nonces[action]);
  console.log(`\nAUTH ${action}:`, result.status, JSON.stringify(result.data).slice(0, 500));
}

const wpNonce = auth.html.match(/wp_rest_nonce":"([^"]+)"/)?.[1];
const curriculumApi = await fetch(`${BASE}/en/wp-json/masterstudy-lms/v2/courses/${COURSE_ID}/curriculum`, {
  headers: {
    Cookie: auth.cookies,
    'X-WP-Nonce': wpNonce || '',
  },
});
console.log('\nREST curriculum:', curriculumApi.status, (await curriculumApi.text()).slice(0, 500));

const lessonApi = await fetch(`${BASE}/en/wp-json/masterstudy-lms/v2/lessons/${LESSON_ID}`, {
  headers: {
    Cookie: auth.cookies,
    'X-WP-Nonce': wpNonce || '',
  },
});
console.log('\nREST lesson:', lessonApi.status, (await lessonApi.text()).slice(0, 500));

const quizApi = await fetch(`${BASE}/en/wp-json/masterstudy-lms/v2/quizzes/${LESSON_ID}`, {
  headers: {
    Cookie: auth.cookies,
    'X-WP-Nonce': wpNonce || '',
  },
});
console.log('\nREST quiz:', quizApi.status, (await quizApi.text()).slice(0, 500));
