import { useState } from 'react';
import { ScrollView, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AppHeader from '../../components/AppHeader/AppHeader';
import PrimaryButton from '../../components/PrimaryButton/PrimaryButton';
import OutlineButton from '../../components/OutlineButton/OutlineButton';
import { useAuth } from '../../context/AuthContext';
import { useLocale } from '../../context/LocaleContext';
import { useMembership } from '../../hooks/useMembership';
import {
  getVisibleMembershipPlans,
  getMembershipFeatures,
  getPlanFeatureList,
} from '../../constants/membership';
import { colors } from '../../theme/colors';
import { styles } from './MembershipScreen.styles';

export default function MembershipScreen({ navigation }) {
  const { updateProfile } = useAuth();
  const { t } = useLocale();
  const { tier: currentTier } = useMembership();
  const [saving, setSaving] = useState(false);
  const visiblePlans = getVisibleMembershipPlans(currentTier);

  const selectPlan = async (planId) => {
    if (planId === currentTier) return;
    setSaving(true);
    try {
      await updateProfile({ membershipTier: planId });
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.scroll} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <AppHeader variant="back" onBack={() => navigation.goBack()} />
        <Text style={styles.title}>{t('membership.title')}</Text>
        <Text style={styles.subtitle}>{t('membership.subtitle')}</Text>

        <View style={styles.currentBadge}>
          <Text style={styles.currentBadgeText}>
            {t('membership.currentPlan', { plan: getMembershipFeatures(currentTier).name })}
          </Text>
        </View>

        {visiblePlans.map((planId) => {
          const plan = getMembershipFeatures(planId);
          const isCurrent = planId === currentTier;
          const features = getPlanFeatureList(planId, t);

          return (
            <View
              key={planId}
              style={[styles.planCard, isCurrent && styles.planCardActive]}
            >
              <View style={styles.planHeader}>
                <View style={styles.planTitleCol}>
                  <Text style={styles.planName}>{plan.name}</Text>
                  <Text style={styles.planPrice}>
                    {plan.priceAmount > 0
                      ? plan.priceLabel
                      : t('membership.priceFree') || plan.priceLabel}
                  </Text>
                  {plan.oneTimePayment ? (
                    <Text style={styles.planPaymentType}>
                      {t('membership.oneTimePayment')}
                    </Text>
                  ) : null}
                </View>
                <Text style={[styles.planBadge, { backgroundColor: plan.color }]}>
                  {planId.toUpperCase()}
                </Text>
              </View>

              {features.map((feature) => (
                <View key={feature} style={styles.featureRow}>
                  <Ionicons name="checkmark-circle" size={18} color={colors.success} />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}

              {isCurrent ? (
                <OutlineButton
                  label={t('membership.current')}
                  onPress={() => {}}
                  style={styles.selectBtn}
                />
              ) : (
                <PrimaryButton
                  label={saving ? t('common.pleaseWait') : t('membership.selectPlan')}
                  onPress={() => selectPlan(planId)}
                  disabled={saving}
                  style={styles.selectBtn}
                />
              )}
            </View>
          );
        })}

        <Text style={styles.note}>{t('membership.demoNote')}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}
