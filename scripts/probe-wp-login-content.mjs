import fs from 'fs';

const BASE = 'https://bridge-academy.vn';
const COURSE_ID = 6382;
const LESSON_ID = 6392;
const QUIZ_ID = 6393;
const AJAX = `${BASE}/wp-admin/admin-ajax.php`;

function loadEnv() {
  const env = {};
  for (const line of fs.readFileSync('.env', 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
  }
  return env;
}

function parseCookies(res) {
  if (!res.headers.getSetCookie) return '';
  return res.headers.getSetCookie().map((c) => c.split(';')[0]).join('; ');
}

function mergeCookies(...parts) {
  const map = new Map();
  for (const chunk of parts.filter(Boolean)) {
    for (const pair of chunk.split(';')) {
      const trimmed = pair.trim();
      if (!trimmed) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      map.set(trimmed.slice(0, eq), trimmed.slice(eq + 1));
    }
  }
  return [...map.entries()].map(([k, v]) => `${k}=${v}`).join('; ');
}

function extractJsonAfterMarker(html, marker) {
  const idx = html.indexOf(marker);
  if (idx < 0) return null;
  const start = html.indexOf('{', idx);
  if (start < 0) return null;
  let depth = 0;
  for (let i = start; i < html.length; i += 1) {
    if (html[i] === '{') depth += 1;
    if (html[i] === '}') depth -= 1;
    if (depth === 0) return JSON.parse(html.slice(start, i + 1));
  }
  return null;
}

async function wpLogin(login, password) {
  const pageRes = await fetch(`${BASE}/en/courses-3/general-course/${LESSON_ID}`, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
  });
  const pageCookies = parseCookies(pageRes);

  const body = new URLSearchParams({
    log: login,
    pwd: password,
    'wp-submit': 'Log In',
    redirect_to: `${BASE}/en/courses-3/general-course/${LESSON_ID}`,
    testcookie: '1',
  });

  const loginRes = await fetch(`${BASE}/wp-login.php`, {
    method: 'POST',
    body,
    redirect: 'manual',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Cookie: mergeCookies(pageCookies, 'wordpress_test_cookie=WP%20Cookie%20check'),
      Referer: `${BASE}/wp-login.php`,
      Origin: BASE,
      'User-Agent': 'Mozilla/5.0',
    },
  });

  const cookies = mergeCookies(pageCookies, parseCookies(loginRes));
  const ok = loginRes.status === 302 && loginRes.headers.get('location')?.includes('general-course');

  const lessonRes = await fetch(`${BASE}/en/courses-3/general-course/${LESSON_ID}`, {
    headers: { Cookie: cookies, 'User-Agent': 'Mozilla/5.0' },
  });
  const html = await lessonRes.text();
  const nonces = extractJsonAfterMarker(html, 'stm_lms_nonces') || {};
  const wpRestNonce = html.match(/wp_rest_nonce":"([^"]+)"/)?.[1] || '';

  return { ok, cookies: mergeCookies(cookies, parseCookies(lessonRes)), nonces, wpRestNonce, html };
}

async function ajaxPost(action, fields, cookies, nonce) {
  const body = new URLSearchParams({ action, ...fields });
  if (nonce) body.set('nonce', nonce);
  const res = await fetch(AJAX, {
    method: 'POST',
    body,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Cookie: cookies,
      Referer: `${BASE}/en/courses-3/general-course/${LESSON_ID}`,
      Origin: BASE,
      'User-Agent': 'Mozilla/5.0',
    },
  });
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function restGet(path, cookies, wpRestNonce) {
  const res = await fetch(`${BASE}/en/wp-json${path}`, {
    headers: { Cookie: cookies, 'X-WP-Nonce': wpRestNonce, Accept: 'application/json' },
  });
  const text = await res.text();
  try {
    return { status: res.status, data: JSON.parse(text) };
  } catch {
    return { status: res.status, data: text.slice(0, 500) };
  }
}

const env = loadEnv();
const auth = await wpLogin(env.WP_LOGIN, env.WP_PASSWORD);
console.log('wp-login ok:', auth.ok);

const load = await ajaxPost(
  'load_content',
  { course_id: String(COURSE_ID), item_id: String(LESSON_ID) },
  auth.cookies,
  auth.nonces.load_content
);
console.log('load_content type:', typeof load, 'keys:', typeof load === 'object' ? Object.keys(load).slice(0, 8) : '');
console.log('load_content preview:', JSON.stringify(load).slice(0, 400));

const lessonRest = await restGet(`/masterstudy-lms/v2/lessons/${LESSON_ID}`, auth.cookies, auth.wpRestNonce);
console.log('REST lesson status:', lessonRest.status, JSON.stringify(lessonRest.data).slice(0, 300));

const quizRest = await restGet(`/masterstudy-lms/v2/quizzes/${QUIZ_ID}/questions`, auth.cookies, auth.wpRestNonce);
console.log('REST quiz status:', quizRest.status, JSON.stringify(quizRest.data).slice(0, 400));

const quizAjax = await ajaxPost(
  'start_quiz',
  { course_id: String(COURSE_ID), item_id: String(QUIZ_ID) },
  auth.cookies,
  auth.nonces.start_quiz
);
console.log('start_quiz preview:', JSON.stringify(quizAjax).slice(0, 400));
