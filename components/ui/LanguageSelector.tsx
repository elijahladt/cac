'use client';

import React from 'react';
import { Globe } from 'lucide-react';
import { SupportedLanguage } from '@/lib/types';
import { LANGUAGES } from '@/lib/i18n';

interface LanguageSelectorProps {
  currentLanguage: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
}

export function LanguageSelector({ currentLanguage, onLanguageChange }: LanguageSelectorProps) {
  return (
    <div className="relative inline-flex items-center">
      <label htmlFor="language-select" className="sr-only">
        Select Language
      </label>
      <Globe className="w-4 h-4 text-slate-500 absolute left-2.5 pointer-events-none" aria-hidden="true" />
      <select
        id="language-select"
        value={currentLanguage}
        onChange={(e) => onLanguageChange(e.target.value as SupportedLanguage)}
        className="pl-8 pr-7 py-1.5 text-xs sm:text-sm font-medium bg-white border border-slate-300 rounded-lg text-slate-700 shadow-sm hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-civic-600 focus:border-transparent cursor-pointer appearance-none"
      >
        {LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.nativeName} ({lang.label})
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
        <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20">
          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
        </svg>
      </div>
    </div>
  );
}
