import { getMembershipFeatures, DEFAULT_MEMBERSHIP_TIER } from '../constants/membership';

let activeFeatures = getMembershipFeatures(DEFAULT_MEMBERSHIP_TIER);

export function setMembershipAccess(tier) {
  activeFeatures = getMembershipFeatures(tier);
}

export function getMembershipAccess() {
  return activeFeatures;
}
