import { useEffect, useState } from 'react';
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
import { getFriendlyAuthError } from '../../utils/authErrors';
import { colors } from '../../theme/colors';
import { styles } from './EmailAuthScreen.styles';

export default function EmailAuthScreen({ navigation, route }) {
  const { signIn, resetPassword } = useAuth();
  const { t } = useLocale();
  const [email, setEmail] = useState(route.params?.email || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    if (route.params?.email) {
      setEmail(String(route.params.email));
    }
  }, [route.params?.email]);

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert(t('account.missingFieldsTitle'), t('account.missingFieldsMessage'));
      return;
    }

    setLoading(true);
    try {
      await signIn({ email: email.trim(), password });
    } catch (error) {
      Alert.alert(t('account.loginFailed'), getFriendlyAuthError(error, t, 'login'));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      Alert.alert(t('account.forgotPasswordTitle'), t('account.forgotPasswordNeedEmail'));
      return;
    }

    Alert.alert(t('account.forgotPasswordTitle'), t('account.forgotPasswordMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('account.forgotPasswordSend'),
        onPress: async () => {
          setResetting(true);
          try {
            await resetPassword(trimmedEmail);
            Alert.alert(
              t('account.forgotPasswordSentTitle'),
              t('account.forgotPasswordSentMessage', { email: trimmedEmail })
            );
          } catch (error) {
            Alert.alert(
              t('account.forgotPasswordFailed'),
              getFriendlyAuthError(error, t, 'login')
            );
          } finally {
            setResetting(false);
          }
        },
      },
    ]);
  };

  return (
    <OnboardingLayout contentStyle={styles.screenContent}>
      <OnboardingHeader
        title={t('account.welcomeBack')}
        subtitle={t('account.loginSubtitle')}
        onBack={() => goBackOr(navigation, 'Welcome')}
        align="left"
        compact
      />

      <View style={styles.form}>
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

        <Pressable onPress={handleForgotPassword} hitSlop={8} style={styles.forgotPressable}>
          <Text style={styles.forgotText}>{t('account.forgotPassword')}</Text>
        </Pressable>
      </View>

      <PrimaryButton
        label={loading || resetting ? t('common.pleaseWait') : t('welcome.login')}
        onPress={handleSubmit}
        disabled={loading || resetting}
        style={styles.primaryCta}
      />

      <View style={styles.socialSection}>
        <Divider label={t('account.orContinueWith')} />
        <SocialAuthButtons
          navigation={navigation}
          mode="login"
          providers={['google', 'facebook']}
        />
      </View>

      <Pressable
        onPress={() => navigation.navigate('CreateAccount')}
        hitSlop={8}
        style={styles.switchPressable}
      >
        <Text pointerEvents="none" style={styles.switchText}>
          {t('account.noAccount')}
          <Text style={styles.switchLink}>{t('account.createAccount')}</Text>
        </Text>
      </Pressable>
    </OnboardingLayout>
  );
}
