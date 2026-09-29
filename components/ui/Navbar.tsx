'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, MessageSquare, BookOpen, ClipboardList, MapPin, Shield, Info } from 'lucide-react';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { LanguageSelector } from '@/components/ui/LanguageSelector';

export function Navbar() {
  const pathname = usePathname();
  const { language, setLanguage, t } = useLanguage();

  const navLinks = [
    { href: '/', label: t.nav.home, icon: Compass },
    { href: '/chat', label: t.nav.navigator, icon: MessageSquare },
    { href: '/resources', label: t.nav.resources, icon: BookOpen },
    { href: '/case', label: t.nav.myCase, icon: ClipboardList },
    { href: '/map', label: t.nav.map, icon: MapPin },
    { href: '/about', label: t.nav.about, icon: Info },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-civic-700 text-white flex items-center justify-center shadow-md shadow-civic-700/20 group-hover:bg-civic-800 transition">
            <Compass className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-tight text-slate-900">
                Nevada<span className="text-civic-700">Nexus</span>
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                NV-04
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
              North Las Vegas Community Navigator
            </p>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-1" aria-label="Main Navigation">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? 'bg-civic-50 text-civic-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-civic-700' : 'text-slate-400'}`} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Side: Language & Admin link */}
        <div className="flex items-center gap-2.5">
          <LanguageSelector currentLanguage={language} onLanguageChange={setLanguage} />
          <Link
            href="/admin"
            className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 transition"
            title="Admin & Verification Portal"
          >
            <Shield className="w-3.5 h-3.5 text-slate-500" />
            <span>Admin</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
