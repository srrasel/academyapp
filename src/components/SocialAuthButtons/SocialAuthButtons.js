import { useEffect, useState } from 'react';
import { View, Alert, ActivityIndicator } from 'react-native';
import SocialButton from '../SocialButton/SocialButton';
import GoogleSignInButton from './GoogleSignInButton';
import FacebookSignInButton from './FacebookSignInButton';
import { signInWithApple, isAppleSignInAvailable } from '../../services/socialAuthService';
import { useAuth } from '../../context/AuthContext';
import { useLocale } from '../../context/LocaleContext';
import { isFirebaseConfigured } from '../../config/env';
import { getFriendlyAuthError } from '../../utils/authErrors';
import { colors } from '../../theme/colors';

const canUseGoogle =
  isFirebaseConfigured() && Boolean(process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID);

const canUseFacebook =
  isFirebaseConfigured() &&
  Boolean(process.env.EXPO_PUBLIC_FACEBOOK_APP_ID) &&
  Boolean(process.env.EXPO_PUBLIC_FACEBOOK_CLIENT_TOKEN);

export default function SocialAuthButtons({
  navigation,
  mode = 'signup',
  providers = ['google', 'apple', 'facebook'],
}) {
  const { setOnboardingDraft } = useAuth();
  const { t } = useLocale();
  const [appleAvailable, setAppleAvailable] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);

  const goNext = (profile) => {
    if (profile?.displayName) {
      setOnboardingDraft((prev) => ({ ...prev, displayName: profile.displayName }));
    }
  };

  const handleSocialResult = ({ error, profile }) => {
    if (error) {
      Alert.alert(t('account.loginFailed'), getFriendlyAuthError(error, t, 'social'));
      return;
    }
    goNext(profile);
  };

  useEffect(() => {
    isAppleSignInAvailable().then(setAppleAvailable);
  }, []);

  const handleApple = async () => {
    if (!isFirebaseConfigured()) {
      Alert.alert(t('account.loginFailed'), t('account.errors.notConfigured'));
      return;
    }

    setAppleLoading(true);
    try {
      const { profile } = await signInWithApple();
      goNext(profile);
    } catch (error) {
      if (error.code !== 'ERR_REQUEST_CANCELED') {
        Alert.alert(t('account.loginFailed'), getFriendlyAuthError(error, t, 'social'));
      }
    } finally {
      setAppleLoading(false);
    }
  };

  const handleGooglePress = () => {
    if (!isFirebaseConfigured()) {
      Alert.alert(t('account.loginFailed'), t('account.errors.notConfigured'));
      return;
    }
    Alert.alert(t('account.loginFailed'), t('account.errors.socialGeneric'));
  };

  const handleFacebookPress = () => {
    if (!isFirebaseConfigured()) {
      Alert.alert(t('account.loginFailed'), t('account.errors.notConfigured'));
      return;
    }
    Alert.alert(
      t('account.loginFailed'),
      'Add EXPO_PUBLIC_FACEBOOK_APP_ID and EXPO_PUBLIC_FACEBOOK_CLIENT_TOKEN to .env (Meta → Settings → Advanced → Client token). Do not put the App Secret in the app.'
    );
  };

  const busy = appleLoading;

  const showGoogle = providers.includes('google');
  const showApple = providers.includes('apple') && appleAvailable;
  const showFacebook = providers.includes('facebook');

  return (
    <View style={{ gap: 12 }}>
      {busy && <ActivityIndicator color={colors.primary} style={{ marginBottom: 4 }} />}
      {showGoogle &&
        (canUseGoogle ? (
          <GoogleSignInButton onResult={handleSocialResult} disabled={busy} />
        ) : (
          <SocialButton provider="google" onPress={handleGooglePress} showChevron={false} />
        ))}
      {showApple && (
        <SocialButton
          provider="apple"
          onPress={handleApple}
          showChevron={false}
          disabled={busy}
        />
      )}
      {showFacebook &&
        (canUseFacebook ? (
          <FacebookSignInButton onResult={handleSocialResult} disabled={busy} />
        ) : (
          <SocialButton
            provider="facebook"
            onPress={handleFacebookPress}
            showChevron={false}
            disabled={busy}
          />
        ))}
    </View>
  );
}
