import { doc, getDoc, setDoc, getDocs, collection } from 'firebase/firestore';
import { db } from '../firebase';

const BUNDLE_IDS = ['ui', 'course', 'units', 'lessons'];
const LOCALES = ['en', 'zh', 'vi', 'id', 'th', 'km'];

async function fetchPublicJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load ${url} (${res.status})`);
  return res.json();
}

async function loadLocaleBundles(locale) {
  const ui = await fetchPublicJson(`/locales/${locale}.json`);

  if (locale === 'en') {
    const [course, units, lessons] = await Promise.all([
      fetchPublicJson('/course/en/course.json'),
      fetchPublicJson('/course/en/units.json'),
      fetchPublicJson('/course/en/lessons.json'),
    ]);
    return { ui, course, units, lessons };
  }

  const [course, units, lessons] = await Promise.all([
    fetchPublicJson(`/translations/${locale}/course.json`),
    fetchPublicJson(`/translations/${locale}/units.json`),
    fetchPublicJson(`/translations/${locale}/lessons.json`),
  ]);
  return { ui, course, units, lessons };
}

export async function uploadTranslationLocale(locale, bundles) {
  const now = Date.now();
  await setDoc(
    doc(db, 'translations', locale),
    {
      locale,
      updatedAt: now,
      bundles: BUNDLE_IDS,
    },
    { merge: true }
  );

  await Promise.all(
    BUNDLE_IDS.map((bundleId) =>
      setDoc(doc(db, 'translations', locale, 'bundles', bundleId), {
        payload: bundles[bundleId],
        updatedAt: now,
      })
    )
  );

  return { locale, updatedAt: now };
}

export async function uploadTranslationLocaleFromPublic(locale) {
  const bundles = await loadLocaleBundles(locale);
  return uploadTranslationLocale(locale, bundles);
}

export async function uploadAllTranslationsFromPublic() {
  const results = [];
  for (const locale of LOCALES) {
    results.push(await uploadTranslationLocaleFromPublic(locale));
  }
  return results;
}

export async function listTranslationLocales() {
  const snap = await getDocs(collection(db, 'translations'));
  return snap.docs.map((item) => ({ id: item.id, ...item.data() }));
}

export async function getTranslationLocaleStatus(locale) {
  const meta = await getDoc(doc(db, 'translations', locale));
  if (!meta.exists()) return null;

  const bundles = await Promise.all(
    BUNDLE_IDS.map(async (bundleId) => {
      const snap = await getDoc(doc(db, 'translations', locale, 'bundles', bundleId));
      return { bundleId, exists: snap.exists(), updatedAt: snap.data()?.updatedAt ?? null };
    })
  );

  return { locale, ...meta.data(), bundles };
}

export { LOCALES, BUNDLE_IDS };
