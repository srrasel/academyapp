import fs from 'fs';

const BASE = 'https://bridge-academy.vn';
const COURSE_ID = 6382;

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

async function wpLogin(login, password) {
  const pageRes = await fetch(`${BASE}/en/courses-3/general-course/6392`, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
  });
  const pageCookies = parseCookies(pageRes);
  const body = new URLSearchParams({
    log: login,
    pwd: password,
    'wp-submit': 'Log In',
    redirect_to: `${BASE}/en/courses-3/general-course/6392`,
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
  const lessonRes = await fetch(`${BASE}/en/courses-3/general-course/6392`, {
    headers: { Cookie: cookies, 'User-Agent': 'Mozilla/5.0' },
  });
  const html = await lessonRes.text();
  return {
    cookies: mergeCookies(cookies, parseCookies(lessonRes)),
    wpRestNonce: html.match(/wp_rest_nonce":"([^"]+)"/)?.[1] || '',
  };
}

const env = loadEnv();
const auth = await wpLogin(env.WP_LOGIN, env.WP_PASSWORD);
const res = await fetch(`${BASE}/en/wp-json/masterstudy-lms/v2/courses/${COURSE_ID}/curriculum`, {
  headers: { Cookie: auth.cookies, 'X-WP-Nonce': auth.wpRestNonce, Accept: 'application/json' },
});
const data = await res.json();

const quizzes = data.materials.filter((m) => m.post_type === 'stm-quizzes' || m.lesson_type === 'quiz');
const texts = data.materials.filter((m) => m.post_type === 'stm-lessons');
console.log('total materials', data.materials.length);
console.log('quizzes', quizzes.length, 'text lessons', texts.length);
console.log('first 5 quizzes', JSON.stringify(quizzes.slice(0, 5), null, 2));
console.log('warm welcome', data.materials.filter((m) => /warm welcome/i.test(m.title)));

// Try quiz REST for first quiz post_id
if (quizzes[0]) {
  const qid = quizzes[0].post_id;
  for (const path of [
    `/masterstudy-lms/v2/quizzes/${qid}`,
    `/masterstudy-lms/v2/quizzes/${qid}/questions`,
    `/masterstudy-lms/v2/lessons/${qid}`,
  ]) {
    const r = await fetch(`${BASE}/en/wp-json${path}`, {
      headers: { Cookie: auth.cookies, 'X-WP-Nonce': auth.wpRestNonce, Accept: 'application/json' },
    });
    const text = await r.text();
    console.log(`\n${path} => ${r.status}`, text.slice(0, 500));
  }
}
