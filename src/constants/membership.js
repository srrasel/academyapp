export const MEMBERSHIP_TIERS = {
  free: {
    id: 'free',
    name: 'Free Version',
    color: '#6B7280',
    priceLabel: 'Free',
    priceAmount: 0,
    oneTimePayment: false,
    hasAds: true,
    hasVideo: false,
    hasAudio: true,
    hasToolkit: false,
    toolkitAccess: 'none', // none | limited | full
    hasCoachingProfile: false,
    hasHardCopyCertificate: false,
    certificateSigned: false,
    certificateLabel: 'Certificate Basic with name',
    discountPercent: 0,
    hasCommunityInteract: false,
  },
  silver: {
    id: 'silver',
    name: 'Silver Version',
    color: '#94A3B8',
    priceLabel: '$9.99',
    priceAmount: 9.99,
    oneTimePayment: true,
    hasAds: false,
    hasVideo: true,
    hasAudio: true,
    hasToolkit: true,
    toolkitAccess: 'limited',
    hasCoachingProfile: false,
    hasHardCopyCertificate: false,
    certificateSigned: true,
    certificateLabel: 'Certificate with name & signature',
    discountPercent: 0,
    hasCommunityInteract: true,
  },
  gold: {
    id: 'gold',
    name: 'Gold Version',
    color: '#D4A84B',
    priceLabel: '$24.99',
    priceAmount: 24.99,
    oneTimePayment: true,
    hasAds: false,
    hasVideo: true,
    hasAudio: true,
    hasToolkit: true,
    toolkitAccess: 'full',
    hasCoachingProfile: true,
    hasHardCopyCertificate: false,
    certificateSigned: true,
    certificateLabel: 'Certificate with name, signature & stamp',
    discountPercent: 10,
    hasCommunityInteract: true,
  },
};

export const MEMBERSHIP_PLAN_ORDER = ['free', 'silver', 'gold'];

export const DEFAULT_MEMBERSHIP_TIER = 'free';

const TIER_RANK = { free: 0, silver: 1, gold: 2 };

export function normalizeMembershipTier(tier) {
  return MEMBERSHIP_TIERS[tier] ? tier : DEFAULT_MEMBERSHIP_TIER;
}

export function getMembershipFeatures(tier) {
  return MEMBERSHIP_TIERS[normalizeMembershipTier(tier)];
}

/**
 * Plans to show for the user's current membership.
 * - Current plan is first
 * - Free is hidden once Silver or Gold is owned
 * - Silver is hidden once Gold is owned
 * - Higher upgrade options (if any) stay visible after the current plan
 */
export function getVisibleMembershipPlans(currentTier) {
  const current = normalizeMembershipTier(currentTier);
  const currentRank = TIER_RANK[current] ?? 0;

  const visible = MEMBERSHIP_PLAN_ORDER.filter((planId) => {
    const rank = TIER_RANK[planId] ?? 0;
    // Hide any plan strictly below the owned tier
    if (rank < currentRank) return false;
    return true;
  });

  // Current plan on top, then remaining upgrades in order
  return [
    current,
    ...visible.filter((planId) => planId !== current),
  ];
}

export function getPlanFeatureList(tierId, t) {
  const tier = getMembershipFeatures(tierId);
  const features = [];

  if (tier.hasAds) {
    features.push(t('membership.featureAds'));
  } else {
    features.push(t('membership.featureNoAds'));
  }

  features.push(t('membership.featureCertificate', { type: tier.certificateLabel }));

  if (tier.hasAudio) {
    features.push(
      tier.hasVideo
        ? t('membership.featureAudioAutoScroll')
        : t('membership.featureAudio')
    );
  }

  if (tier.hasVideo) {
    features.push(t('membership.featureVideo'));
  }

  if (tier.hasCommunityInteract) {
    features.push(t('membership.featureCommunityFull'));
  } else {
    features.push(t('membership.featureCommunityReadOnly'));
  }

  if (tier.toolkitAccess === 'full') {
    features.push(t('membership.featureToolkitFull'));
  } else if (tier.toolkitAccess === 'limited') {
    features.push(t('membership.featureToolkitLimited'));
  } else {
    features.push(t('membership.featureNoToolkit'));
  }

  if (tier.discountPercent > 0) {
    features.push(t('membership.featureDiscount', { percent: tier.discountPercent }));
  }

  if (tier.hasCoachingProfile) {
    features.push(t('membership.featureExclusiveOffers'));
  }

  return features;
}
