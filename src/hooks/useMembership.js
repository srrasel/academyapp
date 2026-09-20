import { useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getMembershipFeatures,
  normalizeMembershipTier,
} from '../constants/membership';
import { setMembershipAccess } from '../services/membershipAccess';

export function useMembership() {
  const { profile } = useAuth();

  const tier = normalizeMembershipTier(profile?.membershipTier);

  const features = useMemo(() => getMembershipFeatures(tier), [tier]);

  useEffect(() => {
    setMembershipAccess(tier);
  }, [tier]);

  return {
    tier,
    features,
    isFree: tier === 'free',
    isSilver: tier === 'silver',
    isGold: tier === 'gold',
  };
}
