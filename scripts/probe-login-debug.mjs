import fs from 'fs';

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

function parseCookies(res) {
  if (!res.headers.getSetCookie) return '';
  return res.headers.getSetCookie().map((c) => c.split(';')[0]).join('; ');
}

const env = loadEnv();
const login = env.WP_LOGIN;
const password = env.WP_PASSWORD;
console.log('login len', login?.length, 'pass len', password?.length);

const pageRes = await fetch('https://bridge-academy.vn/en/courses-3/general-course/6392', {
  headers: { 'User-Agent': 'Mozilla/5.0' },
});
const html = await pageRes.text();
const cookies = parseCookies(pageRes);
const nonces = extractJsonAfterMarker(html, 'stm_lms_nonces') || {};
console.log('nonce keys', Object.keys(nonces).slice(0, 10));
console.log('stm_lms_login nonce', nonces.stm_lms_login?.slice(0, 12));

// Method 1: ajax with nonce
const body1 = new URLSearchParams({
  action: 'stm_lms_login',
  user_login: login,
  user_password: password,
  remember: '1',
  nonce: nonces.stm_lms_login || '',
});
console.log('body1 keys', [...body1.keys()]);
const res1 = await fetch('https://bridge-academy.vn/wp-admin/admin-ajax.php', {
  method: 'POST',
  body: body1,
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    Cookie: cookies,
    Referer: 'https://bridge-academy.vn/en/courses-3/general-course/6392',
    Origin: 'https://bridge-academy.vn',
    'User-Agent': 'Mozilla/5.0',
  },
});
console.log('ajax login:', (await res1.text()).slice(0, 400));

// Method 2: wp-login.php
const body2 = new URLSearchParams({
  log: login,
  pwd: password,
  'wp-submit': 'Log In',
  redirect_to: 'https://bridge-academy.vn/en/courses-3/general-course/6392',
  testcookie: '1',
});
const res2 = await fetch('https://bridge-academy.vn/wp-login.php', {
  method: 'POST',
  body: body2,
  redirect: 'manual',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    Cookie: `${cookies}; wordpress_test_cookie=WP%20Cookie%20check`,
    Referer: 'https://bridge-academy.vn/wp-login.php',
    Origin: 'https://bridge-academy.vn',
    'User-Agent': 'Mozilla/5.0',
  },
});
const wpCookies = parseCookies(res2);
console.log('wp-login status', res2.status, 'location', res2.headers.get('location')?.slice(0, 80));
console.log('wp-login cookies', wpCookies.slice(0, 120));

// Method 3: REST login endpoints
for (const [url, body] of [
  ['https://bridge-academy.vn/en/wp-json/masterstudy-lms/v2/login', { login, password }],
  ['https://bridge-academy.vn/en/wp-json/masterstudy-lms/v2/auth/login', { email: login, password }],
]) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  console.log(url.split('/wp-json')[1], res.status, (await res.text()).slice(0, 200));
}
