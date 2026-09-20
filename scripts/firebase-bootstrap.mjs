/**
 * One-time Firebase bootstrap:
 * - Sync translation files to admin/public
 * - Create admin user (Auth + Firestore profile)
 * - Seed General Psychology course (21 units, 199 lessons)
 * - Upload all translations to Firestore
 *
 * Usage:
 *   npm run setup:firebase
 *   npm run setup:firebase -- --email admin@example.com --password Secret123
 *
 * Env (.env):
 *   EXPO_PUBLIC_FIREBASE_*  — Firebase config
 *   ADMIN_EMAIL             — optional
 *   ADMIN_PASSWORD          — optional (min 6 chars)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

const COURSE_ID = 'general-psychology';
const LOCALES = ['en', 'zh', 'vi', 'id', 'th', 'km'];
const BUNDLE_IDS = ['ui', 'course', 'units', 'lessons'];

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

function parseArgs() {
  const args = process.argv.slice(2);
  const get = (flag) => {
    const direct = args.find((a) => a.startsWith(`${flag}=`));
    return direct?.split('=').slice(1).join('=');
  };
  return {
    email: get('--email'),
    password: get('--password'),
  };
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), 'utf8'));
}

function loadLocaleBundles(locale) {
  const ui = readJson(`src/i18n/locales/${locale}.json`);
  if (locale === 'en') {
    return {
      ui,
      course: readJson('src/data/imported/course.json'),
      units: readJson('src/data/imported/units.json'),
      lessons: readJson('src/data/imported/lessons.json'),
    };
  }
  return {
    ui,
    course: readJson(`src/data/translations/${locale}/course.json`),
    units: readJson(`src/data/translations/${locale}/units.json`),
    lessons: readJson(`src/data/translations/${locale}/lessons.json`),
  };
}

async function ensureAdminUser(auth, db, email, password) {
  let uid;
  let created = false;

  try {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    uid = credential.user.uid;
    created = true;
    console.log(`Created Auth user: ${email}`);
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      await signInWithEmailAndPassword(auth, email, password);
      uid = auth.currentUser.uid;
      console.log(`Signed in existing user: ${email}`);
    } else {
      throw error;
    }
  }

  await setDoc(
    doc(db, 'users', uid),
    {
      email,
      displayName: 'Bridge Admin',
      role: 'admin',
      language: 'en',
      onboardingComplete: true,
      createdAt: Date.now(),
    },
    { merge: true }
  );
  console.log(`Firestore profile set to role: admin (${uid})`);

  return { uid, created };
}

async function seedCourse(db) {
  const course = readJson('src/data/imported/course.json');
  const units = readJson('src/data/imported/units.json');
  const lessons = readJson('src/data/imported/lessons.json');

  const { id, wpCourseId, sourceUrl, ...courseData } = course;

  await setDoc(
    doc(db, 'courses', COURSE_ID),
    { ...courseData, id: COURSE_ID, updatedAt: Date.now() },
    { merge: true }
  );

  await setDoc(doc(db, 'appConfig', 'main'), {
    quoteOfDay: {
      text: 'Understanding yourself is the first step to understanding others.',
      author: 'Carl Jung',
    },
  });

  for (const unit of units) {
    await setDoc(doc(db, 'units', String(unit.id)), { ...unit, courseId: COURSE_ID });
  }

  for (const lesson of lessons) {
    await setDoc(doc(db, 'lessons', String(lesson.id)), { ...lesson, courseId: COURSE_ID });
  }

  console.log(`Seeded course: ${units.length} units, ${lessons.length} lessons`);
}

async function uploadTranslations(db) {
  const now = Date.now();
  for (const locale of LOCALES) {
    const bundles = loadLocaleBundles(locale);
    await setDoc(
      doc(db, 'translations', locale),
      { locale, updatedAt: now, bundles: BUNDLE_IDS },
      { merge: true }
    );
    for (const bundleId of BUNDLE_IDS) {
      await setDoc(doc(db, 'translations', locale, 'bundles', bundleId), {
        payload: bundles[bundleId],
        updatedAt: now,
      });
    }
    console.log(`Uploaded translations: ${locale}`);
  }
}

async function verifyWrite(db) {
  const courseSnap = await getDoc(doc(db, 'courses', COURSE_ID));
  const transSnap = await getDoc(doc(db, 'translations', 'vi'));
  if (!courseSnap.exists()) throw new Error('Course write failed — check Firestore rules');
  if (!transSnap.exists()) throw new Error('Translation write failed — check Firestore rules');
}

async function main() {
  const env = loadEnv();
  const args = parseArgs();

  const email = args.email || env.ADMIN_EMAIL || 'admin@bridgeacademy.com';
  const password = args.password || env.ADMIN_PASSWORD || 'BridgeAdmin2026!';

  const firebaseConfig = {
    apiKey: env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.EXPO_PUBLIC_FIREBASE_APP_ID,
  };

  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    console.error('Missing EXPO_PUBLIC_FIREBASE_* in .env');
    process.exit(1);
  }

  console.log('Step 1/5: Sync translation files to admin/public...');
  await import('./sync-translation-files.mjs');

  console.log('\nStep 2/5: Connect to Firebase...');
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

  console.log('\nStep 3/5: Create admin user...');
  const admin = await ensureAdminUser(auth, db, email, password);

  console.log('\nStep 4/5: Seed General Psychology course...');
  await seedCourse(db);

  console.log('\nStep 5/5: Upload all translations...');
  await uploadTranslations(db);

  await verifyWrite(db);

  console.log('\n========================================');
  console.log('Firebase setup complete!');
  console.log('========================================');
  console.log(`Admin email:    ${email}`);
  console.log(`Admin password: ${password}`);
  console.log(`Admin UID:      ${admin.uid}`);
  console.log(`Project:        ${firebaseConfig.projectId}`);
  console.log('\nAdmin panel: npm run admin  →  http://localhost:5173');
  console.log('Login with the admin email and password above.');
  console.log('\nIf writes failed, deploy Firestore rules:');
  console.log('  npx firebase-tools deploy --only firestore:rules');
  console.log('(Requires: firebase login)');

  await signOut(auth);
}

main().catch((error) => {
  console.error('\nSetup failed:', error.message || error);
  if (error.code === 'permission-denied') {
    console.error(
      '\nFirestore permission denied. Enable Email/Password auth in Firebase Console,',
      'then deploy rules: npx firebase-tools deploy --only firestore:rules'
    );
  }
  process.exit(1);
});
