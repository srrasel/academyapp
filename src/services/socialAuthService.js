import {
  FacebookAuthProvider,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithCredential,
} from 'firebase/auth';
import * as AppleAuthentication from 'expo-apple-authentication';
import { Platform } from 'react-native';
import { auth, isFirebaseConfigured } from '../config/firebase';
import { ensureUserDocument } from './authService';

export async function signInWithGoogleIdToken(idToken, accessToken) {
  if (!isFirebaseConfigured()) {
    throw new Error('Firebase is not configured. Add keys to .env');
  }

  const credential = GoogleAuthProvider.credential(idToken, accessToken);
  const result = await signInWithCredential(auth, credential);
  const profile = await ensureUserDocument(result.user, { provider: 'google' });
  return { user: result.user, profile };
}

export async function signInWithFacebookAccessToken(accessToken) {
  if (!isFirebaseConfigured()) {
    throw new Error('Firebase is not configured. Add keys to .env');
  }

  if (!accessToken) {
    throw new Error('Facebook sign-in failed to return an access token.');
  }

  const credential = FacebookAuthProvider.credential(accessToken);
  const result = await signInWithCredential(auth, credential);
  const profile = await ensureUserDocument(result.user, { provider: 'facebook' });
  return { user: result.user, profile };
}

export async function signInWithApple() {
  if (!isFirebaseConfigured()) {
    throw new Error('Firebase is not configured. Add keys to .env');
  }

  if (Platform.OS !== 'ios') {
    throw new Error('Apple Sign-In is only available on iOS devices.');
  }

  const available = await AppleAuthentication.isAvailableAsync();
  if (!available) {
    throw new Error('Apple Sign-In is not available on this device.');
  }

  const appleResult = await AppleAuthentication.signInAsync({
    requestedScopes: [
      AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
      AppleAuthentication.AppleAuthenticationScope.EMAIL,
    ],
  });

  if (!appleResult.identityToken) {
    throw new Error('Apple Sign-In failed to return an identity token.');
  }

  const provider = new OAuthProvider('apple.com');
  const credential = provider.credential({
    idToken: appleResult.identityToken,
  });

  const result = await signInWithCredential(auth, credential);

  const displayName = appleResult.fullName
    ? [appleResult.fullName.givenName, appleResult.fullName.familyName]
        .filter(Boolean)
        .join(' ')
    : result.user.displayName;

  const profile = await ensureUserDocument(result.user, {
    provider: 'apple',
    displayName,
  });

  return { user: result.user, profile };
}

export async function isAppleSignInAvailable() {
  if (Platform.OS !== 'ios') return false;
  try {
    return await AppleAuthentication.isAvailableAsync();
  } catch {
    return false;
  }
}
