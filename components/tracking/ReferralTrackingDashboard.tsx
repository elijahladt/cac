'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  Building2,
  Phone,
  Mail,
  User,
  ShieldCheck,
  ArrowRight,
  Upload,
  Calendar,
  DollarSign,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { ElectronicIntakeSubmission, ProviderReferralQueueItem } from '@/lib/intake/directIntake';

export default function ReferralTrackingDashboard() {
  const searchParams = useSearchParams();
  const initialCode = searchParams.get('code') || 'NVN-2026-89421';

  const [searchCode, setSearchCode] = useState(initialCode);
  const [loading, setLoading] = useState(false);
  const [intake, setIntake] = useState<ElectronicIntakeSubmission | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchTracking = async (code: string) => {
    if (!code.trim()) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/tracking/${encodeURIComponent(code.trim().toUpperCase())}`);
      const data = await res.json();
      if (res.ok && data.intake) {
        setIntake(data.intake);
      } else {
        setIntake(null);
        setErrorMsg(data.message || `No intake record found matching "${code}".`);
      }
    } catch (err: any) {
      setErrorMsg('Network error checking referral tracking code.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialCode) {
      fetchTracking(initialCode);
    }
  }, [initialCode]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTracking(searchCode);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
        return (
          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>ACCEPTED / BENEFIT PLEDGED</span>
          </span>
        );
      case 'IN_REVIEW':
        return (
          <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 border border-blue-300 text-xs font-bold flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-blue-600 animate-spin" />
            <span>IN CASEWORKER REVIEW</span>
          </span>
        );
      case 'ACTION_REQUIRED':
        return (
          <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300 text-xs font-bold flex items-center gap-1.5 animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>ACTION REQUIRED: DOCUMENT NEEDED</span>
          </span>
        );
      case 'WAITLISTED':
        return (
          <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-800 border border-purple-300 text-xs font-bold flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-purple-600" />
            <span>WAITLISTED (ACTIVE QUEUE)</span>
          </span>
        );
      case 'DENIED':
        return (
          <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-300 text-xs font-bold flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>NOT APPROVED</span>
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-800 border border-slate-300 text-xs font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-slate-600" />
            <span>SUBMITTED TO QUEUE</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-civic-900 via-civic-800 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-civic-700/60 border border-civic-500/40 text-civic-200 text-xs font-bold tracking-wide">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Closed-Loop Referral Tracking System</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
            Track Your Assistance Referrals
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Never wonder if your application went into a black hole. Track caseworker reviews, requested documents, pledge authorizations, and waitlist status in real-time.
          </p>
        </div>
      </div>

      {/* Search Bar & Demo Quick Codes */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              placeholder="Enter confirmation code (e.g. NVN-2026-89421)..."
              className="w-full text-xs sm:text-sm pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-civic-600 focus:outline-none font-mono"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-civic-700 hover:bg-civic-800 text-white font-bold rounded-xl text-xs sm:text-sm transition shadow-sm flex items-center justify-center gap-2 flex-shrink-0"
          >
            {loading ? <span>Searching...</span> : <span>Track Referral</span>}
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span className="font-semibold text-slate-600">Sample Tracking Codes:</span>
          <button
            type="button"
            onClick={() => {
              setSearchCode('NVN-2026-89421');
              fetchTracking('NVN-2026-89421');
            }}
            className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono text-[11px] font-bold hover:bg-emerald-100"
          >
            NVN-2026-89421 (Accepted LIHEAP Pledge)
          </button>
          <button
            type="button"
            onClick={() => {
              setSearchCode('NVN-2026-44109');
              fetchTracking('NVN-2026-44109');
            }}
            className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 font-mono text-[11px] font-bold hover:bg-amber-100"
          >
            NVN-2026-44109 (Action Required: Eviction Notice)
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Active Tracking Details */}
      {intake && (
        <div className="space-y-6">
          {/* Top Summary Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tracking Record</div>
              <div className="text-2xl font-mono font-extrabold text-slate-900 mt-0.5">
                {intake.confirmationCode}
              </div>
              <div className="text-xs text-slate-600 mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
                <span>Applicant: <strong>{intake.applicant.fullName}</strong></span>
                <span>Phone: <strong>{intake.applicant.phone}</strong></span>
                <span>Address: <strong>{intake.applicant.address}, {intake.applicant.city}</strong></span>
              </div>
            </div>

            <div className="text-right sm:border-l sm:border-slate-100 sm:pl-6 space-y-1">
              <div className="text-[11px] text-slate-500">Submitted On:</div>
              <div className="text-xs font-bold text-slate-800">
                {new Date(intake.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </div>
              <div className="text-[10px] text-slate-400">
                {intake.referrals.length} Provider Queue(s)
              </div>
            </div>
          </div>

          {/* Referral Cards */}
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-civic-700" />
              <span>Dispatched Provider Referrals ({intake.referrals.length})</span>
            </h2>

            {intake.referrals.map((ref) => (
              <div
                key={ref.id}
                className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden"
              >
                {/* Referral Header */}
                <div className="p-6 bg-slate-50/70 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      {ref.category.replace('_', ' ')} Assistance
                    </div>
                    <h3 className="text-lg font-extrabold text-slate-900">{ref.providerName}</h3>
                    <div className="text-xs text-slate-600">{ref.programName}</div>
                  </div>

                  <div className="flex-shrink-0">{getStatusBadge(ref.status)}</div>
                </div>

                <div className="p-6 space-y-6">
                  {/* Benefit / Action Callout */}
                  {ref.benefitAmountPledged && (
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-1">
                      <div className="font-bold flex items-center gap-1.5 text-emerald-800 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Benefit Amount Authorized</span>
                      </div>
                      <p className="font-semibold text-emerald-950 text-sm">
                        {ref.benefitAmountPledged}
                      </p>
                    </div>
                  )}

                  {ref.status === 'ACTION_REQUIRED' && (
                    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-2">
                      <div className="font-bold flex items-center gap-1.5 text-amber-800 text-sm">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        <span>Caseworker Action Required</span>
                      </div>
                      <p className="text-slate-700">{ref.caseworkerNote}</p>
                      <button
                        type="button"
                        onClick={() => alert('Document upload modal opened. You can attach a photo or PDF file.')}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Requested Document</span>
                      </button>
                    </div>
                  )}

                  {/* Caseworker Assignment & Contact Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div className="space-y-1">
                      <div className="text-slate-500 font-semibold">Assigned Caseworker:</div>
                      <div className="font-bold text-slate-900">
                        {ref.caseworkerName || 'Triage Intake Team (Assigning)'}
                      </div>
                      {ref.caseworkerNote && ref.status !== 'ACTION_REQUIRED' && (
                        <p className="text-[11px] text-slate-600 italic">"{ref.caseworkerNote}"</p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="text-slate-500 font-semibold">Provider Contact:</div>
                      <div className="flex items-center gap-3">
                        <a
                          href={`tel:${ref.providerContactPhone}`}
                          className="font-bold text-civic-700 hover:underline flex items-center gap-1"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>{ref.providerContactPhone}</span>
                        </a>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Estimated turnaround: ~{ref.estimatedResolutionDays} business days
                      </div>
                    </div>
                  </div>

                  {/* Milestone History Timeline */}
                  <div className="space-y-3">
                    <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Closed-Loop Milestone History
                    </div>

                    <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                      {ref.timeline.map((m, idx) => (
                        <div key={m.id} className="relative group">
                          {/* Dot */}
                          <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-civic-600 border-2 border-white shadow-xs flex items-center justify-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-white" />
                          </div>

                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 text-xs">{m.title}</span>
                              <span className="text-[10px] text-slate-400">
                                {new Date(m.timestamp).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })} • {new Date(m.timestamp).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed">{m.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
