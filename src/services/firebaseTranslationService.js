import { doc, getDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db, isFirebaseReady } from '../config/firebase';
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from '../i18n';
import { setRemoteCoursePack, setRemoteUiStrings } from './translationRemoteStore';

const CACHE_PREFIX = '@academy_translation_pack:';
const BUNDLE_IDS = ['ui', 'course', 'units', 'lessons'];

async function readCache(locale) {
  try {
    const raw = await AsyncStorage.getItem(`${CACHE_PREFIX}${locale}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

async function writeCache(locale, pack) {
  await AsyncStorage.setItem(`${CACHE_PREFIX}${locale}`, JSON.stringify(pack));
}

async function fetchBundle(locale, bundleId) {
  const snap = await getDoc(doc(db, 'translations', locale, 'bundles', bundleId));
  if (!snap.exists()) return null;
  return snap.data()?.payload ?? null;
}

export async function syncTranslationsForLocale(locale, { uiOnly = false } = {}) {
  const normalized = SUPPORTED_LOCALES.includes(locale) ? locale : DEFAULT_LOCALE;

  const cached = await readCache(normalized);
  if (cached) {
    applyTranslationPack(normalized, cached, { uiOnly });
  }

  if (!isFirebaseReady()) {
    return cached;
  }

  try {
    const meta = await getDoc(doc(db, 'translations', normalized));
    if (!meta.exists()) {
      return cached;
    }

    const remoteUpdatedAt = meta.data()?.updatedAt ?? 0;
    if (cached?.updatedAt && cached.updatedAt >= remoteUpdatedAt) {
      return cached;
    }

    const bundleIds = uiOnly ? ['ui'] : BUNDLE_IDS;
    const entries = await Promise.all(
      bundleIds.map(async (bundleId) => [bundleId, await fetchBundle(normalized, bundleId)])
    );

    const pack = {
      updatedAt: remoteUpdatedAt,
      ui: entries.find(([id]) => id === 'ui')?.[1] ?? cached?.ui ?? null,
      course: uiOnly
        ? cached?.course ?? null
        : entries.find(([id]) => id === 'course')?.[1] ?? cached?.course ?? null,
      units: uiOnly
        ? cached?.units ?? null
        : entries.find(([id]) => id === 'units')?.[1] ?? cached?.units ?? null,
      lessons: uiOnly
        ? cached?.lessons ?? null
        : entries.find(([id]) => id === 'lessons')?.[1] ?? cached?.lessons ?? null,
    };

    if (pack.ui || pack.course || pack.units || pack.lessons) {
      if (!uiOnly) {
        await writeCache(normalized, pack);
      }
      applyTranslationPack(normalized, pack, { uiOnly });
    }

    return pack;
  } catch {
    return cached;
  }
}

function applyTranslationPack(locale, pack, { uiOnly = false } = {}) {
  if (pack.ui) setRemoteUiStrings(locale, pack.ui);
  // Do not apply remote lessons — bundled translation files are the source of truth.
  if (!uiOnly && (pack.course || pack.units)) {
    setRemoteCoursePack(locale, {
      course: pack.course,
      units: pack.units,
      lessons: null,
    });
  }
}

export async function preloadAllTranslations() {
  await Promise.all(SUPPORTED_LOCALES.map((locale) => syncTranslationsForLocale(locale)));
}
