let remoteUiStrings = {};
let remoteCoursePacks = {};

export function setRemoteUiStrings(locale, strings) {
  if (!locale || !strings) return;
  remoteUiStrings = { ...remoteUiStrings, [locale]: strings };
}

export function getRemoteUiStrings(locale) {
  return remoteUiStrings[locale] ?? null;
}

export function setRemoteCoursePack(locale, pack) {
  if (!locale || !pack) return;
  // Never keep remote lessons in memory — bundled translation files are authoritative.
  remoteCoursePacks = {
    ...remoteCoursePacks,
    [locale]: {
      course: pack.course ?? null,
      units: pack.units ?? null,
      lessons: null,
    },
  };
}

export function getRemoteCoursePack(locale) {
  return remoteCoursePacks[locale] ?? null;
}

export function clearRemoteTranslationCache() {
  remoteUiStrings = {};
  remoteCoursePacks = {};
}
