import { useEffect, useState } from 'react';
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
import AppHeader from '../../components/AppHeader/AppHeader';
import LanguageListItem from '../../components/LanguageListItem/LanguageListItem';
import ProfileAvatar from '../../components/ProfileAvatar/ProfileAvatar';
import PrimaryButton from '../../components/PrimaryButton/PrimaryButton';
import OutlineButton from '../../components/OutlineButton/OutlineButton';
import { useAuth } from '../../context/AuthContext';
import { useLocale } from '../../context/LocaleContext';
import { useMembership } from '../../hooks/useMembership';
import {
  getVisibleMembershipPlans,
  getMembershipFeatures,
} from '../../constants/membership';
import { languages } from '../../data/languages';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { styles } from './SettingsScreen.styles';

export default function SettingsScreen({ navigation }) {
  const { profile, signOut, setOnboardingDraft, updateProfile } = useAuth();
  const { setLocale, t } = useLocale();
  const { tier, features } = useMembership();
  const [language, setLanguage] = useState(profile?.language || 'en');
  const [personalStory, setPersonalStory] = useState(profile?.personalStory || '');
  const [age, setAge] = useState(profile?.age ? String(profile.age) : '');
  const [savingLanguage, setSavingLanguage] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    setPersonalStory(profile?.personalStory || '');
    setAge(profile?.age ? String(profile.age) : '');
    setLanguage(profile?.language || 'en');
  }, [profile?.personalStory, profile?.age, profile?.language]);

  const saveLanguage = async (langId) => {
    setLanguage(langId);
    setOnboardingDraft((prev) => ({ ...prev, language: langId }));
    setSavingLanguage(true);
    try {
      await setLocale(langId);
      await updateProfile({ language: langId });
    } finally {
      setSavingLanguage(false);
    }
  };

  const savePersonalDetails = async () => {
    setSavingProfile(true);
    try {
      const trimmedAge = age.trim();
      await updateProfile({
        personalStory: personalStory.trim(),
        age: trimmedAge ? Number(trimmedAge) : null,
      });
      Alert.alert(t('settings.savedTitle'), t('settings.savedMessage'));
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePhotoChange = async (photoUri) => {
    await updateProfile({ photoUri });
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

  const canUpgrade = tier !== 'gold';

  return (
    <SafeAreaView style={styles.scroll} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <AppHeader variant="back" onBack={() => navigation.goBack()} />
        <Text style={styles.title}>{t('settings.title')}</Text>

        <View style={styles.profileCard}>
          <ProfileAvatar
            name={profile?.displayName}
            photoUri={profile?.photoUri}
            editable
            onPhotoChange={handlePhotoChange}
            hint={t('settings.photoHint')}
          />
          <Text style={styles.profileName}>
            {profile?.displayName || t('common.learner')}
          </Text>
          <Text style={styles.profileEmail}>{profile?.email || '—'}</Text>
        </View>

        <Text style={styles.section}>{t('settings.aboutYou')}</Text>
        <View style={styles.card}>
          <Text style={styles.label}>{t('settings.personalStory')}</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={personalStory}
            onChangeText={setPersonalStory}
            placeholder={t('settings.personalStoryPlaceholder')}
            placeholderTextColor={colors.textMuted}
            multiline
          />
          <Text style={styles.optionalHint}>{t('settings.optional')}</Text>

          <Text style={[styles.label, { marginTop: spacing.md }]}>{t('settings.age')}</Text>
          <TextInput
            style={styles.input}
            value={age}
            onChangeText={setAge}
            placeholder={t('settings.agePlaceholder')}
            placeholderTextColor={colors.textMuted}
            keyboardType="number-pad"
            maxLength={3}
          />
          <Text style={styles.optionalHint}>{t('settings.optional')}</Text>

          <PrimaryButton
            label={savingProfile ? t('common.saving') : t('settings.saveProfile')}
            onPress={savePersonalDetails}
            disabled={savingProfile}
            style={styles.saveProfileBtn}
          />
        </View>

        <Text style={styles.section}>{t('settings.subscription')}</Text>
        <View style={styles.subscriptionCard}>
          <View style={styles.tierRow}>
            {getVisibleMembershipPlans(tier).map((planId) => {
              const active = planId === tier;
              return (
                <View
                  key={planId}
                  style={[styles.tierPill, active && styles.tierPillActive]}
                >
                  <Text style={[styles.tierPillText, active && styles.tierPillTextActive]}>
                    {planId}
                  </Text>
                </View>
              );
            })}
          </View>
          <Text style={styles.subscriptionMeta}>
            {getMembershipFeatures(tier).name}
            {' • '}
            {features.hasVideo ? t('membership.includesVideo') : t('membership.audioOnly')}
            {' • '}
            {features.hasAds ? t('membership.withAds') : t('membership.noAds')}
          </Text>
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

        <Text style={styles.section}>
          {t('settings.language')} {savingLanguage ? t('settings.savingLanguage') : ''}
        </Text>
        <View style={styles.card}>
          {languages.map((lang) => (
            <LanguageListItem
              key={lang.id}
              label={lang.name}
              flag={lang.flag}
              selected={language === lang.id}
              onPress={() => saveLanguage(lang.id)}
            />
          ))}
        </View>

        <Pressable style={styles.signOutBtn} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={20} color="#DC2626" />
          <Text style={styles.signOutText}>{t('common.signOut')}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
