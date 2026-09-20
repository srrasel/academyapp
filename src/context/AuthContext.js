import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, isFirebaseConfigured } from '../config/firebase';
import {
  getUserProfile,
  signInWithEmail,
  signOutUser,
  signUpWithEmail,
  completeOnboarding,
  updateUserProfile,
  ensureUserDocument,
  resetPassword as sendPasswordReset,
} from '../services/authService';

const AuthContext = createContext(null);
const GUEST_KEY = '@academy_guest_session';
const AUTH_TIMEOUT_MS = 8000;

async function loadGuestSession() {
  const raw = await AsyncStorage.getItem(GUEST_KEY);
  return raw ? JSON.parse(raw) : null;
}

async function saveGuestSession(session) {
  await AsyncStorage.setItem(GUEST_KEY, JSON.stringify(session));
}

async function clearGuestSession() {
  await AsyncStorage.removeItem(GUEST_KEY);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [onboardingDraft, setOnboardingDraft] = useState({
    language: 'en',
    goal: 'coach',
    displayName: '',
  });

  useEffect(() => {
    let active = true;
    let authResolved = false;
    let unsub = () => {};

    const finishLoading = () => {
      if (active && !authResolved) {
        authResolved = true;
        setLoading(false);
      }
    };

    const timeout = setTimeout(() => {
      if (!authResolved) finishLoading();
    }, AUTH_TIMEOUT_MS);

    const applyAuthUser = async (nextUser) => {
      if (!active) return;

      if (nextUser) {
        await clearGuestSession();
      }

      setUser(nextUser);

      if (nextUser) {
        try {
          let data = await getUserProfile(nextUser.uid);
          if (!data) {
            data = await ensureUserDocument(nextUser);
          }
          if (active) {
            setProfile(data);
            if (data?.language || data?.goal || data?.displayName) {
              setOnboardingDraft((prev) => ({
                ...prev,
                language: data.language || prev.language,
                goal: data.goal || prev.goal,
                displayName: data.displayName || prev.displayName,
              }));
            }
          }
        } catch {
          if (active) setProfile(null);
        }
      } else {
        setProfile(null);
      }

      finishLoading();
    };

    if (!auth) {
      loadGuestSession()
        .then((session) => {
          if (!active) return;
          if (session) {
            setUser(session.user);
            setProfile(session.profile);
          }
        })
        .catch(() => {})
        .finally(finishLoading);
      return () => {
        active = false;
        clearTimeout(timeout);
      };
    }

    (async () => {
      try {
        await auth.authStateReady();
      } catch {
        // Continue — onAuthStateChanged still runs below.
      }

      if (!active) return;

      unsub = onAuthStateChanged(
        auth,
        (nextUser) => {
          applyAuthUser(nextUser).catch(() => finishLoading());
        },
        () => {
          finishLoading();
        }
      );
    })();

    return () => {
      active = false;
      clearTimeout(timeout);
      unsub();
    };
  }, []);

  const guestSignUp = async ({ email, password, displayName }) => {
    const guestUser = {
      uid: `guest-${Date.now()}`,
      email,
      displayName: displayName || email.split('@')[0],
    };
    const guestProfile = {
      id: guestUser.uid,
      email,
      displayName: guestUser.displayName,
      role: 'user',
      language: null,
      goal: null,
      membershipTier: 'free',
      onboardingComplete: false,
    };
    setUser(guestUser);
    setProfile(guestProfile);
    await saveGuestSession({ user: guestUser, profile: guestProfile });
    return guestUser;
  };

  const guestSignIn = async ({ email }) => {
    const session = await loadGuestSession();
    if (session?.user?.email === email) {
      setUser(session.user);
      setProfile(session.profile);
      return session.user;
    }
    return guestSignUp({ email, password: 'guest', displayName: email.split('@')[0] });
  };

  const value = useMemo(
    () => ({
      user,
      profile,
      loading,
      isDemoMode: !isFirebaseConfigured(),
      onboardingDraft,
      setOnboardingDraft,
      signUp: async (payload) => {
        if (isFirebaseConfigured()) {
          await clearGuestSession();
          const nextUser = await signUpWithEmail(payload);
          const data = await getUserProfile(nextUser.uid);
          setProfile(data);
          return { user: nextUser, profile: data };
        }
        const nextUser = await guestSignUp(payload);
        return { user: nextUser, profile: { onboardingComplete: false } };
      },
      signIn: async (payload) => {
        if (isFirebaseConfigured()) {
          await clearGuestSession();
          const nextUser = await signInWithEmail(payload);
          let data = await getUserProfile(nextUser.uid);
          if (!data) {
            data = await ensureUserDocument(nextUser);
          }
          setProfile(data);
          return { user: nextUser, profile: data };
        }
        const nextUser = await guestSignIn(payload);
        const session = await loadGuestSession();
        return { user: nextUser, profile: session?.profile };
      },
      resetPassword: async (email) => {
        if (!isFirebaseConfigured()) {
          throw new Error('Firebase is not configured. Add keys to .env');
        }
        await sendPasswordReset(email);
      },
      signOut: async () => {
        if (isFirebaseConfigured()) {
          await signOutUser();
          await clearGuestSession();
        } else {
          await clearGuestSession();
          setUser(null);
          setProfile(null);
        }
      },
      finishOnboarding: async () => {
        if (!user) return;
        const payload = {
          language: onboardingDraft.language,
          goal: onboardingDraft.goal,
          displayName: onboardingDraft.displayName || user.displayName || 'Learner',
          onboardingComplete: true,
        };

        if (isFirebaseConfigured()) {
          await completeOnboarding(user.uid, payload);
          const data = await getUserProfile(user.uid);
          setProfile(data);
        } else {
          const nextProfile = { ...profile, ...payload };
          setProfile(nextProfile);
          await saveGuestSession({ user, profile: nextProfile });
        }
      },
      refreshProfile: async () => {
        if (!user || !isFirebaseConfigured()) return profile;
        const data = await getUserProfile(user.uid);
        setProfile(data);
        return data;
      },
      updateProfile: async (data) => {
        if (isFirebaseConfigured() && user?.uid) {
          await updateUserProfile(user.uid, data);
          const next = await getUserProfile(user.uid);
          setProfile(next);
        } else if (user) {
          const next = { ...profile, ...data };
          setProfile(next);
          await saveGuestSession({ user, profile: next });
        }
      },
    }),
    [user, profile, loading, onboardingDraft]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
