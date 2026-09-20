import { useEffect, useMemo, useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTabBarPadding } from '../../hooks/useTabBarPadding';
import SegmentedTabs from '../../components/SegmentedTabs/SegmentedTabs';
import ProfileAvatar from '../../components/ProfileAvatar/ProfileAvatar';
import PrimaryButton from '../../components/PrimaryButton/PrimaryButton';
import OutlineButton from '../../components/OutlineButton/OutlineButton';
import CertificatePreview from '../../components/CertificatePreview/CertificatePreview';
import AdvancedCourseList from '../../components/AdvancedCourseList/AdvancedCourseList';
import { useAuth } from '../../context/AuthContext';
import { useCourse } from '../../context/CourseContext';
import { useLocale } from '../../context/LocaleContext';
import { useMembership } from '../../hooks/useMembership';
import {
  getVisibleMembershipPlans,
  getMembershipFeatures,
} from '../../constants/membership';
import { buildProgressStats } from '../../services/progressService';
import { buildCertificate } from '../../services/achievementService';
import { getAdvancedCoursesForLocale } from '../../data/course';
import { getCertificatePdfUrl } from '../../data/achievements';
import { downloadAndSharePdf } from '../../utils/downloadPdf';
import { openWebUrl } from '../../utils/openWebUrl';
import { colors } from '../../theme/colors';
import { styles } from './ProfileScreen.styles';

const BRIDGE_ACADEMY_URL = 'https://www.bridge-academy.vn';

