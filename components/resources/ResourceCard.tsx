'use client';

import React, { useState } from 'react';
import {
  MapPin,
  Clock,
  Languages,
  CheckCircle2,
  ExternalLink,
  Phone,
  Navigation,
  Info,
  Bookmark,
  BookmarkCheck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Resource } from '@/lib/types';
import { formatRelativeTime } from '@/lib/utils';
import { useLanguage } from '@/components/providers/LanguageProvider';

interface ResourceCardProps {
  resource: Resource;
  onSelect?: (resource: Resource) => void;
  onSaveToPlan?: (resource: Resource) => void;
  isSaved?: boolean;
}

export function ResourceCard({
  resource,
  onSelect,
  onSaveToPlan,
  isSaved = false,
}: ResourceCardProps) {
  const { t } = useLanguage();
  const [showWhy, setShowWhy] = useState(false);
  const [localSaved, setLocalSaved] = useState(isSaved);

  const handleSaveToggle = () => {
    setLocalSaved(!localSaved);
    if (onSaveToPlan) {
      onSaveToPlan(resource);
    }
  };

  const mapUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    `${resource.name}, ${resource.address || ''}, ${resource.city}, NV ${resource.zip || ''}`
  )}`;

  const categoryName = t.categories[resource.category] || resource.category;

  return (
    <article className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition duration-200 p-5 flex flex-col justify-between space-y-4">
      {/* Header: Name, Category, Verification Badge */}
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="inline-block text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-civic-100 text-civic-800">
              {categoryName}
            </span>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-1 leading-snug">
              {resource.name}
            </h3>
          </div>

          {/* Verification Badge (PRD Section 22 & 27) */}
          <div className="flex-shrink-0 flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>
              {t.verifiedBadge} {formatRelativeTime(resource.last_verified_at)}
            </span>
          </div>
        </div>

        {/* Short Description */}
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          {resource.description}
        </p>
      </div>

      {/* Geospatial & Service Attributes (PRD Section 26 & 27) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 py-1 border-y border-slate-100">
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <span className="font-semibold text-slate-800">
            {resource.distanceMiles !== undefined ? `${resource.distanceMiles} miles away` : 'North Las Vegas, NV'}
          </span>
          {resource.travelTimeDriving && (
            <span className="text-slate-400">
              (Drive: {resource.travelTimeDriving})
            </span>
          )}
        </div>

        {resource.hours && (
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span className="truncate">{resource.hours}</span>
          </div>
        )}

        <div className="flex items-center gap-1.5">
          <Languages className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <span>
            {resource.languages.map((l) => (l === 'es' ? 'Spanish' : l === 'tl' ? 'Tagalog' : 'English')).join(' • ')}
          </span>
        </div>

        {resource.phone && (
          <div className="flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <a
              href={`tel:${resource.phone.replace(/[^0-9]/g, '')}`}
              className="text-civic-700 font-semibold hover:underline"
            >
              {resource.phone}
            </a>
          </div>
        )}
      </div>

      {/* "Why this resource?" Box (PRD Section 33) */}
      {resource.whyThisResource && (
        <div className="rounded-lg bg-amber-50/70 border border-amber-200/80 p-2.5 text-xs text-slate-700">
          <button
            type="button"
            onClick={() => setShowWhy(!showWhy)}
            className="w-full flex items-center justify-between font-bold text-amber-900 focus:outline-none"
          >
            <div className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-amber-700" />
              <span>{t.whyThisResourceTitle}</span>
            </div>
            {showWhy ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          {showWhy && (
            <p className="mt-1.5 text-slate-600 leading-relaxed animate-in fade-in">
              {resource.whyThisResource}
            </p>
          )}
        </div>
      )}

      {/* Authoritative Source Transparency (PRD Section 34) */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
        <a
          href={resource.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-800 hover:underline"
        >
          <span>{t.sourceLabel}</span>
          <ExternalLink className="w-3 h-3 text-slate-400" />
        </a>
        <span className="text-[10px] text-slate-400">Clark County / NV-04</span>
      </div>

      {/* Action Buttons: [Details] [Directions] [Apply/Contact] [Save] (PRD Section 27) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
        {/* Details button */}
        <button
          type="button"
          onClick={() => onSelect && onSelect(resource)}
          className="w-full inline-flex items-center justify-center gap-1 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
        >
          <span>{t.detailsBtn}</span>
        </button>

        {/* Directions button */}
        <a
          href={mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full inline-flex items-center justify-center gap-1 px-3 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition border border-blue-200"
        >
          <Navigation className="w-3 h-3" />
          <span>{t.directionsBtn}</span>
        </a>

        {/* Apply/Contact button */}
        <a
          href={resource.website || (resource.phone ? `tel:${resource.phone}` : '#')}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full inline-flex items-center justify-center gap-1 px-3 py-2 text-xs font-semibold text-white bg-civic-700 hover:bg-civic-800 rounded-lg transition shadow-xs"
        >
          <span>{t.applyContactBtn}</span>
        </a>

        {/* Save to Plan button */}
        <button
          type="button"
          onClick={handleSaveToggle}
          className={`w-full inline-flex items-center justify-center gap-1 px-3 py-2 text-xs font-semibold rounded-lg transition border ${
            localSaved
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
              : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
          }`}
        >
          {localSaved ? (
            <>
              <BookmarkCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Saved</span>
            </>
          ) : (
            <>
              <Bookmark className="w-3.5 h-3.5 text-slate-500" />
              <span>{t.savePlanBtn}</span>
            </>
          )}
        </button>
      </div>
    </article>
  );
}
