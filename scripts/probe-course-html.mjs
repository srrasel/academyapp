const url = 'https://bridge-academy.vn/en/courses-3/general-course/';
const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
const html = await res.text();

// Extract stm_lms_vars
const varsIdx = html.indexOf('stm_lms_vars');
if (varsIdx >= 0) {
  console.log('stm_lms_vars context:', html.slice(varsIdx, varsIdx + 4000).replace(/\s+/g, ' ').slice(0, 2000));
}

// Look for curriculum JSON embedded
const patterns = [
  /curriculum[^:]*:\s*(\[[\s\S]{0,500})/gi,
  /"materials"\s*:\s*(\[[\s\S]{0,500})/gi,
  /course_materials[^"']{0,100}/gi,
  /lms_course_id[^"']{0,80}/gi,
  /6382/g,
];

for (const re of patterns) {
  const m = [...html.matchAll(re)].slice(0, 2);
  if (m.length) console.log('\n', re.source.slice(0,30), m.map(x=> (x[1]||x[0]).slice(0,200)).join(' | '));
}

// Check lesson page for actual content div
const lessonId = '6392';
const lres = await fetch(`https://bridge-academy.vn/en/courses-3/general-course/${lessonId}`, { headers: { 'User-Agent': 'Mozilla/5.0' } });
const lhtml = await lres.text();

const contentSelectors = [
  'stm-lms-course__material-content',
  'stm-lms-lesson_content',
  'entry-content',
  'lms-lesson-content',
  'masterstudy-lesson',
  'wp-block-post-content',
  'stm_lms_lesson_content',
];

for (const sel of contentSelectors) {
  const idx = lhtml.indexOf(sel);
  if (idx >= 0) console.log('\nFound', sel, 'at', idx, ':', lhtml.slice(idx, idx+400).replace(/\s+/g,' ').slice(0,300));
}

// Search for video URLs anywhere in lesson page
const media = [...lhtml.matchAll(/https?:\/\/[^"'\s<>]+\.(?:mp4|m3u8|webm)[^"'\s<>]*/gi)];
console.log('\nDirect media URLs:', media.length, media.slice(0,3).map(m=>m[0]));

const embeds = [...lhtml.matchAll(/(?:youtube\.com\/embed|player\.vimeo\.com|video\.php\?h=)[^"'\s<>]+/gi)];
console.log('Embeds:', embeds.length, embeds.slice(0,3).map(m=>m[0]));

// nonce for API
const nonce = lhtml.match(/stm_lms_pro_nonces[^}]{0,300}/);
if (nonce) console.log('\nNonces:', nonce[0].slice(0,300));
