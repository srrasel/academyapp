import fs from 'fs';

const BASE = 'https://bridge-academy.vn';
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
  return mergeCookies(pageCookies, parseCookies(loginRes));
}

async function fetchPage(url, cookies) {
  const res = await fetch(url, { headers: { Cookie: cookies, 'User-Agent': 'Mozilla/5.0' } });
  return { html: await res.text(), status: res.status, url: res.url };
}

const env = loadEnv();
const cookies = await wpLogin(env.WP_LOGIN, env.WP_PASSWORD);

for (const [label, id] of [['text lesson', LESSON_ID], ['quiz', QUIZ_ID]]) {
  const page = await fetchPage(`${BASE}/en/courses-3/general-course/${id}`, cookies);
  console.log(`\n=== ${label} ${id} status ${page.status} ===`);
  console.log('final url:', page.url);
  console.log('logged in markers:', {
    signOut: /sign out|log out|logout/i.test(page.html),
    startLesson: /start lesson|continue|lesson content|stm-lms-course__material/i.test(page.html),
    paywall: /get course|add to cart|sign in to account/i.test(page.html),
  });

  const contentMatch = page.html.match(/stm-lms-course__material-content[^>]*>([\s\S]{0,2000})/i);
  console.log('material content preview:', contentMatch?.[1]?.replace(/<[^>]+>/g, ' ').slice(0, 300));

  const quizMatch = page.html.match(/quiz[^>]*>([\s\S]{0,1500})/i);
  console.log('quiz-ish preview:', quizMatch?.[0]?.replace(/<[^>]+>/g, ' ').slice(0, 300));

  const scripts = [...page.html.matchAll(/var\s+(\w+)\s*=\s*(\{[\s\S]{20,500}?\});/g)].slice(0, 5);
  for (const m of scripts) console.log('script var', m[1], m[2].slice(0, 120));
}

// Try both email variants
for (const email of ['testusser@gmail.com', 'testuser@gmail.com']) {
  const c = await wpLogin(email, env.WP_PASSWORD);
  const p = await fetchPage(`${BASE}/en/courses-3/general-course/${LESSON_ID}`, c);
  console.log(`\nemail ${email}: paywall=${/get course|sign in to account/i.test(p.html)} loggedIn=${/logout|sign out/i.test(p.html)}`);
}
