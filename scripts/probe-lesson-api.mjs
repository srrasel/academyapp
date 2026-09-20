const lessonId = process.argv[2] || '6392';
const url = `https://bridge-academy.vn/en/courses-3/general-course/${lessonId}`;
const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 BridgeAcademyApp/1.0' } });
const html = await res.text();

console.log('url', url, 'len', html.length);

const apiPatterns = [
  /https?:\/\/[^"'\s]+(?:stm|lms|masterstudy|ms_lms)[^"'\s]*/gi,
  /\/wp-json\/[^"'\s]+/gi,
  /ajaxurl[^"']*"([^"']+)"/gi,
  /stm_lms_[a-z_]+/gi,
  /ms_lms_[a-z_]+/gi,
  /course_id[^"']{0,80}/gi,
  /lesson_id[^"']{0,80}/gi,
  /"item_id"\s*:\s*\d+/gi,
  /"post_id"\s*:\s*\d+/gi,
];

for (const re of apiPatterns) {
  const matches = [...new Set([...html.matchAll(re)].map((m) => m[1] || m[0]))].slice(0, 8);
  if (matches.length) console.log(re.source.slice(0, 40), '=>', matches.join('\n    '));
}

// Save snippet around stm_lms_vars or similar
const varsMatch = html.match(/stm_lms_vars\s*=\s*(\{[\s\S]{0,3000}\});/);
if (varsMatch) console.log('\nstm_lms_vars:', varsMatch[1].slice(0, 1500));

const msMatch = html.match(/ms_lms[^"']{0,30}[^;]{0,500}/gi);
if (msMatch) console.log('\nms_lms refs:', [...new Set(msMatch)].slice(0, 5));

// look for REST nonce
const restMatch = html.match(/wpApiSettings\s*=\s*(\{[\s\S]{0,500}\})/);
if (restMatch) console.log('\nwpApiSettings:', restMatch[1]);

// title in page
const title = html.match(/<title>([^<]+)/i);
console.log('\ntitle:', title?.[1]);

// check if lesson content is in JSON-LD or script type application/json
const jsonScripts = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)];
console.log('json-ld blocks:', jsonScripts.length);

const appJson = [...html.matchAll(/<script[^>]*type="application\/json"[^>]*>([\s\S]*?)<\/script>/gi)];
console.log('application/json blocks:', appJson.length);
appJson.slice(0, 2).forEach((m, i) => console.log(' json block', i, m[1].slice(0, 200)));
