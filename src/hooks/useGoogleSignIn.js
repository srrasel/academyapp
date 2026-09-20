import { useState } from 'react';
import { Platform } from 'react-native';
import {
  GoogleSignin,
  isSuccessResponse,
  isErrorWithCode,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { signInWithGoogleIdToken } from '../services/socialAuthService';
import { isFirebaseConfigured } from '../config/env';

let configured = false;

function ensureGoogleConfigured() {
  if (configured) return;
  const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
  if (!webClientId) {
    throw new Error('Missing EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID in .env');
  }
  GoogleSignin.configure({
    webClientId,
    offlineAccess: false,
    forceCodeForRefreshToken: false,
  });
  configured = true;
}

export function useGoogleSignIn(onResult) {
  const [loading, setLoading] = useState(false);
  const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

  const signIn = async () => {
    if (!isFirebaseConfigured()) {
      onResult?.({ error: new Error('Firebase is not configured. Add keys to .env') });
      return;
    }
    if (!webClientId) {
      onResult?.({
        error: new Error('Missing EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID in .env'),
      });
      return;
    }

    setLoading(true);
    try {
      ensureGoogleConfigured();

      if (Platform.OS === 'android') {
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      }

      const response = await GoogleSignin.signIn();
      if (!isSuccessResponse(response)) {
        // User cancelled account picker — not an error
        return;
      }

      let idToken = response.data?.idToken || null;
      let accessToken = null;

      if (!idToken) {
        const tokens = await GoogleSignin.getTokens();
        idToken = tokens.idToken;
        accessToken = tokens.accessToken;
      }

      if (!idToken) {
        throw new Error(
          'Google did not return an ID token. Confirm WEB client ID matches Firebase project academy-4f825 and SHA-1 fingerprints are registered.'
        );
      }

      const result = await signInWithGoogleIdToken(idToken, accessToken);
      onResult?.({ ...result });
    } catch (error) {
      if (isErrorWithCode(error) && error.code === statusCodes.SIGN_IN_CANCELLED) {
        return;
      }
      if (isErrorWithCode(error) && error.code === statusCodes.IN_PROGRESS) {
        return;
      }
      if (isErrorWithCode(error) && error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        onResult?.({
          error: new Error('Google Play Services is missing or outdated on this device.'),
        });
        return;
      }
      onResult?.({ error });
    } finally {
      setLoading(false);
    }
  };

  return { signIn, loading, ready: Boolean(webClientId) };
}
