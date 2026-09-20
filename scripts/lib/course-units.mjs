export const INTRO_UNIT_ID = '1';
export const LEARNABLE_UNIT_COUNT = 20;

export function isIntroUnit(unit) {
  if (!unit) return false;
  if (String(unit.id) === INTRO_UNIT_ID) return true;
  const title = unit.title || unit.wpSectionTitle || '';
  return unit.order === 1 && /introduction/i.test(title);
}

export function getLearnableUnitCount(units) {
  const learnable = (units || []).filter((unit) => !isIntroUnit(unit));
  return learnable.length || LEARNABLE_UNIT_COUNT;
}
