'use client';

import React, { useEffect, useState } from 'react';
import {
  X,
  ExternalLink,
  Phone,
  MapPin,
  Clock,
  Languages,
  CheckCircle2,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { Resource, Program } from '@/lib/types';
import { getProgramsForResource } from '@/tools/programs';
import { formatRelativeTime } from '@/lib/utils';
import { useLanguage } from '@/components/providers/LanguageProvider';

interface ResourceDetailModalProps {
  resource: Resource | null;
  onClose: () => void;
  onAddToActionPlan?: (resource: Resource) => void;
}

export function ResourceDetailModal({
  resource,
  onClose,
  onAddToActionPlan,
}: ResourceDetailModalProps) {
  const { t } = useLanguage();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!resource) return;
    setLoading(true);
    getProgramsForResource(resource.id)
      .then((data) => setPrograms(data))
      .finally(() => setLoading(false));
  }, [resource]);

  if (!resource) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-resource-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs"
    >
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 flex flex-col">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 flex items-start justify-between gap-4 sticky top-0 bg-white/95 backdrop-blur-xs z-10">
          <div>
            <span className="inline-block text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-civic-100 text-civic-800">
              {t.categories[resource.category] || resource.category}
            </span>
            <h2 id="modal-resource-title" className="text-xl font-bold text-slate-900 mt-1">
              {resource.name}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Verified {formatRelativeTime(resource.last_verified_at)} via Authoritative Source</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-6 flex-1">
          {/* General Overview */}
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Overview
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed">{resource.description}</p>
          </div>

          {/* Location & Contact Information */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2.5 text-xs text-slate-700">
            {resource.address && (
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-slate-900">{resource.address}</p>
                  <p className="text-slate-500">
                    {resource.city}, {resource.state} {resource.zip || ''}
                  </p>
                </div>
              </div>
            )}

            {resource.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <a href={`tel:${resource.phone}`} className="font-semibold text-civic-700 hover:underline">
                  {resource.phone}
                </a>
              </div>
            )}

            {resource.hours && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span>{resource.hours}</span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Languages className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span>Available Languages: {resource.languages.map((l) => (l === 'es' ? 'Spanish' : l === 'tl' ? 'Tagalog' : 'English')).join(', ')}</span>
            </div>
          </div>

          {/* Verified Programs Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-civic-700" />
              <span>Specific Assistance Programs</span>
            </h3>

            {loading ? (
              <div className="p-4 text-center text-xs text-slate-500 animate-pulse">
                Loading verified program requirements...
              </div>
            ) : programs.length > 0 ? (
              programs.map((prog) => (
                <div key={prog.id} className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{prog.name}</h4>
                    <p className="text-xs text-slate-600 mt-1">{prog.description}</p>
                  </div>

                  {/* Document Checklist */}
                  {prog.required_documents.length > 0 && (
                    <div className="pt-2 border-t border-slate-100">
                      <span className="text-xs font-bold text-slate-700 block mb-1">
                        Required Documents for Application:
                      </span>
                      <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                        {prog.required_documents.map((doc, idx) => (
                          <li key={idx}>{doc}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Informational Disclaimer (PRD Section 12 & 36) */}
                  <div className="flex items-start gap-1.5 p-2.5 rounded-lg bg-amber-50 text-[11px] text-amber-900 border border-amber-200">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-amber-700" />
                    <span>
                      Eligibility is determined officially by {resource.name}. Nevada Nexus helps you prepare your documents and application steps.
                    </span>
                  </div>

                  {prog.application_url && (
                    <a
                      href={prog.application_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-civic-700 hover:text-civic-800 underline pt-1"
                    >
                      <span>Open Official Application Portal</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 italic">
                Direct intake at main facility. Contact {resource.phone || 'staff'} for intake paperwork.
              </p>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
          <a
            href={resource.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-slate-500 hover:underline flex items-center gap-1"
          >
            <span>Authoritative Source URL</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          <div className="flex items-center gap-2">
            {onAddToActionPlan && (
              <button
                type="button"
                onClick={() => {
                  onAddToActionPlan(resource);
                  onClose();
                }}
                className="px-3.5 py-2 text-xs font-bold bg-civic-700 text-white rounded-lg hover:bg-civic-800 transition shadow-xs"
              >
                Add to My Action Plan
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
