/**
 * Copy local translation + course JSON into admin/public for the admin panel to upload to Firebase.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

const LOCALES = ['en', 'zh', 'vi', 'id', 'th', 'km'];
const LANGS = ['zh', 'vi', 'id', 'th', 'km'];

function copyFile(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

function syncFiles() {
  for (const locale of LOCALES) {
    copyFile(
      path.join(ROOT, 'src/i18n/locales', `${locale}.json`),
      path.join(ROOT, 'admin/public/locales', `${locale}.json`)
    );
  }

  for (const file of ['course.json', 'units.json', 'lessons.json']) {
    copyFile(
      path.join(ROOT, 'src/data/imported', file),
      path.join(ROOT, 'admin/public/course/en', file)
    );
  }

  for (const lang of LANGS) {
    for (const file of ['course.json', 'units.json', 'lessons.json']) {
      copyFile(
        path.join(ROOT, 'src/data/translations', lang, file),
        path.join(ROOT, 'admin/public/translations', lang, file)
      );
    }
  }

  console.log('Synced translation files to admin/public/');
}

syncFiles();
