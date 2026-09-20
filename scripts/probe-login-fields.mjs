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

const env = loadEnv();
const login = env.WP_LOGIN;
const password = env.WP_PASSWORD;

const page = await fetch('https://bridge-academy.vn/en/courses-3/general-course/6392');
const html = await page.text();
const nonces = extractJsonAfterMarker(html, 'stm_lms_nonces') || {};

const variants = [
  { user_login: login, user_password: password },
  { login, password },
  { email: login, password },
  { username: login, password },
];

for (const fields of variants) {
  const body = new URLSearchParams({
    action: 'stm_lms_login',
    remember: '1',
    nonce: nonces.stm_lms_login || '',
    ...fields,
  });
  const res = await fetch('https://bridge-academy.vn/wp-admin/admin-ajax.php', {
    method: 'POST',
    body,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  const text = await res.text();
  console.log(Object.keys(fields).join(','), '=>', text.slice(0, 300));
}
