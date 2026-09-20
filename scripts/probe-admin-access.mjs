import fs from 'fs';

const BASE = 'https://bridge-academy.vn';
const COURSE_ID = 6382;
const LESSON_ID = 6392;
const QUIZ_ID = 6393;

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
      'User-Agent': 'Mozilla/5.0',
    },
  });
  const cookies = mergeCookies(pageCookies, parseCookies(loginRes));
  const ok = loginRes.status === 302;
  const lessonRes = await fetch(`${BASE}/en/courses-3/general-course/${LESSON_ID}`, {
    headers: { Cookie: cookies, 'User-Agent': 'Mozilla/5.0' },
  });
  const html = await lessonRes.text();
  return {
    ok,
    cookies: mergeCookies(cookies, parseCookies(lessonRes)),
    nonces: extractJsonAfterMarker(html, 'stm_lms_nonces') || {},
    wpRestNonce: html.match(/wp_rest_nonce":"([^"]+)"/)?.[1] || '',
  };
}

async function restGet(path, cookies, wpRestNonce) {
  const res = await fetch(`${BASE}/en/wp-json${path}`, {
    headers: { Cookie: cookies, 'X-WP-Nonce': wpRestNonce, Accept: 'application/json' },
  });
  const text = await res.text();
  try {
    return { status: res.status, data: JSON.parse(text) };
  } catch {
    return { status: res.status, data: text.slice(0, 300) };
  }
}

async function ajaxPost(action, fields, cookies, nonce) {
  const body = new URLSearchParams({ action, ...fields });
  if (nonce) body.set('nonce', nonce);
  const res = await fetch(`${BASE}/wp-admin/admin-ajax.php`, {
    method: 'POST',
    body,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Cookie: cookies,
      Referer: `${BASE}/en/courses-3/general-course/${LESSON_ID}`,
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

const env = loadEnv();
const auth = await wpLogin(env.WP_LOGIN, env.WP_PASSWORD);
console.log('login ok:', auth.ok, 'rest nonce:', auth.wpRestNonce.slice(0, 8));

const endpoints = [
  `/masterstudy-lms/v2/lessons/${LESSON_ID}`,
  `/masterstudy-lms/v2/quizzes/${QUIZ_ID}`,
  `/masterstudy-lms/v2/quizzes/${QUIZ_ID}/questions`,
  `/masterstudy-lms/v2/courses/${COURSE_ID}/curriculum`,
  `/masterstudy-lms/v2/course-builder/${COURSE_ID}`,
  `/wp/v2/stm-lessons/${LESSON_ID}`,
  `/wp/v2/stm-quizzes/${QUIZ_ID}`,
  `/wp/v2/posts/${LESSON_ID}?context=edit`,
];

for (const path of endpoints) {
  const r = await restGet(path, auth.cookies, auth.wpRestNonce);
  const preview = JSON.stringify(r.data).slice(0, 250);
  console.log(`\n${path} => ${r.status}`);
  console.log(preview);
}

const load = await ajaxPost(
  'load_content',
  { course_id: String(COURSE_ID), item_id: String(LESSON_ID) },
  auth.cookies,
  auth.nonces.load_content
);
console.log('\nload_content =>', typeof load, JSON.stringify(load).slice(0, 300));

const quiz = await ajaxPost(
  'start_quiz',
  { course_id: String(COURSE_ID), item_id: String(QUIZ_ID) },
  auth.cookies,
  auth.nonces.start_quiz
);
console.log('start_quiz =>', typeof quiz, JSON.stringify(quiz).slice(0, 400));
