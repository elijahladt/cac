'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, MessageSquare, BookOpen, ClipboardList, MapPin } from 'lucide-react';
import { useLanguage } from '@/components/providers/LanguageProvider';

export function BottomNav() {
  const pathname = usePathname();
  const { t } = useLanguage();

  const links = [
    { href: '/', label: t.nav.home, icon: Compass },
    { href: '/chat', label: t.nav.navigator, icon: MessageSquare },
    { href: '/resources', label: t.nav.resources, icon: BookOpen },
    { href: '/case', label: t.nav.myCase, icon: ClipboardList },
    { href: '/map', label: t.nav.map, icon: MapPin },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 z-40 py-1.5 px-2 flex justify-around items-center shadow-lg"
    >
      {links.map((link) => {
        const Icon = link.icon;
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg text-[10px] font-medium transition ${
              isActive
                ? 'text-civic-700 font-bold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'text-civic-700 stroke-[2.4]' : 'text-slate-400'}`} />
            <span className="truncate max-w-[64px]">{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
