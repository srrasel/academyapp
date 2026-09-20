/**
 * Validate bundled course data integrity.
 * Usage: npm run validate:course
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), 'utf8'));
}

function main() {
  const units = readJson('src/data/imported/units.json');
  const lessons = readJson('src/data/imported/lessons.json');
  const issues = [];

  const types = {};
  let withVideo = 0;
  let withAudio = 0;
  let withContent = 0;

  for (const lesson of lessons) {
    types[lesson.type] = (types[lesson.type] || 0) + 1;
    if (lesson.videoUrl?.trim()) withVideo += 1;
    if (lesson.audioUrl?.trim()) withAudio += 1;
    if (lesson.content?.trim() || lesson.body?.trim()) withContent += 1;
  }

  for (const unit of units) {
    const unitLessons = lessons.filter((l) => String(l.unitId) === String(unit.id));
    const expected = unit.total || unit.totalLessons;

    if (unitLessons.length !== expected) {
      issues.push(
        `Unit ${unit.id} "${unit.title}": expected ${expected} lessons, found ${unitLessons.length}`
      );
    }

    const orders = unitLessons.map((l) => l.order).sort((a, b) => a - b);
    for (let i = 1; i <= unitLessons.length; i += 1) {
      if (!orders.includes(i)) {
        issues.push(`Unit ${unit.id}: missing lesson order ${i}`);
      }
    }

    for (const lesson of unitLessons) {
      if (!lesson.id) issues.push(`Unit ${unit.id}: lesson missing id`);
      if (!lesson.title?.trim()) issues.push(`Unit ${unit.id} lesson ${lesson.id}: missing title`);
      if (!['text', 'quiz', 'video', 'audio'].includes(lesson.type)) {
        issues.push(`Lesson ${lesson.id}: invalid type "${lesson.type}"`);
      }
    }
  }

  const ids = new Set();
  for (const lesson of lessons) {
    if (ids.has(String(lesson.id))) issues.push(`Duplicate lesson id: ${lesson.id}`);
    ids.add(String(lesson.id));
  }

  console.log('Course validation');
  console.log('=================');
  console.log(`Units: ${units.length}`);
  console.log(`Lessons: ${lessons.length}`);
  console.log(`Types: ${JSON.stringify(types)}`);
  console.log(`With videoUrl: ${withVideo}`);
  console.log(`With audioUrl: ${withAudio}`);
  console.log(`With full content field: ${withContent}`);
  console.log(`Issues: ${issues.length}`);

  if (issues.length) {
    issues.slice(0, 20).forEach((item) => console.log(`  - ${item}`));
    if (issues.length > 20) console.log(`  ... and ${issues.length - 20} more`);
    process.exit(1);
  }

  console.log('All checks passed.');
}

main();
