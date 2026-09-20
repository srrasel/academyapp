import { languages } from '../data/languages';

import en from './locales/en.json';
import zh from './locales/zh.json';
import vi from './locales/vi.json';
import id from './locales/id.json';
import th from './locales/th.json';
import km from './locales/km.json';
import { getRemoteUiStrings } from '../services/translationRemoteStore';

export const DEFAULT_LOCALE = 'en';

export const LOCALE_FILES = {
  en,
  zh,
  vi,
  id,
  th,
  km,
};

export const SUPPORTED_LOCALES = languages.map((lang) => lang.id);

function getNestedValue(obj, keyPath) {
  return keyPath.split('.').reduce((acc, part) => acc?.[part], obj);
}

function interpolate(template, params = {}) {
  if (typeof template !== 'string') return template ?? '';
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) =>
    params[key] !== undefined ? String(params[key]) : `{{${key}}}`
  );
}

function resolveStrings(locale) {
  const normalized = SUPPORTED_LOCALES.includes(locale) ? locale : DEFAULT_LOCALE;
  return getRemoteUiStrings(normalized) ?? LOCALE_FILES[normalized] ?? LOCALE_FILES[DEFAULT_LOCALE];
}

const LOCAL_OVERRIDE_KEYS = new Set(['journey.subtitle', 'myLearning.unitsMeta']);

export function translate(locale, key, params) {
  const normalized = SUPPORTED_LOCALES.includes(locale) ? locale : DEFAULT_LOCALE;
  const value = LOCAL_OVERRIDE_KEYS.has(key)
    ? getNestedValue(LOCALE_FILES[normalized], key) ??
      getNestedValue(LOCALE_FILES[DEFAULT_LOCALE], key) ??
      key
    : getNestedValue(resolveStrings(normalized), key) ??
      getNestedValue(LOCALE_FILES[DEFAULT_LOCALE], key) ??
      key;
  return interpolate(value, params);
}

export function getLocaleStrings(locale) {
  const normalized = SUPPORTED_LOCALES.includes(locale) ? locale : DEFAULT_LOCALE;
  return resolveStrings(normalized) ?? LOCALE_FILES[DEFAULT_LOCALE];
}
