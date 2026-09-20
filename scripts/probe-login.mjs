const AJAX = 'https://bridge-academy.vn/wp-admin/admin-ajax.php';

async function tryLogin(login, password) {
  const body = new URLSearchParams({
    action: 'stm_lms_login',
    login,
    password,
  });
  const res = await fetch(AJAX, {
    method: 'POST',
    body,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  const text = await res.text();
  console.log('stm_lms_login status', res.status);
  console.log('response', text.slice(0, 500));
  console.log('set-cookie', res.headers.get('set-cookie')?.slice(0, 200));
  return { res, text };
}

// Test structure with dummy creds
await tryLogin('sumaiyanemo@gmail.com', 'Bridge_admin2026');

// Try masterstudy v2 login if exists
const endpoints = [
  ['POST', 'https://bridge-academy.vn/en/wp-json/masterstudy-lms/v2/login', { login: 'x', password: 'y' }],
  ['POST', 'https://bridge-academy.vn/en/wp-json/masterstudy-lms/v2/auth/login', { email: 'x', password: 'y' }],
  ['POST', 'https://bridge-academy.vn/en/wp-json/stm-lms/v1/login', { login: 'x', password: 'y' }],
];

for (const [method, url, body] of endpoints) {
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  console.log('\n', url.split('/wp-json')[1], res.status, (await res.text()).slice(0, 150));
}
