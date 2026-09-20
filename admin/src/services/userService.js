import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { firebaseConfig, db } from '../firebase';

export async function createUserAccount({
  email,
  password,
  displayName,
  role = 'user',
  language = 'en',
}) {
  const appName = `Secondary-${Date.now()}`;
  const secondaryApp = initializeApp(firebaseConfig, appName);
  const secondaryAuth = getAuth(secondaryApp);

  try {
    const credential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
    const profile = {
      email,
      displayName: displayName?.trim() || email.split('@')[0],
      role: role === 'admin' ? 'admin' : 'user',
      language,
      onboardingComplete: false,
      createdAt: Date.now(),
    };
    await setDoc(doc(db, 'users', credential.user.uid), profile);
    return { uid: credential.user.uid, ...profile };
  } finally {
    await signOut(secondaryAuth);
    await deleteApp(secondaryApp);
  }
}

export async function deleteUserAccount(userId) {
  await deleteDoc(doc(db, 'users', userId));
}
