'use client';

import React, { useState, useMemo } from 'react';
import {
  MapPin,
  Navigation,
  ExternalLink,
  Phone,
  Clock,
  CheckCircle2,
  Filter,
  Layers,
} from 'lucide-react';
import { Resource, ResourceCategory } from '@/lib/types';
import { VERIFIED_RESOURCES } from '@/lib/data/verifiedResources';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { formatRelativeTime } from '@/lib/utils';
import { estimateTravelTimes } from '@/tools/resources';

export function ResourceMap() {
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<ResourceCategory | 'all'>('all');
  const [activeResourceId, setActiveResourceId] = useState<string>(VERIFIED_RESOURCES[0].id);

  const filteredResources = useMemo(() => {
    return VERIFIED_RESOURCES.filter((res) => {
      if (selectedCategory !== 'all' && res.category !== selectedCategory) {
        return false;
      }
      return Boolean(res.latitude && res.longitude);
    });
  }, [selectedCategory]);

  const activeResource = useMemo(() => {
    return (
      filteredResources.find((r) => r.id === activeResourceId) ||
      filteredResources[0] ||
      VERIFIED_RESOURCES[0]
    );
  }, [filteredResources, activeResourceId]);

  // Map bounding box for North Las Vegas
  // Lat: ~36.14 to 36.26, Lng: -115.24 to -115.08
  const mapBounds = {
    minLat: 36.13,
    maxLat: 36.27,
    minLng: -115.26,
    maxLng: -115.06,
  };

  const projectToMapPercent = (lat: number, lng: number) => {
    const y = ((mapBounds.maxLat - lat) / (mapBounds.maxLat - mapBounds.minLat)) * 100;
    const x = ((lng - mapBounds.minLng) / (mapBounds.maxLng - mapBounds.minLng)) * 100;
    return {
      top: `${Math.max(8, Math.min(92, y))}%`,
      left: `${Math.max(8, Math.min(92, x))}%`,
    };
  };

  const travelTimes = estimateTravelTimes(activeResource.distanceMiles || 2.4);

  return (
    <div className="space-y-4 py-2">
      {/* Header & Category Filter */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Community Resource Map
            </h1>
            <span className="text-xs font-bold text-civic-700 bg-civic-100 px-2 py-0.5 rounded-full">
              NV-04 • North Las Vegas
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Geographic view of verified public services, food pantries, and utility assistance sites.
          </p>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <Filter className="w-4 h-4 text-slate-400 mr-1 flex-shrink-0" />
          {(
            [
              'all',
              'utility_assistance',
              'food_assistance',
              'housing',
              'healthcare',
              'jobs',
            ] as const
          ).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition border ${
                selectedCategory === cat
                  ? 'bg-civic-700 text-white border-civic-700 shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {cat === 'all' ? 'All' : t.categories[cat]}
            </button>
          ))}
        </div>
      </div>

      {/* Main Map & Selected Resource Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Visual Map Card */}
        <div className="lg:col-span-2 bg-slate-900 rounded-2xl overflow-hidden border border-slate-300 shadow-md relative min-h-[460px] flex flex-col">
          {/* Top Map Bar */}
          <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
            <div className="bg-slate-900/90 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-lg border border-slate-700 shadow flex items-center gap-2 pointer-events-auto">
              <Layers className="w-3.5 h-3.5 text-civic-400" />
              <span>North Las Vegas Metro Area</span>
            </div>

            <div className="bg-slate-900/90 backdrop-blur-md text-slate-300 text-[11px] px-2.5 py-1.5 rounded-lg border border-slate-700 shadow pointer-events-auto">
              Showing {filteredResources.length} locations
            </div>
          </div>

          {/* SVG Map Canvas with Roads and Landmarks */}
          <div className="relative w-full h-full flex-1 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 overflow-hidden">
            <svg
              className="absolute inset-0 w-full h-full opacity-20 pointer-events-none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Simulated street grid for North Las Vegas / Craig Rd / Las Vegas Blvd */}
              <line x1="0" y1="25%" x2="100%" y2="25%" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 2" />
              <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#cbd5e1" strokeWidth="3" />
              <line x1="0" y1="75%" x2="100%" y2="75%" stroke="#94a3b8" strokeWidth="2" />
              <line x1="25%" y1="0" x2="25%" y2="100%" stroke="#94a3b8" strokeWidth="2" />
              <line x1="50%" y1="0" x2="50%" y2="100%" stroke="#cbd5e1" strokeWidth="3" />
              <line x1="75%" y1="0" x2="75%" y2="100%" stroke="#94a3b8" strokeWidth="2" />
              <circle cx="50%" cy="50%" r="180" fill="none" stroke="#3b82f6" strokeWidth="1" strokeOpacity="0.3" />
            </svg>

            {/* Geographical Markers */}
            {filteredResources.map((res) => {
              const pos = projectToMapPercent(res.latitude || 36.1989, res.longitude || -115.1175);
              const isSelected = res.id === activeResource?.id;

              return (
                <button
                  key={res.id}
                  type="button"
                  onClick={() => setActiveResourceId(res.id)}
                  style={{ top: pos.top, left: pos.left }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 group focus:outline-none transition z-20 ${
                    isSelected ? 'scale-125 z-30' : 'hover:scale-115'
                  }`}
                  title={res.name}
                >
                  <div
                    className={`p-2 rounded-full shadow-lg border-2 flex items-center justify-center transition ${
                      isSelected
                        ? 'bg-rose-500 text-white border-white ring-4 ring-rose-500/40 animate-bounce'
                        : 'bg-civic-700 text-white border-white/80 hover:bg-civic-600'
                    }`}
                  >
                    <MapPin className="w-4 h-4" />
                  </div>

                  {/* Marker Tooltip */}
                  <span
                    className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 whitespace-nowrap text-[10px] font-bold px-2 py-0.5 rounded shadow pointer-events-none transition ${
                      isSelected
                        ? 'bg-white text-slate-900 ring-1 ring-slate-300'
                        : 'bg-slate-900/90 text-white opacity-0 group-hover:opacity-100'
                    }`}
                  >
                    {res.name.split('—')[0]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Bottom Map Legend */}
          <div className="p-3 bg-slate-950 border-t border-slate-800 text-slate-400 text-xs flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Selected Site
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-civic-700"></span> Verified Site
              </span>
            </div>
            <span className="text-[11px] text-slate-500">
              Interactive Leaflet / Google Maps fallback layer
            </span>
          </div>
        </div>

        {/* Selected Resource Card Panel */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4">
          {activeResource ? (
            <div className="space-y-4">
              <div>
                <span className="inline-block text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-civic-100 text-civic-800">
                  {t.categories[activeResource.category] || activeResource.category}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1 leading-snug">
                  {activeResource.name}
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {activeResource.description}
                </p>
              </div>

              {/* Verified Badge */}
              <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 font-semibold w-fit">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verified {formatRelativeTime(activeResource.last_verified_at)}</span>
              </div>

              {/* Travel Time Box (PRD Section 26) */}
              <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-slate-800 space-y-1.5">
                <div className="font-bold text-civic-900 flex items-center justify-between">
                  <span>Travel Distance & Route</span>
                  <span className="text-civic-700">~{activeResource.distanceMiles || 2.4} miles</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-600">
                  <div>
                    <span className="font-semibold text-slate-800 block">🚗 Driving:</span>
                    <span>{travelTimes.driving}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-800 block">🚶 Walking:</span>
                    <span>{travelTimes.walking}</span>
                  </div>
                </div>
              </div>

              {/* Location details */}
              <div className="space-y-2 text-xs text-slate-700 border-t border-slate-100 pt-3">
                {activeResource.address && (
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-slate-900">{activeResource.address}</p>
                      <p className="text-slate-500">
                        {activeResource.city}, NV {activeResource.zip}
                      </p>
                    </div>
                  </div>
                )}

                {activeResource.hours && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span>{activeResource.hours}</span>
                  </div>
                )}

                {activeResource.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <a
                      href={`tel:${activeResource.phone}`}
                      className="font-semibold text-civic-700 hover:underline"
                    >
                      {activeResource.phone}
                    </a>
                  </div>
                )}
              </div>

              {/* Google Maps Directions Action Button */}
              <div className="pt-2 space-y-2">
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                    `${activeResource.name}, ${activeResource.address || ''}, North Las Vegas, NV`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold bg-civic-700 hover:bg-civic-800 text-white rounded-xl shadow-xs transition"
                >
                  <Navigation className="w-4 h-4" />
                  <span>Get Live Turn-by-Turn Directions</span>
                </a>

                {activeResource.website && (
                  <a
                    href={activeResource.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-1 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                  >
                    <span>Visit Official Website</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500 text-center py-10">Select a location on the map.</p>
          )}
        </div>
      </div>
    </div>
  );
}
