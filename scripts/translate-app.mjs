/**
 * Pre-translate UI strings and course data via Google Cloud Translation API.
 * Saves bundled JSON for offline use in the app (no runtime API calls).
 *
 * Usage:
 *   npm run translate
 *   npm run translate -- --lang vi
 *   npm run translate -- --ui-only
 *   npm run translate -- --course-only
 *
 * Requires GOOGLE_TRANSLATE_API_KEY in .env (scripts only — not bundled in the app).
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

const TARGET_LANGS = [
  { id: 'zh', googleCode: 'zh-CN' },
  { id: 'vi', googleCode: 'vi' },
  { id: 'id', googleCode: 'id' },
  { id: 'th', googleCode: 'th' },
  { id: 'km', googleCode: 'km' },
];

const BATCH_SIZE = 40;
const DELAY_MS = 250;

function loadEnv() {
  const envPath = path.join(ROOT, '.env');
  if (!fs.existsSync(envPath)) return {};
  const env = {};
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
  }
  return env;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function translateBatch(texts, target, apiKey, format = 'text') {
  const filtered = texts.map((t) => (t == null ? '' : String(t)));
  if (!filtered.length) return [];

  const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      q: filtered,
      target,
      source: 'en',
      format,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || `Translate API error (${res.status})`);
  }

  return data.data.translations.map((item) => item.translatedText);
}

async function translateStrings(texts, target, apiKey, format = 'text') {
  const results = [];
  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const chunk = texts.slice(i, i + BATCH_SIZE);
    const translated = await translateBatch(chunk, target, apiKey, format);
    results.push(...translated);
    if (i + BATCH_SIZE < texts.length) await sleep(DELAY_MS);
  }
  return results;
}

function splitHtmlChunks(html, maxLen = 4500) {
  if (!html || html.length <= maxLen) return [html];

  const chunks = [];
  let cursor = 0;
  while (cursor < html.length) {
    let end = Math.min(cursor + maxLen, html.length);
    if (end < html.length) {
      const slice = html.slice(cursor, end);
      const breakAt = Math.max(
        slice.lastIndexOf('</p>'),
        slice.lastIndexOf('</td>'),
        slice.lastIndexOf('</tr>'),
        slice.lastIndexOf('</div>'),
        slice.lastIndexOf('</li>')
      );
      if (breakAt > maxLen * 0.4) {
        end = cursor + breakAt + 4;
      }
    }
    chunks.push(html.slice(cursor, end));
    cursor = end;
  }
  return chunks;
}

async function translateHtml(html, target, apiKey) {
  const chunks = splitHtmlChunks(html);
  const parts = [];
  for (const chunk of chunks) {
    const [translated] = await translateBatch([chunk], target, apiKey, 'html');
    parts.push(translated);
    await sleep(DELAY_MS);
  }
  return parts.join('');
}

function collectLessonEntries(lessons) {
  const entries = [];

  lessons.forEach((lesson, index) => {
    ['title', 'about', 'meta', 'duration', 'content'].forEach((field) => {
      const value = lesson[field];
      if (typeof value === 'string' && value.trim()) {
        entries.push({ kind: 'field', index, field, value });
      }
    });

    (lesson.keyPoints || []).forEach((point, pointIndex) => {
      if (typeof point === 'string' && point.trim()) {
        entries.push({ kind: 'keyPoint', index, pointIndex, value: point });
      }
    });

    (lesson.questions || []).forEach((question, questionIndex) => {
      if (typeof question.question === 'string' && question.question.trim()) {
        entries.push({ kind: 'question', index, questionIndex, part: 'question', value: question.question });
      }
      (question.options || []).forEach((option, optionIndex) => {
        if (typeof option.text === 'string' && option.text.trim()) {
          entries.push({
            kind: 'option',
            index,
            questionIndex,
            optionIndex,
            value: option.text,
          });
        }
      });
      if (typeof question.explanation === 'string' && question.explanation.trim()) {
        entries.push({
          kind: 'explanation',
          index,
          questionIndex,
          value: question.explanation,
        });
      }
    });
  });

  return entries;
}

function applyLessonEntry(result, entry, translatedValue) {
  const lesson = result[entry.index];
  if (!lesson) return;

  if (entry.kind === 'field') {
    lesson[entry.field] = translatedValue;
    return;
  }

  if (entry.kind === 'keyPoint') {
    lesson.keyPoints[entry.pointIndex] = translatedValue;
    return;
  }

  const question = lesson.questions?.[entry.questionIndex];
  if (!question) return;

  if (entry.kind === 'question') {
    question.question = translatedValue;
    return;
  }

  if (entry.kind === 'option') {
    question.options[entry.optionIndex].text = translatedValue;
    return;
  }

  if (entry.kind === 'explanation') {
    question.explanation = translatedValue;
  }
}

async function translateLessonsFile(langId, googleCode, apiKey) {
  const enPath = path.join(ROOT, 'src/data/imported/lessons.json');
  const outDir = path.join(ROOT, `src/data/translations/${langId}`);
  fs.mkdirSync(outDir, { recursive: true });
  const source = JSON.parse(fs.readFileSync(enPath, 'utf8'));
  const result = JSON.parse(JSON.stringify(source));

  const entries = collectLessonEntries(source);
  console.log(`  lessons.json: ${entries.length} text strings`);
  const translatedEntries = await translateStrings(
    entries.map((entry) => entry.value),
    googleCode,
    apiKey
  );
  entries.forEach((entry, index) => applyLessonEntry(result, entry, translatedEntries[index]));

  const htmlLessons = source
    .map((lesson, index) => ({ lesson, index }))
    .filter(({ lesson }) => typeof lesson.htmlContent === 'string' && lesson.htmlContent.trim());

  console.log(`  lessons.json: ${htmlLessons.length} HTML lessons`);
  for (let i = 0; i < htmlLessons.length; i += 1) {
    const { lesson, index } = htmlLessons[i];
    console.log(`    html ${i + 1}/${htmlLessons.length}: ${lesson.title?.slice(0, 50) || lesson.id}`);
    result[index].htmlContent = await translateHtml(lesson.htmlContent, googleCode, apiKey);
  }

  fs.writeFileSync(path.join(outDir, 'lessons.json'), `${JSON.stringify(result, null, 2)}\n`);
}

function flattenStrings(obj, prefix = '', out = []) {
  if (typeof obj === 'string') {
    out.push({ path: prefix, value: obj });
    return out;
  }
  if (Array.isArray(obj)) {
    obj.forEach((item, index) => flattenStrings(item, `${prefix}[${index}]`, out));
    return out;
  }
  if (obj && typeof obj === 'object') {
    Object.entries(obj).forEach(([key, value]) => {
      const next = prefix ? `${prefix}.${key}` : key;
      flattenStrings(value, next, out);
    });
  }
  return out;
}

function setByPath(obj, pathStr, value) {
  const parts = pathStr.replace(/\[(\d+)\]/g, '.$1').split('.');
  let cursor = obj;
  for (let i = 0; i < parts.length - 1; i += 1) {
    const part = parts[i];
    if (cursor[part] === undefined) cursor[part] = Number.isInteger(Number(parts[i + 1])) ? [] : {};
    cursor = cursor[part];
  }
  cursor[parts[parts.length - 1]] = value;
}

async function translateUiLocale(langId, googleCode, apiKey) {
  const enPath = path.join(ROOT, 'src/i18n/locales/en.json');
  const outPath = path.join(ROOT, `src/i18n/locales/${langId}.json`);
  const source = JSON.parse(fs.readFileSync(enPath, 'utf8'));
  const flat = flattenStrings(source);
  const values = flat.map((item) => item.value);
  console.log(`  UI strings: ${values.length}`);
  const translated = await translateStrings(values, googleCode, apiKey);
  const result = JSON.parse(JSON.stringify(source));
  flat.forEach((item, index) => setByPath(result, item.path, translated[index]));
  fs.writeFileSync(outPath, `${JSON.stringify(result, null, 2)}\n`);
}

async function translateCourseFile(langId, googleCode, apiKey, fileName, stringPaths) {
  const enPath = path.join(ROOT, 'src/data/imported', fileName);
  const outDir = path.join(ROOT, `src/data/translations/${langId}`);
  fs.mkdirSync(outDir, { recursive: true });
  const source = JSON.parse(fs.readFileSync(enPath, 'utf8'));

  const entries = [];
  const items = Array.isArray(source) ? source : [source];

  items.forEach((item, index) => {
    stringPaths.forEach((field) => {
      const value = item[field];
      if (typeof value === 'string' && value.trim()) {
        entries.push({ index, field, value });
      }
    });
    if (item.learnings && Array.isArray(item.learnings)) {
      item.learnings.forEach((line, learningIndex) => {
        if (typeof line === 'string' && line.trim()) {
          entries.push({ index, field: 'learnings', learningIndex, value: line });
        }
      });
    }
  });

  const texts = entries.map((e) => e.value);
  console.log(`  ${fileName}: ${texts.length} strings`);
  const translated = await translateStrings(texts, googleCode, apiKey);
  const result = JSON.parse(JSON.stringify(source));
  const resultItems = Array.isArray(result) ? result : [result];

  entries.forEach((entry, i) => {
    if (entry.field === 'learnings') {
      resultItems[entry.index].learnings[entry.learningIndex] = translated[i];
    } else {
      resultItems[entry.index][entry.field] = translated[i];
    }
  });

  if (!Array.isArray(result) && resultItems[0]) {
    resultItems[0]._translated = true;
    resultItems[0]._locale = langId;
    fs.writeFileSync(path.join(outDir, fileName), `${JSON.stringify(resultItems[0], null, 2)}\n`);
    return;
  }

  fs.writeFileSync(path.join(outDir, fileName), `${JSON.stringify(result, null, 2)}\n`);
}

async function translateCoursePack(langId, googleCode, apiKey) {
  await translateCourseFile(langId, googleCode, apiKey, 'course.json', [
    'title',
    'subtitle',
    'description',
  ]);
  await translateCourseFile(langId, googleCode, apiKey, 'units.json', ['title', 'description']);
  await translateLessonsFile(langId, googleCode, apiKey);
}

async function main() {
  const env = loadEnv();
  const apiKey = env.GOOGLE_TRANSLATE_API_KEY;
  if (!apiKey) {
    console.error('Missing GOOGLE_TRANSLATE_API_KEY in .env');
    process.exit(1);
  }

  const args = process.argv.slice(2);
  const uiOnly = args.includes('--ui-only');
  const courseOnly = args.includes('--course-only');
  const langArg = args.find((a) => a.startsWith('--lang='))?.split('=')[1];
  const langs = langArg
    ? TARGET_LANGS.filter((l) => l.id === langArg)
    : TARGET_LANGS;

  if (!langs.length) {
    console.error('No matching languages. Use --lang=vi etc.');
    process.exit(1);
  }

  for (const lang of langs) {
    console.log(`\nTranslating → ${lang.id} (${lang.googleCode})`);
    if (!courseOnly) await translateUiLocale(lang.id, lang.googleCode, apiKey);
    if (!uiOnly) await translateCoursePack(lang.id, lang.googleCode, apiKey);
  }

  console.log('\nDone. Restart Expo: npx expo start -c');
  await import('./sync-translation-files.mjs');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
