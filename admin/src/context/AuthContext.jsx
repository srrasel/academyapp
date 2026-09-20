import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '../firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(isFirebaseConfigured());

  useEffect(() => {
    if (!isFirebaseConfigured() || !auth) {
      setLoading(false);
      return undefined;
    }

    const unsub = onAuthStateChanged(
      auth,
      async (nextUser) => {
        setUser(nextUser);
        if (nextUser && db) {
          const snap = await getDoc(doc(db, 'users', nextUser.uid));
          setProfile(snap.exists() ? snap.data() : null);
        } else {
          setProfile(null);
        }
        setLoading(false);
      },
      () => {
        setLoading(false);
      }
    );

    return unsub;
  }, []);

  const value = useMemo(
    () => ({
      user,
      profile,
      loading,
      isAdmin: profile?.role === 'admin',
      login: (email, password) => {
        if (!auth) {
          return Promise.reject(new Error('Firebase is not configured.'));
        }
        return signInWithEmailAndPassword(auth, email, password);
      },
      resetPassword: (email) => {
        if (!auth) {
          return Promise.reject(new Error('Firebase is not configured.'));
        }
        const trimmed = String(email || '').trim();
        if (!trimmed) {
          return Promise.reject(new Error('Enter your email address first.'));
        }
        return sendPasswordResetEmail(auth, trimmed);
      },
      logout: () => (auth ? signOut(auth) : Promise.resolve()),
    }),
    [user, profile, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAdminAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAdminAuth must be used within AuthProvider');
  }
  return ctx;
}
