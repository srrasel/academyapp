import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { LoginManager, AccessToken, Settings } from 'react-native-fbsdk-next';
import { signInWithFacebookAccessToken } from '../services/socialAuthService';
import { isFirebaseConfigured } from '../config/env';

let sdkReady = false;

function ensureFacebookSdk() {
  if (sdkReady) return;
  const appId = process.env.EXPO_PUBLIC_FACEBOOK_APP_ID;
  if (!appId) {
    throw new Error('Missing EXPO_PUBLIC_FACEBOOK_APP_ID in .env');
  }
  Settings.setAppID(appId);
  const clientToken = process.env.EXPO_PUBLIC_FACEBOOK_CLIENT_TOKEN;
  if (clientToken) {
    Settings.setClientToken(clientToken);
  }
  Settings.initializeSDK();
  sdkReady = true;
}

export function useFacebookSignIn(onResult) {
  const [loading, setLoading] = useState(false);
  const appId = process.env.EXPO_PUBLIC_FACEBOOK_APP_ID;
  const clientToken = process.env.EXPO_PUBLIC_FACEBOOK_CLIENT_TOKEN;

  useEffect(() => {
    try {
      if (appId && clientToken) ensureFacebookSdk();
    } catch {
      // configured on press if init fails early
    }
  }, [appId, clientToken]);

  const signIn = async () => {
    if (!isFirebaseConfigured()) {
      onResult?.({ error: new Error('Firebase is not configured. Add keys to .env') });
      return;
    }
    if (!appId) {
      onResult?.({
        error: new Error(
          'Missing EXPO_PUBLIC_FACEBOOK_APP_ID in .env (copy App ID from Firebase → Authentication → Facebook).'
        ),
      });
      return;
    }
    if (!clientToken) {
      onResult?.({
        error: new Error(
          'Missing EXPO_PUBLIC_FACEBOOK_CLIENT_TOKEN. Meta → App → Settings → Advanced → Client token (not the App Secret).'
        ),
      });
      return;
    }

    setLoading(true);
    try {
      ensureFacebookSdk();

      // Prefer Facebook app / native sheet over Chrome custom tab
      if (Platform.OS === 'android') {
        LoginManager.setLoginBehavior('native_with_fallback');
      }

      const result = await LoginManager.logInWithPermissions(['public_profile', 'email']);
      if (result.isCancelled) {
        return;
      }

      const data = await AccessToken.getCurrentAccessToken();
      const accessToken = data?.accessToken?.toString?.() || data?.accessToken || null;

      if (!accessToken) {
        throw new Error(
          'Facebook did not return an access token. In Meta, add Android package com.bridgeacademy.app and key hashes (see FIREBASE_SETUP.md).'
        );
      }

      const authResult = await signInWithFacebookAccessToken(accessToken);
      onResult?.({ ...authResult });
    } catch (error) {
      const raw = String(error?.message || error || '');
      if (/feature unavailable|updating additional details/i.test(raw)) {
        onResult?.({
          error: new Error(
            'Facebook Login is blocked by Meta for this app right now (Feature unavailable). In Meta for Developers: switch the app to Live, finish Required actions / privacy policy, and add your Facebook account as Tester while configuring. See FIREBASE_SETUP.md § Facebook.'
          ),
        });
        return;
      }
      onResult?.({ error });
    } finally {
      setLoading(false);
    }
  };

  return {
    signIn,
    loading,
    ready: Boolean(appId && clientToken),
  };
}
