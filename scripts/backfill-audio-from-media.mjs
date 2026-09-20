/**
 * Match WordPress media library audio files to lessons by title,
 * then write audioUrl into src/data/imported/lessons.json.
 *
 * Usage:
 *   node scripts/backfill-audio-from-media.mjs
 *   node scripts/backfill-audio-from-media.mjs --write
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const LESSONS_PATH = path.join(ROOT, 'src', 'data', 'imported', 'lessons.json');
const TRANSLATION_LANGS = ['zh', 'vi', 'id', 'th', 'km'];
const BASE = 'https://bridge-academy.vn';

const MANUAL_ALIASES = {
  'hearing and touch': 'https://bridge-academy.vn/wp-content/uploads/2025/04/Hearing-Touch.mp3',
  'smell and taste': 'https://bridge-academy.vn/wp-content/uploads/2025/04/Smell-Taste.mp3',
  'myths and facts': 'https://bridge-academy.vn/wp-content/uploads/2025/04/myth-fact.mp3',
};

/** Unit intros that have dedicated numbered files in WP media. */
const INTRODUCTION_BY_UNIT = {
  '3': 'https://bridge-academy.vn/wp-content/uploads/2025/04/3.1.mp3', // Sleep
  '4': 'https://bridge-academy.vn/wp-content/uploads/2025/04/2.1-1.mp3', // Brain (legacy numbering)
};

function decodeEntities(value) {
  return String(value || '')
    .replace(/&amp;/gi, '&')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, num) => String.fromCharCode(Number(num)));
}

