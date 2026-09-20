import fs from 'fs';

const BASE = 'https://bridge-academy.vn';
const COURSE_ID = 6382;
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
  const pageRes = await fetch(`${BASE}/en/courses-3/general-course/${QUIZ_ID}`, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
  });
  const pageCookies = parseCookies(pageRes);
  const body = new URLSearchParams({
    log: login,
    pwd: password,
    'wp-submit': 'Log In',
    redirect_to: `${BASE}/en/courses-3/general-course/${QUIZ_ID}`,
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
  const lessonRes = await fetch(`${BASE}/en/courses-3/general-course/${QUIZ_ID}`, {
    headers: { Cookie: cookies, 'User-Agent': 'Mozilla/5.0' },
  });
  const html = await lessonRes.text();
  return {
    cookies: mergeCookies(cookies, parseCookies(lessonRes)),
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
    return { status: res.status, data: text.slice(0, 500) };
  }
}

const env = loadEnv();
const auth = await wpLogin(env.WP_LOGIN, env.WP_PASSWORD);

const curriculum = await restGet(`/masterstudy-lms/v2/courses/${COURSE_ID}/curriculum`, auth.cookies, auth.wpRestNonce);
console.log('curriculum keys', Object.keys(curriculum.data));
console.log('sections count', curriculum.data.sections?.length);
console.log('materials sample', JSON.stringify(curriculum.data.materials?.slice?.(0, 3) || curriculum.data).slice(0, 800));

// Try quiz as lesson endpoint
for (const path of [
  `/masterstudy-lms/v2/quizzes/${QUIZ_ID}`,
  `/masterstudy-lms/v2/lessons/${QUIZ_ID}`,
  `/masterstudy-lms/v2/quiz/${QUIZ_ID}`,
  `/masterstudy-lms/v2/quiz/${QUIZ_ID}/questions`,
  `/masterstudy-lms/v2/quizzes/${QUIZ_ID}/question`,
]) {
  const r = await restGet(path, auth.cookies, auth.wpRestNonce);
  console.log(`\n${path} => ${r.status}`, JSON.stringify(r.data).slice(0, 350));
}

// curriculum section materials endpoint
for (const path of [
  `/masterstudy-lms/v2/courses/${COURSE_ID}/materials`,
  `/masterstudy-lms/v2/curriculum/${COURSE_ID}`,
  `/masterstudy-lms/v2/courses/${COURSE_ID}/sections`,
]) {
  const r = await restGet(path, auth.cookies, auth.wpRestNonce);
  console.log(`\n${path} => ${r.status}`, JSON.stringify(r.data).slice(0, 350));
}

// fetch quiz page html for embedded data
const page = await fetch(`${BASE}/en/courses-3/general-course/${QUIZ_ID}`, {
  headers: { Cookie: auth.cookies, 'User-Agent': 'Mozilla/5.0' },
});
const html = await page.text();
const quizData = html.match(/quiz_data\s*=\s*(\{[\s\S]*?\});/);
const stmQuiz = html.match(/stm_lms_quiz[^=]*=\s*(\{[\s\S]*?\});/);
console.log('\nquiz_data found', !!quizData);
console.log('stm_lms_quiz found', !!stmQuiz);
const jsonVars = [...html.matchAll(/(?:var|window\.)\s*(\w+)\s*=\s*(\{[\s\S]{30,800}?\});/g)].slice(0, 15);
for (const m of jsonVars) {
  if (/quiz|question|lms/i.test(m[1])) console.log('var', m[1], m[2].slice(0, 200));
}
