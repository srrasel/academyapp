const COURSE_ID = 6382;
const LESSON_ID = 6392;
const AJAX = 'https://bridge-academy.vn/wp-admin/admin-ajax.php';

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

const pageRes = await fetch('https://bridge-academy.vn/en/courses-3/general-course/6392');
const html = await pageRes.text();
const nonces = extractJsonAfterMarker(html, 'stm_lms_nonces') || {};

async function tryAjax(action, fields) {
  const body = new URLSearchParams({ action, ...fields });
  const res = await fetch(AJAX, {
    method: 'POST',
    body,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  const text = await res.text();
  return { status: res.status, len: text.length, preview: text.slice(0, 250) };
}

const action = 'stm_lms_get_curriculum_v2';
const nonce = nonces[action];
const variants = [
  { course_id: String(COURSE_ID), nonce },
  { course_id: String(COURSE_ID), security: nonce },
  { course_id: String(COURSE_ID), id: String(COURSE_ID), nonce },
  { id: String(COURSE_ID), nonce },
  { course_id: String(COURSE_ID), lang: 'en', nonce },
];

for (const fields of variants) {
  const r = await tryAjax(action, fields);
  console.log(fields, '=>', r);
}

const loadAction = 'load_content';
const loadVariants = [
  { course_id: String(COURSE_ID), item_id: String(LESSON_ID), nonce: nonces[loadAction] },
  { course_id: String(COURSE_ID), lesson_id: String(LESSON_ID), nonce: nonces[loadAction] },
  { course_id: String(COURSE_ID), post_id: String(LESSON_ID), security: nonces[loadAction] },
  { id: String(LESSON_ID), course_id: String(COURSE_ID), security: nonces[loadAction] },
];

for (const fields of loadVariants) {
  const r = await tryAjax(loadAction, fields);
  console.log('load', fields, '=>', r);
}
