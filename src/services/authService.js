import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured, isFirebaseReady } from '../config/firebase';

export async function signUpWithEmail({ email, password, displayName }) {
  if (!isFirebaseConfigured()) {
    throw new Error('Firebase is not configured. Add keys to .env');
  }

  const credential = await createUserWithEmailAndPassword(auth, email, password);
  if (displayName) {
    await updateProfile(credential.user, { displayName });
  }

  await setDoc(doc(db, 'users', credential.user.uid), {
    email,
    displayName: displayName || email.split('@')[0],
    role: 'user',
    language: null,
    goal: null,
    membershipTier: 'free',
    onboardingComplete: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return credential.user;
}

export async function signInWithEmail({ email, password }) {
  if (!isFirebaseConfigured()) {
    throw new Error('Firebase is not configured. Add keys to .env');
  }

  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

export async function resetPassword(email) {
  if (!isFirebaseConfigured()) {
    throw new Error('Firebase is not configured. Add keys to .env');
  }

  const trimmed = String(email || '').trim();
  if (!trimmed) {
    const error = new Error('Missing email');
    error.code = 'auth/missing-email';
    throw error;
  }

  await sendPasswordResetEmail(auth, trimmed);
}

export async function signOutUser() {
  if (!auth) return;
  await firebaseSignOut(auth);
}

export async function getUserProfile(uid) {
  if (!isFirebaseReady() || !uid) return null;
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function updateUserProfile(uid, data) {
  if (!isFirebaseReady() || !uid) return;
  await setDoc(
    doc(db, 'users', uid),
    { ...data, updatedAt: serverTimestamp() },
    { merge: true }
  );
}

export async function completeOnboarding(uid, { language, goal, displayName }) {
  await updateUserProfile(uid, {
    language,
    goal,
    displayName,
    onboardingComplete: true,
  });
}

export async function ensureUserDocument(user, extra = {}) {
  if (!isFirebaseReady() || !user?.uid) return null;

  const ref = doc(db, 'users', user.uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    await setDoc(ref, {
      email: user.email ?? extra.email ?? null,
      displayName: extra.displayName || user.displayName || 'Learner',
      role: 'user',
      language: null,
      goal: null,
      membershipTier: 'free',
      onboardingComplete: false,
      authProvider: extra.provider ?? 'email',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } else if (extra.displayName && !snap.data().displayName) {
    await updateUserProfile(user.uid, { displayName: extra.displayName });
  }

  return getUserProfile(user.uid);
}
