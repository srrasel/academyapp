import { useState } from 'react';
import { View, Text, TextInput, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import OnboardingLayout from '../../components/OnboardingLayout/OnboardingLayout';
import OnboardingHeader from '../../components/OnboardingHeader/OnboardingHeader';
import PrimaryButton from '../../components/PrimaryButton/PrimaryButton';
import SocialAuthButtons from '../../components/SocialAuthButtons/SocialAuthButtons';
import Divider from '../../components/Divider/Divider';
import { useAuth } from '../../context/AuthContext';
import { useLocale } from '../../context/LocaleContext';
import { goBackOr } from '../../utils/navigationHelpers';
import { getFriendlyAuthError, isEmailAlreadyInUseError } from '../../utils/authErrors';
import { colors } from '../../theme/colors';
import { styles } from './CreateAccountScreen.styles';

export default function CreateAccountScreen({ navigation }) {
  const { signUp, setOnboardingDraft } = useAuth();
  const { t } = useLocale();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const goToLoginWithEmail = (loginEmail) => {
    navigation.navigate('EmailAuth', {
      mode: 'login',
      email: loginEmail,
    });
  };

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert(t('account.missingFieldsTitle'), t('account.missingFieldsMessage'));
      return;
    }

    if (password.length < 6) {
      Alert.alert(t('account.weakPasswordTitle'), t('account.weakPasswordMessage'));
      return;
    }

    const trimmedEmail = email.trim();
    setLoading(true);
    try {
      const displayName = name.trim() || trimmedEmail.split('@')[0];
      await signUp({
        email: trimmedEmail,
        password,
        displayName,
      });
      setOnboardingDraft((prev) => ({
        ...prev,
        displayName,
      }));
    } catch (error) {
      if (isEmailAlreadyInUseError(error)) {
        Alert.alert(
          t('account.signupFailed'),
          t('account.errors.emailInUse'),
          [
            { text: t('common.cancel'), style: 'cancel' },
            {
              text: t('account.loginWithThisEmail'),
              onPress: () => goToLoginWithEmail(trimmedEmail),
            },
          ]
        );
      } else {
        Alert.alert(t('account.signupFailed'), getFriendlyAuthError(error, t, 'signup'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <OnboardingLayout contentStyle={styles.screenContent}>
      <OnboardingHeader
        title={t('account.createTitle')}
        subtitle={t('account.createSubtitle')}
        onBack={() => goBackOr(navigation, 'Welcome')}
        align="left"
        compact
      />

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder={t('account.fullName')}
          placeholderTextColor={colors.textMuted}
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />
        <TextInput
          style={styles.input}
          placeholder={t('account.email')}
          placeholderTextColor={colors.textMuted}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <View style={styles.passwordWrap}>
          <TextInput
            style={styles.passwordInput}
            placeholder={t('account.password')}
            placeholderTextColor={colors.textMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Pressable
            style={styles.eyeButton}
            onPress={() => setShowPassword((prev) => !prev)}
            hitSlop={8}
            accessibilityLabel={showPassword ? t('account.hidePassword') : t('account.showPassword')}
          >
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={22}
              color={colors.textMuted}
            />
          </Pressable>
        </View>
        <Text style={styles.passwordHint}>{t('account.passwordHint')}</Text>
      </View>

      <PrimaryButton
        label={loading ? t('common.pleaseWait') : t('account.createAccount')}
        onPress={handleSubmit}
        disabled={loading}
        style={styles.primaryCta}
      />

      <View style={styles.socialSection}>
        <Divider label={t('account.orContinueWith')} />
        <SocialAuthButtons
          navigation={navigation}
          mode="signup"
          providers={['google', 'facebook']}
        />
      </View>

      <Pressable
        style={styles.footer}
        onPress={() => navigation.navigate('EmailAuth', { mode: 'login' })}
        hitSlop={8}
      >
        <Text pointerEvents="none" style={styles.footerText}>
          {t('account.hasAccount')}
          <Text style={styles.footerLink}>{t('welcome.login')}</Text>
        </Text>
      </Pressable>
    </OnboardingLayout>
  );
}
