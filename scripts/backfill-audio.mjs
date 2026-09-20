/**
 * Backfill lesson audio URLs from bundled HTML and/or bridge-academy.vn.
 *
 * Usage:
 *   npm run backfill:audio              # scan local HTML only
 *   npm run backfill:audio -- --fetch   # also fetch from WordPress (needs .env)
 *   npm run backfill:audio -- --write   # save lessons.json
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pickLessonAudioUrl } from './lib/audio-extract.mjs';
import { fetchLessonContent, wpLogin, loadEnv } from './import-bridge-content.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const LESSONS_PATH = path.join(ROOT, 'src', 'data', 'imported', 'lessons.json');
const DELAY_MS = 200;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function countAudio(lessons) {
  return lessons.filter((lesson) => lesson.audioUrl?.trim()).length;
}

function applyLocalAudio(lesson) {
  const audioUrl = pickLessonAudioUrl(lesson.htmlContent, lesson.content, lesson.body);
  if (!audioUrl || lesson.audioUrl?.trim() === audioUrl) return lesson;

  return {
    ...lesson,
    audioUrl,
    ...(lesson.type === 'text' && !lesson.videoUrl ? { type: 'audio' } : {}),
  };
}

async function main() {
  const shouldWrite = process.argv.includes('--write');
  const shouldFetch = process.argv.includes('--fetch');
  const limitArg = process.argv.find((arg) => arg.startsWith('--limit='));
  const limit = limitArg ? Number(limitArg.split('=')[1]) : null;

  const lessons = JSON.parse(fs.readFileSync(LESSONS_PATH, 'utf8'));
  const before = countAudio(lessons);
  console.log(`Lessons loaded: ${lessons.length}`);
  console.log(`Audio URLs before: ${before}`);

  let updated = lessons.map((lesson) => {
    if (lesson.type === 'quiz') return lesson;
    return applyLocalAudio(lesson);
  });

  let afterLocal = countAudio(updated);
  console.log(`Audio URLs after local HTML scan: ${afterLocal}`);

  if (shouldFetch) {
    const env = loadEnv();
    const login = env.WP_LOGIN || env.WP_EMAIL || '';
    const password = env.WP_PASSWORD || '';

    if (!login || !password) {
      console.error('Missing WP_LOGIN and WP_PASSWORD in .env for --fetch');
      process.exit(1);
    }

    console.log('Logging in to bridge-academy.vn...');
    const auth = await wpLogin(login, password);
    if (!auth.ok) {
      console.error('WordPress login failed');
      process.exit(1);
    }

    const targets = updated.filter(
      (lesson) => lesson.type !== 'quiz' && !lesson.audioUrl?.trim()
    );
    const slice = limit ? targets.slice(0, limit) : targets;
    console.log(`Fetching audio for ${slice.length} lessons...`);

    for (let i = 0; i < slice.length; i += 1) {
      const lesson = slice[i];
      process.stdout.write(`\r[${i + 1}/${slice.length}] ${lesson.title.slice(0, 42).padEnd(42)}`);

      const enriched = await fetchLessonContent(lesson, auth);
      const index = updated.findIndex((item) => String(item.id) === String(lesson.id));
      if (index >= 0) {
        updated[index] = {
          ...updated[index],
          ...enriched,
          audioUrl: enriched.audioUrl || updated[index].audioUrl || '',
        };
      }

      await sleep(DELAY_MS);
    }
    console.log('');
  }

  const after = countAudio(updated);
  console.log(`Audio URLs after: ${after} (+${after - before})`);

  if (shouldWrite) {
    fs.writeFileSync(LESSONS_PATH, JSON.stringify(updated, null, 2));
    console.log(`Saved ${LESSONS_PATH}`);
    console.log('Run: npm run sync:translations');
  } else {
    console.log('Dry run — add --write to save lessons.json');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
