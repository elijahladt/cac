import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white text-slate-600 text-xs py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-civic-50 border border-civic-200/80 p-1 flex items-center justify-center">
            <Image
              src="/logo-mark.png"
              alt="Nevada Nexus"
              width={26}
              height={26}
              className="object-contain"
            />
          </div>
          <div>
            <span className="font-extrabold text-slate-900 tracking-tight">
              Nevada<span className="text-civic-700">Nexus</span>
            </span>
            <p className="text-[11px] text-slate-500">
              North Las Vegas & NV-04 Multimodal Community Assistance Navigator
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-slate-500">
          <Link href="/about" className="hover:text-civic-700 font-medium transition">
            About & Disclosures
          </Link>
          <span className="text-slate-300">•</span>
          <Link href="/eligibility" className="hover:text-civic-700 font-medium transition">
            Eligibility Engine
          </Link>
          <span className="text-slate-300">•</span>
          <Link href="/resources" className="hover:text-civic-700 font-medium transition">
            Resource Directory
          </Link>
          <span className="text-slate-300">•</span>
          <Link href="/intake" className="hover:text-civic-700 font-medium transition">
            Electronic Intake
          </Link>
        </div>
      </div>
    </footer>
  );
}
