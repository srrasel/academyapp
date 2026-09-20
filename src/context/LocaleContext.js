import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { InteractionManager } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';
import { DEFAULT_LOCALE, SUPPORTED_LOCALES, translate } from '../i18n';
import { syncTranslationsForLocale } from '../services/firebaseTranslationService';

const LOCALE_KEY = '@academy_locale';

const LocaleContext = createContext(null);

export function LocaleProvider({ children }) {
  const { profile } = useAuth();
  const [locale, setLocaleState] = useState(profile?.language || DEFAULT_LOCALE);
  const [ready, setReady] = useState(false);
  const [translationsVersion, setTranslationsVersion] = useState(0);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(LOCALE_KEY)
      .then((saved) => {
        if (!active) return;
        if (saved && SUPPORTED_LOCALES.includes(saved)) {
          setLocaleState(saved);
        } else if (profile?.language && SUPPORTED_LOCALES.includes(profile.language)) {
          setLocaleState(profile.language);
        }
      })
      .finally(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (profile?.language && SUPPORTED_LOCALES.includes(profile.language)) {
      setLocaleState(profile.language);
      AsyncStorage.setItem(LOCALE_KEY, profile.language);
    }
  }, [profile?.language]);

  useEffect(() => {
    let active = true;
    const task = InteractionManager.runAfterInteractions(() => {
      syncTranslationsForLocale(locale).then(() => {
        if (active) setTranslationsVersion((value) => value + 1);
      });
    });
    return () => {
      active = false;
      task.cancel?.();
    };
  }, [locale]);

  const setLocale = useCallback(async (nextLocale) => {
    const normalized = SUPPORTED_LOCALES.includes(nextLocale) ? nextLocale : DEFAULT_LOCALE;
    setLocaleState(normalized);
    await AsyncStorage.setItem(LOCALE_KEY, normalized);
    await syncTranslationsForLocale(normalized);
    setTranslationsVersion((value) => value + 1);
  }, []);

  const t = useCallback(
    (key, params) => translate(locale, key, params),
    [locale, translationsVersion]
  );

  const value = useMemo(
    () => ({ locale, setLocale, t, ready, translationsVersion }),
    [locale, setLocale, t, ready, translationsVersion]
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider');
  return ctx;
}
