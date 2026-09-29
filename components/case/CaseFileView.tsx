'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ClipboardList,
  CheckCircle2,
  Circle,
  FileText,
  AlertCircle,
  ExternalLink,
  Printer,
  Sparkles,
  MapPin,
  Share2,
  ShieldAlert,
  ArrowRight,
  UploadCloud,
} from 'lucide-react';
import { CaseFile, ActionPlanItem } from '@/lib/types';
import { loadCaseFile, saveCaseFile } from '@/tools/actionPlans';
import { useLanguage } from '@/components/providers/LanguageProvider';

interface CaseFileViewProps {
  onNavigateToDocumentUpload?: () => void;
}

export function CaseFileView({ onNavigateToDocumentUpload }: CaseFileViewProps) {
  const { language, t } = useLanguage();
  const [caseFile, setCaseFile] = useState<CaseFile | null>(null);

  useEffect(() => {
    const loaded = loadCaseFile();
    setCaseFile(loaded);
  }, []);

  const toggleItemStatus = (itemId: string) => {
    if (!caseFile || !caseFile.action_plan) return;

    const updatedItems = caseFile.action_plan.items.map((item) => {
      if (item.id === itemId) {
        const nextStatus: ActionPlanItem['status'] =
          item.status === 'completed' ? 'pending' : 'completed';
        return { ...item, status: nextStatus };
      }
      return item;
    });

    const updatedCase: CaseFile = {
      ...caseFile,
      action_plan: {
        ...caseFile.action_plan,
        items: updatedItems,
        updated_at: new Date().toISOString(),
      },
    };

    setCaseFile(updatedCase);
    saveCaseFile(updatedCase);
  };

  const handlePrint = () => {
    window.print();
  };

  if (!caseFile) {
    return (
      <div className="py-20 text-center text-slate-500">
        <ClipboardList className="w-8 h-8 animate-pulse text-civic-700 mx-auto mb-2" />
        <p className="text-sm font-semibold">Loading your active assistance case...</p>
      </div>
    );
  }

  const completedCount =
    caseFile.action_plan?.items.filter((i) => i.status === 'completed').length || 0;
  const totalCount = caseFile.action_plan?.items.length || 0;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-2">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-civic-100 text-civic-800">
              Case #{caseFile.id.slice(-7).toUpperCase()}
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              Status: {caseFile.status}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
            My Assistance Case
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Personalized community assistance navigation for North Las Vegas & NV-04.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 print:hidden">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print Plan</span>
          </button>
          <Link
            href="/chat"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-civic-700 text-white hover:bg-civic-800 rounded-xl shadow-xs transition"
          >
            <span>Ask Navigator</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Grid: Needs & Missing Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Identified Needs */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-civic-700" />
            <span>Identified Needs</span>
          </h2>
          <div className="space-y-2">
            {caseFile.needs.map((need, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-3 text-xs"
              >
                <div>
                  <span className="font-bold text-slate-900 block capitalize">
                    {t.categories[need.category] || need.category.replace('_', ' ')}
                  </span>
                  <p className="text-slate-600 mt-0.5">{need.description}</p>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    need.urgency === 'high'
                      ? 'bg-rose-100 text-rose-800'
                      : need.urgency === 'emergency'
                      ? 'bg-red-600 text-white animate-pulse'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {need.urgency}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Document Readiness & Missing Info */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-700" />
              <span>Documents & Information</span>
            </h2>
            <Link
              href="/case#documents"
              className="text-xs font-semibold text-civic-700 hover:underline inline-flex items-center gap-1"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Upload Bill</span>
            </Link>
          </div>

          <div className="space-y-2">
            {/* Extracted Documents */}
            {caseFile.documents.length > 0 ? (
              caseFile.documents.map((doc) => (
                <div
                  key={doc.id}
                  className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-start justify-between gap-2 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-1.5 text-emerald-900 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{doc.provider_name || 'Utility Bill'} Statement</span>
                    </div>
                    <p className="text-slate-600 mt-0.5">
                      Amount Due: <span className="font-semibold text-slate-900">{doc.amount_due}</span> • Due Date: {doc.due_date}
                    </p>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                    Verified
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 italic p-3 bg-slate-50 rounded-lg">
                No documents uploaded yet. Photograph your utility bill or income statement to speed up your assistance application.
              </p>
            )}

            {/* Missing Information Alerts (PRD Section 32) */}
            {caseFile.missing_information.map((info, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-xs flex items-start gap-2 text-amber-900"
              >
                <AlertCircle className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Missing Information:</span> {info}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Plan Section (PRD Section 28) */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-civic-700" />
              <span>{caseFile.action_plan?.title || 'My Bridge Plan'}</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Check off steps as you complete them to keep your application organized.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-600">
              {completedCount} of {totalCount} completed ({progressPercent}%)
            </span>
            <div className="w-24 bg-slate-200 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-600 h-full transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Action Items List */}
        <div className="space-y-4 pt-1">
          {caseFile.action_plan?.items.map((item, index) => {
            const isDone = item.status === 'completed';
            const resource = item.resource;

            return (
              <div
                key={item.id}
                className={`p-4 rounded-xl border transition ${
                  isDone
                    ? 'bg-slate-50 border-slate-200 opacity-75'
                    : 'bg-white border-slate-200 shadow-xs hover:border-civic-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    onClick={() => toggleItemStatus(item.id)}
                    className="mt-0.5 flex-shrink-0 text-slate-400 hover:text-emerald-600 transition"
                    title={isDone ? 'Mark as pending' : 'Mark as complete'}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </button>

                  <div className="flex-1 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                      <h3
                        className={`text-sm sm:text-base font-bold ${
                          isDone ? 'line-through text-slate-500' : 'text-slate-900'
                        }`}
                      >
                        Step {index + 1}: {item.title}
                      </h3>
                      <span className="text-[11px] font-semibold text-civic-700 bg-civic-50 px-2 py-0.5 rounded-md w-fit">
                        {item.category.replace('_', ' ')}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {item.instructions}
                    </p>

                    {item.documents_needed.length > 0 && (
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1">
                        <span className="font-bold text-slate-700">Documents to have ready:</span>
                        <ul className="list-disc list-inside text-slate-600 space-y-0.5">
                          {item.documents_needed.map((doc, docIdx) => (
                            <li key={docIdx}>{doc}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Quick Resource Buttons */}
                    {resource && (
                      <div className="pt-2 flex flex-wrap items-center gap-2">
                        {resource.website && (
                          <a
                            href={resource.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-civic-700 hover:bg-civic-800 rounded-lg transition"
                          >
                            <span>Open Application</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}

                        {resource.address && (
                          <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                              `${resource.name}, ${resource.address}, North Las Vegas, NV`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition border border-blue-200"
                          >
                            <MapPin className="w-3 h-3" />
                            <span>Get Directions</span>
                          </a>
                        )}

                        {resource.phone && (
                          <a
                            href={`tel:${resource.phone.replace(/[^0-9]/g, '')}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                          >
                            <span>Call {resource.phone}</span>
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