export default function ProfileScreen({ navigation }) {
  const { profile, user, signOut, updateProfile } = useAuth();
  const { course, units, progress } = useCourse();
  const { t, locale } = useLocale();
  const { tier, features } = useMembership();
  const bottomPad = useTabBarPadding();

  const [activeTab, setActiveTab] = useState('overview');
  const [displayName, setDisplayName] = useState(profile?.displayName || '');
  const [email, setEmail] = useState(profile?.email || user?.email || '');
  const [phoneNumber, setPhoneNumber] = useState(profile?.phoneNumber || '');
  const [country, setCountry] = useState(profile?.country || '');
  const [city, setCity] = useState(profile?.city || '');
  const [saving, setSaving] = useState(false);
  const [downloadingCertificate, setDownloadingCertificate] = useState(false);

  const stats = buildProgressStats(course, units, progress);
  const localeAdvancedCourses = useMemo(
    () => getAdvancedCoursesForLocale(locale),
    [locale]
  );
  const certificate = buildCertificate(profile, stats, course?.title);
  const canUpgrade = tier !== 'gold';
  const visiblePlans = getVisibleMembershipPlans(tier);

  const tabs = useMemo(
    () => [
      { key: 'overview', label: t('profile.generalOverview') },
      { key: 'certificates', label: t('profile.certificatesCourses') },
    ],
    [t]
  );

  useEffect(() => {
    setDisplayName(profile?.displayName || '');
    setEmail(profile?.email || user?.email || '');
    setPhoneNumber(profile?.phoneNumber || '');
    setCountry(profile?.country || '');
    setCity(profile?.city || '');
  }, [
    profile?.displayName,
    profile?.email,
    profile?.phoneNumber,
    profile?.country,
    profile?.city,
    user?.email,
  ]);

  const handlePhotoChange = async (photoUri) => {
    await updateProfile({ photoUri });
  };

  const saveOverview = async () => {
    setSaving(true);
    try {
      await updateProfile({
        displayName: displayName.trim() || profile?.displayName || 'Learner',
        phoneNumber: phoneNumber.trim() || null,
        country: country.trim() || null,
        city: city.trim() || null,
      });
      Alert.alert(t('settings.savedTitle'), t('settings.savedMessage'));
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert(t('settings.signOutTitle'), t('settings.signOutMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.signOut'),
        style: 'destructive',
        onPress: () => signOut(),
      },
    ]);
  };

  const handleDownloadCertificate = async () => {
    if (!certificate.unlocked) {
      Alert.alert(
        t('profile.certificateLockedTitle'),
        t('profile.certificateLockedMessage', { percent: stats.percent })
      );
      return;
    }

    setDownloadingCertificate(true);
    try {
      await downloadAndSharePdf(getCertificatePdfUrl(locale), {
        title: 'Bridge-Academy-Certificate',
        folder: 'certificates',
      });
    } catch {
      Alert.alert(t('achievements.download'), t('profile.certificateDownloadFailed'));
    } finally {
      setDownloadingCertificate(false);
    }
  };

  return (
    <SafeAreaView style={styles.scroll} edges={['top']}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: bottomPad }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.headerRow}>
          <Text style={styles.title}>{t('tabs.profile')}</Text>
          <Pressable onPress={() => navigation.navigate('Settings')} hitSlop={8}>
            <Ionicons name="settings-outline" size={24} color={colors.primary} />
          </Pressable>
        </View>

        <SegmentedTabs tabs={tabs} active={activeTab} onChange={setActiveTab} />

        {activeTab === 'overview' ? (
          <>
            <View style={styles.profileCard}>
              <ProfileAvatar
                name={displayName || profile?.displayName}
                photoUri={profile?.photoUri}
                editable
                onPhotoChange={handlePhotoChange}
                hint={t('settings.photoHint')}
              />
            </View>

            <Text style={styles.section}>{t('profile.personalInfo')}</Text>
            <View style={styles.card}>
              <Text style={styles.label}>{t('settings.name')}</Text>
              <View style={styles.fieldRow}>
                <View style={[styles.fieldIcon, { backgroundColor: '#DBEAFE' }]}>
                  <Ionicons name="person-outline" size={18} color="#2563EB" />
                </View>
                <TextInput
                  style={[styles.input, styles.inputFlex]}
                  value={displayName}
                  onChangeText={setDisplayName}
                  placeholder={t('account.fullNamePlaceholder')}
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="words"
                />
              </View>

              <Text style={[styles.label, styles.labelSpaced]}>{t('settings.email')}</Text>
              <View style={styles.fieldRow}>
                <View style={[styles.fieldIcon, { backgroundColor: '#FFEDD5' }]}>
                  <Ionicons name="mail-outline" size={18} color="#EA580C" />
                </View>
                <TextInput
                  style={[styles.input, styles.inputFlex, styles.inputReadonly]}
                  value={email}
                  editable={false}
                  placeholder={t('account.emailPlaceholder')}
                  placeholderTextColor={colors.textMuted}
                />
              </View>

              <Text style={[styles.label, styles.labelSpaced]}>{t('profile.phone')}</Text>
              <View style={styles.fieldRow}>
                <View style={[styles.fieldIcon, { backgroundColor: '#EDE9FE' }]}>
                  <Ionicons name="call-outline" size={18} color="#7C3AED" />
                </View>
                <TextInput
                  style={[styles.input, styles.inputFlex]}
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  placeholder={t('profile.phonePlaceholder')}
                  placeholderTextColor={colors.textMuted}
                  keyboardType="phone-pad"
                />
              </View>

              <Text style={[styles.label, styles.labelSpaced]}>{t('profile.country')}</Text>
              <View style={styles.fieldRow}>
                <View style={[styles.fieldIcon, { backgroundColor: '#DCFCE7' }]}>
                  <Ionicons name="globe-outline" size={18} color="#16A34A" />
                </View>
                <TextInput
                  style={[styles.input, styles.inputFlex]}
                  value={country}
                  onChangeText={setCountry}
                  placeholder={t('profile.countryPlaceholder')}
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="words"
                />
              </View>

              <Text style={[styles.label, styles.labelSpaced]}>{t('profile.city')}</Text>
              <View style={styles.fieldRow}>
                <View style={[styles.fieldIcon, { backgroundColor: '#FCE7F3' }]}>
                  <Ionicons name="location-outline" size={18} color="#DB2777" />
                </View>
                <TextInput
                  style={[styles.input, styles.inputFlex]}
                  value={city}
                  onChangeText={setCity}
                  placeholder={t('profile.cityPlaceholder')}
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="words"
                />
              </View>

              <PrimaryButton
                label={saving ? t('common.saving') : t('settings.saveProfile')}
                onPress={saveOverview}
                disabled={saving}
                style={styles.saveBtn}
              />
            </View>

            <Text style={styles.section}>{t('settings.subscription')}</Text>
            <View style={styles.subscriptionCard}>
              <View style={styles.tierRow}>
                {visiblePlans.map((planId) => {
                  const active = planId === tier;
                  const tierIcon =
                    planId === 'free'
                      ? { name: 'gift-outline', color: '#2563EB', bg: '#DBEAFE' }
                      : planId === 'silver'
                        ? { name: 'medal-outline', color: '#7C3AED', bg: '#EDE9FE' }
                        : { name: 'diamond-outline', color: '#D4A84B', bg: '#FEF3C7' };
                  return (
                    <View
                      key={planId}
                      style={[styles.tierPill, active && styles.tierPillActive]}
                    >
                      <View style={[styles.tierIcon, { backgroundColor: tierIcon.bg }]}>
                        <Ionicons name={tierIcon.name} size={16} color={tierIcon.color} />
                      </View>
                      <Text
                        style={[styles.tierPillText, active && styles.tierPillTextActive]}
                      >
                        {planId}
                      </Text>
                    </View>
                  );
                })}
              </View>
              <View style={styles.subscriptionMetaRow}>
                <View style={styles.metaChip}>
                  <Ionicons name="checkmark-circle" size={14} color="#16A34A" />
                  <Text style={styles.subscriptionMeta}>{getMembershipFeatures(tier).name}</Text>
                </View>
                <View style={styles.metaChip}>
                  <Ionicons
                    name={features.hasVideo ? 'videocam' : 'headset'}
                    size={14}
                    color="#7C3AED"
                  />
                  <Text style={styles.subscriptionMeta}>
                    {features.hasVideo
                      ? t('membership.includesVideo')
                      : t('membership.audioOnly')}
                  </Text>
                </View>
                <View style={styles.metaChip}>
                  <Ionicons
                    name={features.hasAds ? 'megaphone' : 'shield-checkmark'}
                    size={14}
                    color="#EA580C"
                  />
                  <Text style={styles.subscriptionMeta}>
                    {features.hasAds ? t('membership.withAds') : t('membership.noAds')}
                  </Text>
                </View>
              </View>
              {canUpgrade ? (
                <PrimaryButton
                  label={t('settings.upgradeSubscription')}
                  onPress={() => navigation.navigate('Membership')}
                />
              ) : (
                <OutlineButton
                  label={t('membership.current')}
                  onPress={() => navigation.navigate('Membership')}
                />
              )}
            </View>

            <Pressable style={styles.signOutBtn} onPress={handleSignOut}>
              <Ionicons name="log-out-outline" size={20} color="#DC2626" />
              <Text style={styles.signOutText}>{t('common.signOut')}</Text>
            </Pressable>
          </>
        ) : (
          <>
            <Text style={styles.section}>{t('profile.certificates')}</Text>
            <CertificatePreview
              certificate={certificate}
              progressPercent={stats.percent}
            />
            <PrimaryButton
              label={
                downloadingCertificate
                  ? t('profile.certificateDownloading')
                  : t('achievements.download')
              }
              onPress={handleDownloadCertificate}
              style={styles.downloadBtn}
              disabled={downloadingCertificate}
            />
            {certificate.unlocked ? (
              <View style={styles.benefitsCard}>
                <Text style={styles.benefitsTitle}>{t('profile.certificateBenefits')}</Text>
                <Text style={styles.benefitsItem}>
                  •{' '}
                  {features.certificateSigned
                    ? t('profile.signedCertificate')
                    : t('profile.pdfCertificate')}
                </Text>
                {features.discountPercent > 0 ? (
                  <Text style={styles.benefitsItem}>
                    •{' '}
                    {t('membership.followUpDiscount', {
                      percent: features.discountPercent,
                    })}
                  </Text>
                ) : null}
              </View>
            ) : null}

            <Text style={styles.section}>{t('profile.followUpCourses')}</Text>
            <AdvancedCourseList
              courses={localeAdvancedCourses}
              unlocked={stats.percent >= 100}
              progressPercent={stats.percent}
            />
            <OutlineButton
              label={t('profile.visitWebsite')}
              onPress={() => openWebUrl(BRIDGE_ACADEMY_URL)}
              style={styles.coursesCta}
            />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
