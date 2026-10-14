import React from 'react';
import { useI18n } from '@/lib/i18n';

export default function LanguageToggle({ className = '' }) {
  const { lang, setLang } = useI18n();
  return (
    <div className={`flex items-center rounded-lg border border-hair bg-surface2 text-[11px] font-bold overflow-hidden shrink-0 ${className}`}>
      <button
        type="button"
        onClick={() => setLang('fr')}
        title="Français"
        className={`px-2.5 py-1.5 transition-colors ${lang === 'fr' ? 'bg-gold/15 text-gold' : 'text-inkmuted hover:text-gold'}`}
      >
        FR
      </button>
      <button
        type="button"
        onClick={() => setLang('en')}
        title="English"
        className={`px-2.5 py-1.5 transition-colors ${lang === 'en' ? 'bg-gold/15 text-gold' : 'text-inkmuted hover:text-gold'}`}
      >
        EN
      </button>
    </div>
  );
}