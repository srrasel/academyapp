/**
 * Import full lesson content (text, video, quiz) from bridge-academy.vn
 * Requires a WordPress account enrolled in the course.
 *
 * Add to .env:
 *   WP_LOGIN=your@email.com
 *   WP_PASSWORD=your-site-password
 *
 * Usage:
 *   npm run import:content
 *   npm run import:content -- --write
 *   npm run import:content -- --limit 5
 */

import fs from 'fs';
import { getLearnableUnitCount } from './lib/course-units.mjs';
import path from 'path';
import { fileURLToPath } from 'url';
import { extractAudioFromPayload, extractAudioUrlsFromText, pickLessonAudioUrl } from './lib/audio-extract.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

const BASE = 'https://bridge-academy.vn';
const COURSE_URL = `${BASE}/en/courses-3/general-course/`;
const COURSE_ID = 6382;
const APP_COURSE_ID = 'general-psychology';
const AJAX = `${BASE}/wp-admin/admin-ajax.php`;

const DELAY_MS = 200;

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

async function fetchWithRetry(url, options = {}, retries = 4) {
  let lastError;
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      return await fetch(url, options);
    } catch (err) {
      lastError = err;
      if (attempt < retries) await sleep(800 * attempt);
    }
  }
  throw lastError;
}

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

function parseCookies(res) {
  if (!res.headers.getSetCookie) return '';
  return res.headers.getSetCookie().map((c) => c.split(';')[0]).join('; ');
}

function mergeCookies(...parts) {
  const map = new Map();
  for (const chunk of parts.filter(Boolean)) {
    for (const pair of chunk.split(';')) {
      const trimmed = pair.trim();
      if (!trimmed) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      map.set(trimmed.slice(0, eq), trimmed.slice(eq + 1));
    }
  }
  return [...map.entries()].map(([k, v]) => `${k}=${v}`).join('; ');
}

async function fetchHtml(url, cookies = '') {
  const res = await fetchWithRetry(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 BridgeAcademyApp/1.0',
      ...(cookies ? { Cookie: cookies } : {}),
    },
  });
  return { html: await res.text(), cookies: mergeCookies(cookies, parseCookies(res)), status: res.status };
}

