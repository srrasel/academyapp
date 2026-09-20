import AsyncStorage from '@react-native-async-storage/async-storage';

const UNIT_AD_PREFIX = '@academy_unit_ad_count:';
const AD_ROTATION_KEY = '@academy_ad_rotation_index';

/** Soft cap: about 2 interstitial ads across an entire unit. */
export const MAX_ADS_PER_UNIT = 2;

function unitKey(unitId) {
  return `${UNIT_AD_PREFIX}${String(unitId ?? 'unknown')}`;
}

export async function getUnitAdCount(unitId) {
  try {
    const raw = await AsyncStorage.getItem(unitKey(unitId));
    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? n : 0;
  } catch {
    return 0;
  }
}

/**
 * Returns true if another interstitial may be shown for this unit,
 * and records the impression when shouldShow is true.
 */
export async function requestUnitAdSlot(unitId) {
  const count = await getUnitAdCount(unitId);
  if (count >= MAX_ADS_PER_UNIT) return false;
  try {
    await AsyncStorage.setItem(unitKey(unitId), String(count + 1));
  } catch {
    // Still allow show if storage fails — better UX than blocking forever.
  }
  return true;
}

/** Next creative index for rotation (home banner + interstitials). */
export async function nextAdRotationIndex(total) {
  const size = Math.max(1, total || 1);
  try {
    const raw = await AsyncStorage.getItem(AD_ROTATION_KEY);
    const current = Number(raw);
    const next = Number.isFinite(current) ? (current + 1) % size : 0;
    await AsyncStorage.setItem(AD_ROTATION_KEY, String(next));
    return next;
  } catch {
    return Math.floor(Math.random() * size);
  }
}
