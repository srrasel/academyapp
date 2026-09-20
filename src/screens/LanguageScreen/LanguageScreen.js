import { useState } from 'react';
import { View, Text } from 'react-native';
import OnboardingLayout from '../../components/OnboardingLayout/OnboardingLayout';
import OnboardingHeader from '../../components/OnboardingHeader/OnboardingHeader';
import LanguageListItem from '../../components/LanguageListItem/LanguageListItem';
import PrimaryButton from '../../components/PrimaryButton/PrimaryButton';
import { useAuth } from '../../context/AuthContext';
import { useLocale } from '../../context/LocaleContext';
import { languages } from '../../data/languages';
import { styles } from './LanguageScreen.styles';

export default function LanguageScreen({ navigation }) {
  const { updateProfile, setOnboardingDraft } = useAuth();
  const { locale, setLocale, t } = useLocale();
  const [selected, setSelected] = useState(locale || 'en');
  const [saving, setSaving] = useState(false);

  const handleContinue = async () => {
    if (saving) return;
    setSaving(true);
    try {
      await setLocale(selected);
      setOnboardingDraft((prev) => ({ ...prev, language: selected }));
      // Persist once so onboarding resume skips this screen.
      await updateProfile({ language: selected });
      navigation.navigate('Goal');
    } finally {
      setSaving(false);
    }
  };

  return (
    <OnboardingLayout
      footer={
        <PrimaryButton
          label={saving ? t('common.pleaseWait') : t('common.continue')}
          onPress={handleContinue}
          disabled={saving}
        />
      }
    >
      <OnboardingHeader
        title={t('language.title')}
        subtitle={t('language.subtitle')}
      />

      <View style={styles.listCard}>
        {languages.map((lang) => (
          <LanguageListItem
            key={lang.id}
            label={lang.name}
            flag={lang.flag}
            selected={selected === lang.id}
            onPress={() => setSelected(lang.id)}
          />
        ))}
      </View>
      <Text style={styles.hint}>{t('language.hint')}</Text>
    </OnboardingLayout>
  );
}
