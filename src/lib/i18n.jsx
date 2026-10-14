import React, { createContext, useContext, useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import moment from 'moment';
import 'moment/locale/fr';
import { FR } from '@/lib/i18nTexts';

const I18nContext = createContext({ lang: 'fr', setLang: () => {}, t: (k) => k });

/**
 * LanguageProvider — drives the app language (default: French).
 * The choice is stored on the user's profile (base44 user field "language")
 * and in localStorage as an instant fallback.
 */
export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    try { return localStorage.getItem('app_language') || 'fr'; } catch (e) { return 'fr'; }
  });

  const setLang = useCallback((l) => {
    setLangState(l);
    try { localStorage.setItem('app_language', l); } catch (e) { /* ignore */ }
    base44.auth.updateMe({ language: l }).catch(() => {});
  }, []);

  // Prefer the language saved on the user's profile once the profile loads
  useEffect(() => {
    let cancelled = false;
    base44.auth.me().then((u) => {
      if (!cancelled && (u?.language === 'fr' || u?.language === 'en')) {
        try { localStorage.setItem('app_language', u.language); } catch (e) { /* ignore */ }
        setLangState(u.language);
      }
    }).catch(() => {});
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    moment.locale(lang === 'fr' ? 'fr' : 'en');
    document.documentElement.lang = lang;
  }, [lang]);

  // Keys are the English base strings; FR maps them to French.
  // {var} placeholders are interpolated in both languages.
  const t = useCallback((key, vars) => {
    let s = lang === 'fr' ? (FR[key] ?? key) : String(key);
    if (vars) {
      s = s.replace(/\{(\w+)\}/g, (m, k) =>
        vars[k] !== undefined && vars[k] !== null ? String(vars[k]) : m
      );
    }
    return s;
  }, [lang]);

  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}

export function useT() {
  return useContext(I18nContext).t;
}