function normalizeTitle(value) {
  return decodeEntities(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\u2018\u2019\u201a\u2032`']/g, '')
    .replace(/\.mp3$/i, '')
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function isAsciiHeavy(value) {
  const text = decodeEntities(value);
  if (!text) return false;
  const ascii = text.replace(/[^\x00-\x7F]/g, '').length;
  return ascii / text.length >= 0.8;
}

function sourceUrl(item) {
  const candidates = [item?.source_url, item?.guid?.rendered, item?.filename];
  for (const raw of candidates) {
    if (!raw || typeof raw !== 'string') continue;
    let url = raw.replace(/\\\//g, '/').trim();
    if (!/^https?:\/\//i.test(url) && /\.(mp3|m4a|wav|ogg)$/i.test(url)) {
      url = `${BASE}/wp-content/uploads/${url}`;
    }
    if (/\.(mp3|m4a|wav|ogg)(\?|$)/i.test(url)) return url.split('?')[0];
  }
  return '';
}

async function fetchAllAudioMedia() {
  const items = [];
  let page = 1;
  while (true) {
    const url = `${BASE}/wp-json/wp/v2/media?media_type=audio&per_page=100&page=${page}`;
    const res = await fetch(url, {
      headers: { Accept: 'application/json', 'User-Agent': 'Mozilla/5.0 BridgeAcademyApp/1.0' },
    });
    if (res.status === 400) break;
    if (!res.ok) throw new Error(`Media fetch failed: ${res.status} ${await res.text()}`);
    const batch = await res.json();
    if (!Array.isArray(batch) || batch.length === 0) break;
    items.push(...batch);
    const totalPages = Number(res.headers.get('x-wp-totalpages') || 1);
    console.log(`Fetched media page ${page}/${totalPages} (${items.length} files)`);
    if (page >= totalPages) break;
    page += 1;
  }
  return items;
}

function buildAudioIndex(mediaItems) {
  const byTitle = new Map();
  for (const item of mediaItems) {
    const url = sourceUrl(item);
    if (!url) continue;
    const entry = {
      url,
      id: item.id,
      title: decodeEntities(item?.title?.rendered || ''),
      date: item.date || '',
      ascii: isAsciiHeavy(item?.title?.rendered || '') || isAsciiHeavy(path.basename(url)),
    };
    const keys = new Set(
      [
        normalizeTitle(item?.title?.rendered),
        normalizeTitle(item?.slug),
        normalizeTitle(path.basename(url, path.extname(url))),
      ].filter(Boolean)
    );
    for (const key of keys) {
      if (!byTitle.has(key)) byTitle.set(key, []);
      byTitle.get(key).push(entry);
    }
  }
  return byTitle;
}

function rankEntries(entries, preferAscii) {
  return entries.slice().sort((a, b) => {
    if (preferAscii && a.ascii !== b.ascii) return a.ascii ? -1 : 1;
    return String(b.date).localeCompare(String(a.date));
  });
}

function propagateAudioToTranslations(englishLessons) {
  const byId = new Map(englishLessons.map((lesson) => [String(lesson.id), lesson]));
  for (const lang of TRANSLATION_LANGS) {
    const filePath = path.join(ROOT, 'src', 'data', 'translations', lang, 'lessons.json');
    if (!fs.existsSync(filePath)) continue;
    const lessons = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    let updatedCount = 0;
    const updated = lessons.map((lesson) => {
      const english = byId.get(String(lesson.id));
      if (!english?.audioUrl) return lesson;
      if (lesson.audioUrl === english.audioUrl && lesson.type === english.type) return lesson;
      updatedCount += 1;
      return {
        ...lesson,
        audioUrl: english.audioUrl,
        ...(english.type === 'audio' && lesson.type === 'text' && !lesson.videoUrl
          ? { type: 'audio' }
          : {}),
      };
    });
    fs.writeFileSync(filePath, JSON.stringify(updated, null, 2));
    console.log(`Updated ${lang} translations: ${updatedCount} lessons`);
  }
}

async function main() {
  const write = process.argv.includes('--write');
  const lessons = JSON.parse(fs.readFileSync(LESSONS_PATH, 'utf8'));
  const media = await fetchAllAudioMedia();
  const index = buildAudioIndex(media);

  console.log(`Audio media files: ${media.length}`);
  console.log(`Indexed title keys: ${index.size}`);

  const usedUrls = new Set();
  let matched = 0;
  const unmatched = [];
  const assignments = [];

  const updated = lessons.map((lesson) => {
    if (lesson.type === 'quiz') return lesson;

    const titleKey = normalizeTitle(lesson.title);
    const preferAscii = isAsciiHeavy(lesson.title);

    if (titleKey === 'introduction') {
      const introUrl = INTRODUCTION_BY_UNIT[String(lesson.unitId)];
      if (introUrl && !usedUrls.has(introUrl)) {
        usedUrls.add(introUrl);
        matched += 1;
        assignments.push({ id: lesson.id, title: lesson.title, audioUrl: introUrl, via: 'intro-unit' });
        return {
          ...lesson,
          audioUrl: introUrl,
          ...(lesson.type === 'text' && !lesson.videoUrl ? { type: 'audio' } : {}),
        };
      }
      unmatched.push({ id: lesson.id, title: lesson.title, reason: 'generic-introduction' });
      return lesson;
    }

    if (MANUAL_ALIASES[titleKey]) {
      const url = MANUAL_ALIASES[titleKey];
      usedUrls.add(url);
      matched += 1;
      assignments.push({ id: lesson.id, title: lesson.title, audioUrl: url, via: 'alias' });
      return {
        ...lesson,
        audioUrl: url,
        ...(lesson.type === 'text' && !lesson.videoUrl ? { type: 'audio' } : {}),
      };
    }

    const key = normalizeTitle(lesson.title);
    const candidates = key ? rankEntries(index.get(key) || [], preferAscii) : [];
    const hit = candidates.find((entry) => !usedUrls.has(entry.url)) || candidates[0];
    if (!hit) {
      unmatched.push({ id: lesson.id, title: lesson.title, reason: 'no-exact-title' });
      return lesson;
    }

    usedUrls.add(hit.url);
    matched += 1;
    assignments.push({ id: lesson.id, title: lesson.title, audioUrl: hit.url, via: 'exact' });
    return {
      ...lesson,
      audioUrl: hit.url,
      ...(lesson.type === 'text' && !lesson.videoUrl ? { type: 'audio' } : {}),
    };
  });

  console.log(`Matched lessons: ${matched}`);
  console.log(`Unmatched non-quiz: ${unmatched.length}`);
  unmatched.slice(0, 50).forEach((item) => {
    console.log(`  [${item.id}] ${item.title} (${item.reason})`);
  });

  const withAudio = updated.filter((l) => l.audioUrl?.trim()).length;
  console.log(`Lessons with audioUrl after: ${withAudio}`);

  fs.mkdirSync(path.join(ROOT, '.tmp'), { recursive: true });
  fs.writeFileSync(
    path.join(ROOT, '.tmp', 'audio-match-report.json'),
    JSON.stringify({ matched, unmatched, assignments }, null, 2)
  );

  if (write) {
    fs.writeFileSync(LESSONS_PATH, JSON.stringify(updated, null, 2));
    console.log(`Saved ${LESSONS_PATH}`);
    propagateAudioToTranslations(updated);
    console.log('Next: npm run sync:translations');
  } else {
    console.log('Dry run — add --write to save lessons.json');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
