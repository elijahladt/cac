'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Mic,
  Search,
  Zap,
  Apple,
  Home,
  HeartPulse,
  Briefcase,
  Bus,
  Baby,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  MapPin,
  FileCheck2,
} from 'lucide-react';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { ResourceCategory } from '@/lib/types';

export default function HomePage() {
  const router = useRouter();
  const { language, t } = useLanguage();
  const [query, setQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/chat?q=${encodeURIComponent(query.trim())}`);
  };

  const handleCategoryClick = (category: ResourceCategory) => {
    router.push(`/resources?category=${category}`);
  };

  const startVoice = () => {
    router.push(`/chat?mode=voice`);
  };

  const handleQuickDemo = (text: string) => {
    router.push(`/chat?q=${encodeURIComponent(text)}`);
  };

  const categoryCards: {
    category: ResourceCategory;
    name: string;
    icon: React.ComponentType<{ className?: string }>;
    description: string;
    color: string;
  }[] = [
    {
      category: 'utility_assistance',
      name: t.categories.utility_assistance,
      icon: Zap,
      description: 'Power, gas, water bill payment help & shutoff prevention',
      color: 'bg-amber-50 text-amber-700 border-amber-200 hover:border-amber-300',
    },
    {
      category: 'food_assistance',
      name: t.categories.food_assistance,
      icon: Apple,
      description: 'Food pantries, SNAP/EBT, kids meal distributions & grocery boxes',
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:border-emerald-300',
    },
    {
      category: 'housing',
      name: t.categories.housing,
      icon: Home,
      description: 'Emergency rent relief, eviction defense & family shelters',
      color: 'bg-blue-50 text-blue-700 border-blue-200 hover:border-blue-300',
    },
    {
      category: 'healthcare',
      name: t.categories.healthcare,
      icon: HeartPulse,
      description: 'Community clinics, prescription assistance, Medicaid & mental health',
      color: 'bg-rose-50 text-rose-700 border-rose-200 hover:border-rose-300',
    },
    {
      category: 'jobs',
      name: t.categories.jobs,
      icon: Briefcase,
      description: 'Workforce training, job fairs, resume coaching & unemployment support',
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:border-indigo-300',
    },
    {
      category: 'transportation',
      name: t.categories.transportation,
      icon: Bus,
      description: 'RTC bus passes, medical transit & non-emergency transit passes',
      color: 'bg-teal-50 text-teal-700 border-teal-200 hover:border-teal-300',
    },
    {
      category: 'childcare',
      name: t.categories.childcare,
      icon: Baby,
      description: 'Subsidized childcare, Head Start, after-school & diaper banks',
      color: 'bg-purple-50 text-purple-700 border-purple-200 hover:border-purple-300',
    },
    {
      category: 'other',
      name: t.categories.other,
      icon: Sparkles,
      description: 'Senior services, legal aid, document assistance & veteran support',
      color: 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300',
    },
  ];

  return (
    <div className="space-y-10 py-2 sm:py-6">
      {/* Hero Section */}
      <section className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-civic-100 text-civic-800 text-xs font-semibold tracking-wide border border-civic-200">
          <MapPin className="w-3.5 h-3.5 text-civic-700" />
          <span>{t.targetDistrict}</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
          {t.heroHeadline}
        </h1>

        <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed max-w-2xl mx-auto">
          {t.heroSubtitle}
        </p>

        {/* Input Bar & Voice Button */}
        <div className="pt-2">
          <form
            onSubmit={handleSearchSubmit}
            className="relative flex items-center bg-white rounded-2xl shadow-lg shadow-civic-900/5 border-2 border-slate-200 focus-within:border-civic-600 transition p-2 max-w-2xl mx-auto"
          >
            <Search className="w-5 h-5 text-slate-400 ml-2 mr-2 flex-shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.inputPlaceholder}
              className="w-full text-sm sm:text-base text-slate-900 placeholder:text-slate-400 bg-transparent focus:outline-none py-2 pr-2"
              aria-label="Describe what you need"
            />

            {/* Mic Button */}
            <button
              type="button"
              onClick={startVoice}
              className="flex-shrink-0 flex items-center gap-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 active:scale-95 transition px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold border border-rose-200 mr-1"
              title={t.voiceButton}
            >
              <Mic className="w-4 h-4 text-rose-600 animate-pulse" />
              <span className="hidden sm:inline">{t.voiceButton}</span>
            </button>

            {/* Submit Button */}
            <button
              type="submit"
              className="flex-shrink-0 bg-civic-700 hover:bg-civic-800 text-white font-semibold px-4 py-2 rounded-xl text-sm transition shadow-sm"
            >
              {t.searchButton}
            </button>
          </form>

          {/* Prompt Suggestions */}
          <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5 text-xs text-slate-600">
            <span className="font-semibold text-slate-700">Try saying:</span>
            <button
              type="button"
              onClick={() =>
                handleQuickDemo(
                  language === 'es'
                    ? 'Mi factura de electricidad está muy alta y no tengo suficiente dinero. También necesito comida para mis hijos.'
                    : language === 'tl'
                    ? 'Mataas ang singil sa kuryente at kailangan ko ng pagkain para sa mga bata.'
                    : 'My power might get shut off and I need help getting food for my kids.'
                )
              }
              className="px-2.5 py-1 bg-white hover:bg-slate-100 rounded-md border border-slate-200 text-slate-700 italic transition"
            >
              &ldquo;
              {language === 'es'
                ? 'Mi factura de luz está muy alta y necesito comida para mis hijos'
                : language === 'tl'
                ? 'Mataas ang singil sa kuryente at kailangan ko ng pagkain'
                : 'My power might get shut off and I need food for my kids'}
              &rdquo;
            </button>
            <button
              type="button"
              onClick={() =>
                handleQuickDemo(
                  language === 'es'
                    ? 'Necesito ayuda para pagar la renta este mes en North Las Vegas'
                    : 'I need emergency rent assistance in North Las Vegas'
                )
              }
              className="px-2.5 py-1 bg-white hover:bg-slate-100 rounded-md border border-slate-200 text-slate-700 italic transition hidden sm:inline"
            >
              &ldquo;
              {language === 'es'
                ? 'Ayuda para pagar la renta en North Las Vegas'
                : 'Emergency rent assistance in North Las Vegas'}
              &rdquo;
            </button>
          </div>
        </div>
      </section>

      {/* Primary Value Pillars */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto pt-2">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-start gap-3">
          <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">100% Verified Records</h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Strictly verified government & community programs. Zero AI hallucinations.
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-start gap-3">
          <div className="p-2 rounded-lg bg-blue-100 text-blue-800">
            <FileCheck2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Document Readiness</h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Photograph utility bills or income letters to verify requirements confidentially.
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-start gap-3">
          <div className="p-2 rounded-lg bg-amber-100 text-amber-800">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Personal Action Plan</h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Step-by-step guidance, directions, required paperwork, and real contact links.
            </p>
          </div>
        </div>
      </section>

      {/* Quick Category Shortcuts */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span>{t.quickCategories}</span>
          </h2>
          <button
            type="button"
            onClick={() => router.push('/resources')}
            className="text-xs font-semibold text-civic-700 hover:text-civic-800 flex items-center gap-1"
          >
            <span>View all resources</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {categoryCards.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.category}
                type="button"
                onClick={() => handleCategoryClick(cat.category)}
                className={`text-left p-4 rounded-xl border transition shadow-xs hover:shadow-md flex flex-col justify-between ${cat.color}`}
              >
                <div className="space-y-2">
                  <div className="w-9 h-9 rounded-lg bg-white/80 backdrop-blur-xs flex items-center justify-center shadow-xs">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 line-clamp-1">{cat.name}</h3>
                  <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                    {cat.description}
                  </p>
                </div>
                <div className="mt-3 flex items-center text-[11px] font-semibold text-slate-700">
                  <span>Explore</span>
                  <ArrowRight className="w-3 h-3 ml-1" />
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
