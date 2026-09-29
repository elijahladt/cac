'use client';

import React, { useState } from 'react';
import { AlertTriangle, Phone, X, ShieldAlert } from 'lucide-react';
import { EMERGENCY_SERVICES } from '@/lib/emergency';
import { SupportedLanguage } from '@/lib/types';
import { getTranslation } from '@/lib/i18n';

interface EmergencyBannerProps {
  currentLanguage?: SupportedLanguage;
}

export function EmergencyBanner({ currentLanguage = 'en' }: EmergencyBannerProps) {
  const [showModal, setShowModal] = useState(false);
  const t = getTranslation(currentLanguage);

  return (
    <>
      <aside
        aria-label="Emergency Assistance Alert"
        className="bg-amber-600 text-white px-4 py-2 text-xs sm:text-sm font-medium shadow-sm"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-100" aria-hidden="true" />
            <p className="line-clamp-1">
              <span className="font-bold uppercase tracking-wider text-[11px] mr-1 text-amber-200">
                {t.emergencyBanner.title}
              </span>
              {t.emergencyBanner.call911}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="flex-shrink-0 underline font-semibold hover:text-amber-100 focus:outline-none focus:ring-1 focus:ring-white rounded px-1.5 py-0.5"
          >
            {t.emergencyBanner.viewEmergency}
          </button>
        </div>
      </aside>

      {/* Emergency Modal */}
      {showModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="emergency-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
        >
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border border-rose-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between border-b pb-4">
              <div className="flex items-center gap-3 text-rose-700">
                <ShieldAlert className="w-7 h-7" aria-hidden="true" />
                <div>
                  <h2 id="emergency-title" className="text-xl font-bold">
                    Immediate Crisis & Emergency Help
                  </h2>
                  <p className="text-xs text-slate-500">
                    Official Nevada & National verified hotlines
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg focus:ring-2 focus:ring-slate-400"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {EMERGENCY_SERVICES.map((srv) => (
                <div
                  key={srv.number}
                  className={`p-3.5 rounded-lg border ${
                    srv.emergency
                      ? 'border-rose-200 bg-rose-50/70'
                      : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900 text-sm">
                      {srv.service}
                    </span>
                    <a
                      href={`tel:${srv.number.replace(/[^0-9]/g, '')}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-600 text-white font-bold text-sm rounded-md shadow hover:bg-rose-700 focus:ring-2 focus:ring-offset-1 focus:ring-rose-600"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      {srv.number}
                    </a>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">{srv.description}</p>
                  <span className="inline-block mt-1 text-[11px] font-medium text-slate-500">
                    Availability: {srv.available}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-3 border-t text-center text-xs text-slate-500">
              For non-emergency community resources, return to Nevada Nexus.
            </div>
          </div>
        </div>
      )}
    </>
  );
}
