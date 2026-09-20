/**
 * Import "Life Coach Base Course – General Psychology" from bridge-academy.vn
 *
 * Usage:
 *   node scripts/import-bridge-course.mjs
 *   node scripts/import-bridge-course.mjs --write   (save JSON to src/data/)
 *   node scripts/import-bridge-course.mjs --firebase  (requires admin/.env)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getLearnableUnitCount } from './lib/course-units.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const COURSE_URL = 'https://bridge-academy.vn/en/courses-3/general-course/';
const WP_COURSE_ID = 6382;
const APP_COURSE_ID = 'general-psychology';

async function fetchHtml() {
  const res = await fetch(COURSE_URL, {
    headers: { 'User-Agent': 'BridgeAcademyApp/1.0' },
  });
  if (!res.ok) throw new Error(`Failed to fetch course page (${res.status})`);
  return res.text();
}

function parseCurriculum(html) {
  const units = [];
  const lessons = [];

  const sectionRegex =
    /masterstudy-curriculum-list__section-title">([^<]+)<[\s\S]*?<ul class="masterstudy-curriculum-list__materials">([\s\S]*?)<\/ul>/g;

  let unitIndex = 0;
  let match;

  while ((match = sectionRegex.exec(html)) !== null) {
    unitIndex += 1;
    const sectionTitle = match[1].trim();
    const materialsHtml = match[2];

    const unitId = String(unitIndex);
    const unitLessons = [];

    const itemRegex =
      /href="[^"]+\/(\d+)"[\s\S]*?masterstudy-curriculum-list__order">\s*(\d+)\s*<[\s\S]*?lessons\/(text|quiz|video|audio)\.svg[\s\S]*?masterstudy-curriculum-list__title">\s*([^<]+?)<[\s\S]*?masterstudy-curriculum-list__meta">\s*([^<]+?)\s*</g;

    let itemMatch;
    let order = 0;
    while ((itemMatch = itemRegex.exec(materialsHtml)) !== null) {
      order += 1;
      const wpLessonId = itemMatch[1];
      const globalOrder = Number(itemMatch[2]);
      const iconType = itemMatch[3];
      const title = itemMatch[4].trim().replace(/\s+/g, ' ');
      const meta = itemMatch[5].trim();

      let type = 'text';
      if (iconType === 'quiz' || meta.toLowerCase().includes('question')) type = 'quiz';
      else if (iconType === 'audio') type = 'audio';
      else if (iconType === 'video') type = 'video';
      else type = 'text';

      const lesson = {
        id: wpLessonId,
        wpLessonId,
        unitId,
        courseId: APP_COURSE_ID,
        order,
        globalOrder,
        title,
        type,
        duration: type === 'quiz' ? meta : '10 min',
        meta,
        wpUrl: `https://bridge-academy.vn/en/courses-3/general-course/${wpLessonId}`,
        about: `Part of ${sectionTitle}.`,
        videoUrl: '',
        audioUrl: '',
        questions: type === 'quiz' ? [] : undefined,
      };

      unitLessons.push(lesson);
      lessons.push(lesson);
    }

    units.push({
      id: unitId,
      courseId: APP_COURSE_ID,
      order: unitIndex,
      title: sectionTitle,
      description: `Lessons from ${sectionTitle}.`,
      total: unitLessons.length,
      totalLessons: unitLessons.length,
      wpSectionTitle: sectionTitle,
    });
  }

  return { units, lessons };
}

function buildCourseMeta(units, lessons) {
  const quizCount = lessons.filter((l) => l.type === 'quiz').length;
  const textCount = lessons.filter((l) => l.type === 'text').length;
  const unitCount = getLearnableUnitCount(units);

  return {
    id: APP_COURSE_ID,
    wpCourseId: WP_COURSE_ID,
    title: 'Life Coach Base Course – General Psychology',
    subtitle: 'General Psychology — Bridge Academy',
    description:
      'The prerequisite course helps you grasp basic principles of human thinking, emotions and behavior. 20 structured units with audio, visuals, videos and interactive quizzes.',
    stats: {
      units: unitCount,
      lessons: lessons.length,
      hours: '3-4',
      quizzes: quizCount,
      lectures: textCount,
    },
    totalUnits: unitCount,
    learnings: [
      'History of Psychology in Coaching',
      'How the Brain Works',
      'Understanding Personality',
      'Common Emotional and Mental Health Challenges',
      'Coaching vs. Therapy',
    ],
    sourceUrl: COURSE_URL,
  };
}

async function writeJsonFiles(payload) {
  const outDir = path.join(__dirname, '..', 'src', 'data', 'imported');
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'course.json'), JSON.stringify(payload.course, null, 2));
  fs.writeFileSync(path.join(outDir, 'units.json'), JSON.stringify(payload.units, null, 2));
  fs.writeFileSync(path.join(outDir, 'lessons.json'), JSON.stringify(payload.lessons, null, 2));
  console.log(`Wrote ${payload.units.length} units, ${payload.lessons.length} lessons to src/data/imported/`);
}

async function main() {
  console.log('Fetching', COURSE_URL);
  const html = await fetchHtml();
  const { units, lessons } = parseCurriculum(html);

  if (!units.length) {
    throw new Error('No curriculum found — page structure may have changed.');
  }

  const course = buildCourseMeta(units, lessons);
  const payload = { course, units, lessons };

  console.log(`Parsed: ${units.length} units, ${lessons.length} lessons`);
  console.log(`Course WP ID: ${WP_COURSE_ID}`);

  if (process.argv.includes('--write')) {
    await writeJsonFiles(payload);
  }

  if (process.argv.includes('--firebase')) {
    console.log('Firebase import: use admin panel Import button or run with Firebase admin credentials.');
  }

  return payload;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
