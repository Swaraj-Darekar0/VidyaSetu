import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { getCopy, LanguageCode, resolveLanguageCode } from '@/lib/i18n';
import { supabase } from '@/lib/supabase';

const STORAGE_KEY = 'vidyasetu:preferred_language';

type LanguageContextValue = {
  language: LanguageCode;
  setLanguage: (code: LanguageCode) => void;
  copy: ReturnType<typeof getCopy>;
  refreshLanguage: () => Promise<void>;
};

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>('en');

  const applyLanguage = useCallback((value: LanguageCode) => {
    setLanguageState(value);
    AsyncStorage.setItem(STORAGE_KEY, value).catch(() => {});
  }, []);

  const refreshLanguage = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user?.id) {
        const { data } = await supabase.from('onboarding_progress').select('mother_tongue').eq('user_id', user.id).maybeSingle();
        if (data?.mother_tongue) {
          applyLanguage(resolveLanguageCode(data.mother_tongue));
          return;
        }
      }

      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        applyLanguage(resolveLanguageCode(stored));
      }
    } catch (error) {
      console.warn('[language] refreshLanguage:error', error);
    }
  }, [applyLanguage]);

  useEffect(() => {
    refreshLanguage();
  }, [refreshLanguage]);

  const contextValue = useMemo<LanguageContextValue>(
    () => ({
      language,
      setLanguage: applyLanguage,
      copy: getCopy(language),
      refreshLanguage,
    }),
    [language, applyLanguage, refreshLanguage],
  );

  return <LanguageContext.Provider value={contextValue}>{children}</LanguageContext.Provider>;
}

export const useLanguage = () => {
  const value = useContext(LanguageContext);
  if (!value) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return value;
};
