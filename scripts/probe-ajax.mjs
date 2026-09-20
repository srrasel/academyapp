const lessonId = '6392';
const url = `https://bridge-academy.vn/en/courses-3/general-course/${lessonId}`;
const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
const html = await res.text();

const ajaxActions = [...new Set([...html.matchAll(/action['"]\s*:\s*['"]([^'"]+)['"]/gi)].map((m) => m[1]))]
  .filter((a) => /lms|lesson|course|quiz|stm|master/i.test(a));
console.log('ajax actions:', ajaxActions);

const stmActions = [...new Set([...html.matchAll(/stm_[a-z_]+/gi)].map((m) => m[0]))].slice(0, 40);
console.log('stm_ refs:', stmActions);

// Look for fetch URL in inline scripts
const fetchUrls = [...new Set([...html.matchAll(/fetch\(\s*['"]([^'"]+)['"]/gi)].map((m) => m[1]))]
  .filter((u) => /lms|lesson|course|wp-json/i.test(u));
console.log('fetch urls:', fetchUrls);

// Check for React/Vue initial state
const statePatterns = [
  /window\.__INITIAL_STATE__\s*=\s*(\{[\s\S]{0,500})/,
  /window\.stm_lms[^=]*=\s*(\{[\s\S]{0,500})/,
  /"lesson_content"[^}]{0,200}/gi,
  /"content"\s*:\s*"/gi,
];

for (const re of statePatterns) {
  const m = html.match(re);
  if (m) console.log('state match:', (m[1] || m[0]).slice(0, 300));
}

// Try admin-ajax with common stm actions
const ajaxUrl = 'https://bridge-academy.vn/wp-admin/admin-ajax.php';
const actions = ['stm_lms_load_lesson', 'stm_get_lesson', 'masterstudy_load_lesson', 'stm_lms_get_lesson'];
for (const action of actions) {
  const body = new URLSearchParams({ action, course_id: '6382', lesson_id: lessonId, item_id: lessonId });
  const ar = await fetch(ajaxUrl, { method: 'POST', body, headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
  const text = await ar.text();
  if (text && text !== '0' && !text.includes('not found')) {
    console.log('ajax', action, ar.status, text.slice(0, 200));
  }
}
