import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence,
} from '@firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { firebaseConfig, isFirebaseConfigured } from './env';

let app = null;
let auth = null;
let db = null;
let storage = null;

function buildAuthPersistence(storage) {
  if (typeof getReactNativePersistence === 'function') {
    return getReactNativePersistence(storage);
  }

  class LocalAsyncStoragePersistence {
    constructor() {
      this.type = 'LOCAL';
    }

    async _isAvailable() {
      try {
        if (!storage) return false;
        await storage.setItem('__firebase_auth_storage_test__', '1');
        await storage.removeItem('__firebase_auth_storage_test__');
        return true;
      } catch {
        return false;
      }
    }

    _set(key, value) {
      return storage.setItem(key, JSON.stringify(value));
    }

    async _get(key) {
      const json = await storage.getItem(key);
      return json ? JSON.parse(json) : null;
    }

    _remove(key) {
      return storage.removeItem(key);
    }

    _addListener() {}

    _removeListener() {}
  }

  LocalAsyncStoragePersistence.type = 'LOCAL';
  return LocalAsyncStoragePersistence;
}

function initAuth(appInstance) {
  const persistence = buildAuthPersistence(AsyncStorage);

  try {
    return initializeAuth(appInstance, { persistence });
  } catch (error) {
    if (error?.code === 'auth/already-initialized') {
      return getAuth(appInstance);
    }
    console.warn('Firebase auth init failed:', error?.message);
    return null;
  }
}

if (isFirebaseConfigured()) {
  try {
    app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
    auth = initAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
  } catch (error) {
    console.warn('Firebase init failed:', error?.message);
    app = null;
    auth = null;
    db = null;
    storage = null;
  }
}

export function isFirebaseReady() {
  return Boolean(app && auth && db);
}

export { app, auth, db, storage, isFirebaseConfigured };
