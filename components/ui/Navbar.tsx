'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Compass, MessageSquare, BookOpen, ClipboardList, MapPin, Shield, Info, User, LogIn, Sparkles } from 'lucide-react';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { useAuth } from '@/components/providers/AuthProvider';
import { LanguageSelector } from '@/components/ui/LanguageSelector';

export function Navbar() {
  const pathname = usePathname();
  const { language, setLanguage, t } = useLanguage();
  const { user, isAuthenticated } = useAuth();

  const navLinks = [
    { href: '/', label: t.nav.home, icon: Compass },
    { href: '/chat', label: t.nav.navigator, icon: MessageSquare },
    { href: '/eligibility', label: t.nav.eligibility, icon: BookOpen },
    { href: '/intake', label: t.nav.intake, icon: ClipboardList },
    { href: '/tracking', label: t.nav.tracking, icon: Shield },
    { href: '/resources', label: t.nav.resources, icon: BookOpen },
    { href: '/map', label: t.nav.map, icon: MapPin },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative w-10 h-10 rounded-xl bg-civic-50 border border-civic-200/80 flex items-center justify-center p-1.5 shadow-sm group-hover:scale-105 group-hover:shadow-md transition">
            <Image
              src="/logo-mark.png"
              alt="Nevada Nexus Logo"
              width={34}
              height={34}
              priority
              className="object-contain"
            />
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

        {/* Right Side: Language & Auth & Admin link */}
        <div className="flex items-center gap-2">
          <LanguageSelector currentLanguage={language} onLanguageChange={setLanguage} />

          {isAuthenticated && user ? (
            <Link
              href="/profile"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold bg-civic-50 hover:bg-civic-100 text-civic-800 rounded-lg border border-civic-200 transition"
              title="Personalized Profile & Answers"
            >
              <div className="w-5 h-5 rounded-full bg-civic-700 text-white flex items-center justify-center text-[10px] font-bold">
                {user.profile.fullName.charAt(0)}
              </div>
              <span className="hidden sm:inline font-bold">
                {user.profile.fullName.split(' ')[0]}
              </span>
            </Link>
          ) : (
            <div className="flex items-center gap-1.5">
              <Link
                href="/login"
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{t.nav.signIn}</span>
              </Link>
              <Link
                href="/signup"
                className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-civic-700 hover:bg-civic-800 rounded-lg shadow-2xs transition"
              >
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>{t.nav.signUp}</span>
              </Link>
            </div>
          )}

          <Link
            href="/admin"
            className="hidden lg:inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 transition"
            title="Admin & Verification Portal"
          >
            <Shield className="w-3.5 h-3.5 text-slate-500" />
            <span>{t.nav.admin}</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