async function wpLogin(login, password) {
  const page = await fetchHtml(`${COURSE_URL}6392`);

  const body = new URLSearchParams({
    log: login,
    pwd: password,
    'wp-submit': 'Log In',
    redirect_to: `${COURSE_URL}6392`,
    testcookie: '1',
  });

  const loginRes = await fetchWithRetry(`${BASE}/wp-login.php`, {
    method: 'POST',
    body,
    redirect: 'manual',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Cookie: mergeCookies(page.cookies, 'wordpress_test_cookie=WP%20Cookie%20check'),
      Referer: `${BASE}/wp-login.php`,
      Origin: BASE,
      'User-Agent': 'Mozilla/5.0',
    },
  });

  const loginCookies = mergeCookies(page.cookies, parseCookies(loginRes));
  const ok =
    loginRes.status === 302 &&
    (loginRes.headers.get('location')?.includes('bridge-academy') ||
      /wordpress_logged_in/i.test(parseCookies(loginRes)));

  const authedPage = await fetchHtml(`${COURSE_URL}6392`, loginCookies);
  const nonces = extractJsonAfterMarker(authedPage.html, 'stm_lms_nonces') || {};
  const wpRestNonce = authedPage.html.match(/wp_rest_nonce":"([^"]+)"/)?.[1] || '';

  return { ok, json: { method: 'wp-login', status: loginRes.status }, cookies: authedPage.cookies, nonces, wpRestNonce };
}

async function ajaxPost(action, fields, cookies, nonce) {
  const body = new URLSearchParams({ action, ...fields });
  if (nonce) body.set('nonce', nonce);

  const res = await fetchWithRetry(AJAX, {
    method: 'POST',
    body,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Cookie: cookies,
      'User-Agent': 'Mozilla/5.0',
    },
  });
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function restGet(path, cookies, wpRestNonce) {
  const res = await fetchWithRetry(`${BASE}/en/wp-json${path}`, {
    headers: {
      Cookie: cookies,
      'X-WP-Nonce': wpRestNonce,
      Accept: 'application/json',
    },
  });
  const text = await res.text();
  try {
    return { status: res.status, data: JSON.parse(text) };
  } catch {
    return { status: res.status, data: text };
  }
}

function stripHtml(html) {
  if (!html) return '';
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#039;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function extractMedia(html) {
  const videoUrls = [];
  const audioUrls = extractAudioUrlsFromText(html);

  for (const re of [
    /iframe[^>]+src="([^"]+)"/gi,
    /video[^>]+src="([^"]+)"/gi,
    /source[^>]+src="([^"]+)"/gi,
    /(https?:\/\/[^"'\s]+\.mp4[^"'\s]*)/gi,
    /(https?:\/\/[^"'\s]+\.m3u8[^"'\s]*)/gi,
    /(https?:\/\/player\.vimeo\.com\/video\/\d+[^"'\s]*)/gi,
    /(https?:\/\/[^"'\s]*youtube\.com\/embed\/[^"'\s]+)/gi,
    /(https?:\/\/youtu\.be\/[a-zA-Z0-9_-]+[^"'\s]*)/gi,
    /(https?:\/\/[^"'\s]*youtube\.com\/watch\?[^"'\s]+)/gi,
  ]) {
    for (const match of html.matchAll(re)) {
      const url = (match[1] || match[0] || '').trim();
      if (!url) continue;
      if (/\.mp3|\.m4a|\.wav|\.ogg|soundhelix|\/audio\//i.test(url)) audioUrls.push(url);
      else videoUrls.push(url);
    }
  }

  return {
    videoUrl: [...new Set(videoUrls)][0] || '',
    audioUrl: [...new Set(audioUrls)][0] || '',
  };
}

function extractThumbnail(html) {
  const match = html.match(/<img[^>]+src="([^"]+)"/i);
  if (!match?.[1]) return '';
  const src = match[1].trim();
  if (src.startsWith('//')) return `https:${src}`;
  if (src.startsWith('/')) return `https://bridge-academy.vn${src}`;
  if (!/^https?:\/\//i.test(src)) return `https://bridge-academy.vn/${src}`;
  return src;
}

function prepareHtmlForApp(html, baseUrl = 'https://bridge-academy.vn') {
  if (!html) return '';
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/\ssrc="\/([^"]+)"/gi, ` src="${baseUrl}/$1"`)
    .replace(/\shref="\/([^"]+)"/gi, ` href="${baseUrl}/$1"`)
    .replace(/\ssrc="(?!https?:\/\/|data:)([^"]+)"/gi, ` src="${baseUrl}/$1"`)
    .replace(/\shref="(?!https?:\/\/|mailto:|tel:|#)([^"]+)"/gi, ` href="${baseUrl}/$1"`)
    .trim();
}

function extractLessonHtml(html) {
  const selectors = [
    /class="stm-lms-course__material-content"[^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/i,
    /class="entry-content[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/article>/i,
    /class="wp-block-post-content"[^>]*>([\s\S]*?)<\/div>/i,
    /id="stm-lms-lessons"[^>]*>([\s\S]{500,8000})/i,
  ];

  for (const re of selectors) {
    const match = html.match(re);
    if (match?.[1] && match[1].length > 80) return match[1];
  }
  return '';
}

function mapQuizQuestions(raw) {
  const list = raw?.questions || raw?.data?.questions || raw?.quiz?.questions || [];
  if (!Array.isArray(list)) return [];

  return list.map((q, index) => {
    const optionsRaw = q.answers || q.options || q.choices || [];
    const options = optionsRaw.map((opt, optIndex) => {
      const id = String.fromCharCode(65 + optIndex);
      const text = opt.text || opt.answer || opt.title || opt.label || String(opt);
      const correct = Boolean(opt.isTrue || opt.correct || opt.is_correct);
      return { id, text, ...(correct ? { correct: true } : {}) };
    });

    return {
      id: String(q.id || index + 1),
      question: stripHtml(q.question || q.title || q.text || `Question ${index + 1}`),
      options,
      explanation: stripHtml(q.explanation || q.hint || q.feedback || ''),
    };
  });
}

function normalizeLessonContent(lesson, payload) {
  const html =
    (typeof payload === 'string' ? payload : null) ||
    payload?.content ||
    payload?.lesson?.content ||
    payload?.data?.content ||
    payload?.html ||
    '';

  const media = extractMedia(html);
  const text = stripHtml(html);
  const preparedHtml = prepareHtmlForApp(html);
  const keyPoints = [...html.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)]
    .map((m) => stripHtml(m[1]))
    .filter((line) => line.length > 10)
    .slice(0, 8);

  const updated = { ...lesson };

  if (text.length > 20) {
    updated.content = text;
    updated.about = text.slice(0, 280);
  }
  if (preparedHtml.length > 40) {
    updated.htmlContent = preparedHtml;
  }

  const thumbnail = extractThumbnail(html);
  if (thumbnail) updated.thumbnailUrl = thumbnail;

  if (media.videoUrl) {
    updated.videoUrl = media.videoUrl.startsWith('//') ? `https:${media.videoUrl}` : media.videoUrl;
    if (updated.type === 'text') updated.type = 'video';
  }
  if (media.audioUrl) {
    updated.audioUrl = media.audioUrl;
    if (updated.type === 'text' && !updated.videoUrl) updated.type = 'audio';
  }

  const embeddedAudio = pickLessonAudioUrl(preparedHtml, text, html);
  if (embeddedAudio && !updated.audioUrl) {
    updated.audioUrl = embeddedAudio;
    if (updated.type === 'text' && !updated.videoUrl) updated.type = 'audio';
  }
  if (keyPoints.length) updated.keyPoints = keyPoints;

  return updated;
}

function applyAudioFromSources(lesson, ...sources) {
  const audioUrl = pickLessonAudioUrl(...sources);
  if (!audioUrl) return lesson;

  return {
    ...lesson,
    audioUrl,
    ...(lesson.type === 'text' && !lesson.videoUrl ? { type: 'audio' } : {}),
  };
}

async function fetchLessonContent(lesson, auth) {
  const { cookies, nonces, wpRestNonce } = auth;
  const itemId = lesson.id;

  if (lesson.type === 'quiz') {
    const quizRest = await restGet(`/masterstudy-lms/v2/quizzes/${itemId}`, cookies, wpRestNonce);
    if (quizRest.status === 200 && quizRest.data?.quiz?.questions?.length) {
      const questions = mapQuizQuestions({ questions: quizRest.data.quiz.questions });
      if (questions.length) return { ...lesson, questions };
    }

    const quizAjax = await ajaxPost(
      'start_quiz',
      { course_id: String(COURSE_ID), item_id: String(itemId) },
      cookies,
      nonces.start_quiz
    );
    const questions = mapQuizQuestions(quizAjax);
    if (questions.length) return { ...lesson, questions };
    return lesson;
  }

  const lessonRest = await restGet(`/masterstudy-lms/v2/lessons/${itemId}`, cookies, wpRestNonce);
  if (lessonRest.status === 200 && lessonRest.data) {
    const data = lessonRest.data;
    const html =
      data.lesson?.content ||
      data.content ||
      data.lesson_content ||
      '';
    let updated = html ? normalizeLessonContent(lesson, html) : { ...lesson };
    updated = applyAudioFromSources(updated, data, html);
    if (html || updated.audioUrl) return updated;
  }

  const loadAjax = await ajaxPost(
    'load_content',
    { course_id: String(COURSE_ID), item_id: String(itemId) },
    cookies,
    nonces.load_content
  );

  if (typeof loadAjax === 'object' && loadAjax) {
    const html = loadAjax.content || loadAjax.lesson_content || loadAjax.html || '';
    let updated = html ? normalizeLessonContent(lesson, html) : { ...lesson };
    updated = applyAudioFromSources(updated, loadAjax, html);
    if (html || updated.audioUrl) return updated;
  }
  if (typeof loadAjax === 'string' && loadAjax.length > 50 && loadAjax !== '0') {
    return applyAudioFromSources(normalizeLessonContent(lesson, loadAjax), loadAjax);
  }

  const page = await fetchHtml(`${COURSE_URL}${itemId}`, cookies);
  const lessonHtml = extractLessonHtml(page.html);
  let updated = lessonHtml ? normalizeLessonContent(lesson, lessonHtml) : { ...lesson };
  updated = applyAudioFromSources(updated, page.html, lessonHtml);
  if (lessonHtml || updated.audioUrl) return updated;

  return lesson;
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

      const lesson = {
        id: wpLessonId,
        wpLessonId,
        unitId,
        courseId: APP_COURSE_ID,
        order,
        globalOrder,
        title,
        type,
        duration: type === 'quiz' ? meta : meta || '10 min',
        meta,
        wpUrl: `${COURSE_URL}${wpLessonId}`,
        about: `Part of ${sectionTitle}.`,
        content: '',
        videoUrl: '',
        audioUrl: '',
        keyPoints: [],
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
  const unitCount = getLearnableUnitCount(units);
  return {
    id: APP_COURSE_ID,
    wpCourseId: COURSE_ID,
    title: 'Life Coach Base Course – General Psychology',
    subtitle: 'General Psychology — Bridge Academy',
    description:
      'The prerequisite course helps you grasp basic principles of human thinking, emotions and behavior. 20 structured units with audio, visuals, videos and interactive quizzes.',
    stats: {
      units: unitCount,
      lessons: lessons.length,
      hours: '3-4',
      quizzes: lessons.filter((l) => l.type === 'quiz').length,
      lectures: lessons.filter((l) => l.type === 'text' || l.type === 'video' || l.type === 'audio').length,
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
  const outDir = path.join(ROOT, 'src', 'data', 'imported');
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'course.json'), JSON.stringify(payload.course, null, 2));
  fs.writeFileSync(path.join(outDir, 'units.json'), JSON.stringify(payload.units, null, 2));
  fs.writeFileSync(path.join(outDir, 'lessons.json'), JSON.stringify(payload.lessons, null, 2));
  console.log(`Wrote ${payload.units.length} units, ${payload.lessons.length} lessons`);
}

async function main() {
  const env = loadEnv();
  const login = env.WP_LOGIN || env.WP_EMAIL || '';
  const password = env.WP_PASSWORD || '';
  const shouldWrite = process.argv.includes('--write');
  const limitArg = process.argv.find((a) => a.startsWith('--limit='));
  const limit = limitArg ? Number(limitArg.split('=')[1]) : null;

  console.log('Fetching course structure...');
  const coursePage = await fetchHtml(COURSE_URL);
  const { units, lessons } = parseCurriculum(coursePage.html);
  if (!lessons.length) throw new Error('No lessons found in course page HTML');

  if (!login || !password) {
    console.error('\nMissing WP_LOGIN and WP_PASSWORD in .env');
    console.error('Add your bridge-academy.vn account (must be enrolled in this course).');
    console.error('Example:');
    console.error('  WP_LOGIN=you@email.com');
    console.error('  WP_PASSWORD=yourpassword');
    process.exit(1);
  }

  console.log('Logging in to bridge-academy.vn...');
  const auth = await wpLogin(login, password);
  if (!auth.ok) {
    console.error('Login failed:', JSON.stringify(auth.json).slice(0, 400));
    process.exit(1);
  }
  console.log('Login OK');

  const targetLessons = limit ? lessons.slice(0, limit) : lessons;
  let withContent = 0;
  let withVideo = 0;
  let withAudio = 0;
  let withQuiz = 0;

  for (let i = 0; i < targetLessons.length; i += 1) {
    const lesson = targetLessons[i];
    process.stdout.write(`\r[${i + 1}/${targetLessons.length}] ${lesson.title.slice(0, 40).padEnd(40)}`);

    const enriched = await fetchLessonContent(lesson, auth);
    Object.assign(lesson, enriched);

    if (lesson.content?.length > 30) withContent += 1;
    if (lesson.videoUrl) withVideo += 1;
    if (lesson.audioUrl) withAudio += 1;
    if (lesson.questions?.length) withQuiz += 1;

    if (shouldWrite && (i + 1) % 25 === 0) {
      await writeJsonFiles({ course: buildCourseMeta(units, lessons), units, lessons });
    }

    await sleep(DELAY_MS);
  }

  console.log('\n\nImport summary');
  console.log('  Lessons processed:', targetLessons.length);
  console.log('  With text content:', withContent);
  console.log('  With video URL:', withVideo);
  console.log('  With audio URL:', withAudio);
  console.log('  With quiz questions:', withQuiz);

  const payload = { course: buildCourseMeta(units, lessons), units, lessons };

  if (shouldWrite) {
    await writeJsonFiles(payload);
    console.log('\nSaved to src/data/imported/');
    console.log('Run: npm run sync:translations && npm run setup:firebase');
  } else {
    console.log('\nDry run — add --write to save files');
  }
}

const isDirectRun =
  process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

export {
  fetchLessonContent,
  wpLogin,
  loadEnv,
  COURSE_ID,
  COURSE_URL,
  pickLessonAudioUrl,
};

if (isDirectRun) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
