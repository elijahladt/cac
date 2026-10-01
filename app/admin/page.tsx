'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  Clock,
  Archive,
  CheckCircle2,
  ExternalLink,
  Edit,
  Eye,
  RefreshCw,
  Search,
  Filter,
  Users,
  Send,
  Building2,
  Phone,
  DollarSign,
  Upload,
  AlertCircle,
  FileCheck,
} from 'lucide-react';
import Link from 'next/link';
import { Resource, VerificationStatus } from '@/lib/types';
import { getAdminResources, updateResourceStatus } from '@/tools/verification';
import { auditResources, AuditReportItem } from '@/agents/verification';
import { formatRelativeTime } from '@/lib/utils';
import { useLanguage } from '@/components/providers/LanguageProvider';
import {
  ElectronicIntakeSubmission,
  ReferralStatus,
  getAllIntakeSubmissions,
  updateReferralStatus,
} from '@/lib/intake/directIntake';

export default function AdminPage() {
  const { t } = useLanguage();
  const [activePortalTab, setActivePortalTab] = useState<'intakes' | 'resources'>('intakes');

  // Intake Queue State
  const [intakes, setIntakes] = useState<ElectronicIntakeSubmission[]>([]);
  const [selectedIntakeFilter, setSelectedIntakeFilter] = useState<'all' | 'pending' | 'action_required' | 'accepted'>('all');
  const [intakeSearchQuery, setIntakeSearchQuery] = useState('');

  // Resource Verification State
  const [resources, setResources] = useState<Resource[]>([]);
  const [selectedResourceTab, setSelectedResourceTab] = useState<'all' | 'needs_review' | 'stale' | 'archived'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [auditReport, setAuditReport] = useState<AuditReportItem[]>([]);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  const loadData = () => {
    const list = getAdminResources();
    setResources(list);
    const report = auditResources(list);
    setAuditReport(report);
    setIntakes(getAllIntakeSubmissions());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleResourceStatusChange = (resourceId: string, newStatus: VerificationStatus) => {
    const updated = updateResourceStatus(resourceId, newStatus, resources);
    setResources(updated);
    setAuditReport(auditResources(updated));

    const res = resources.find((r) => r.id === resourceId);
    setActionSuccessMessage(`Updated resource "${res?.name.slice(0, 30)}..." to ${newStatus}.`);
    setTimeout(() => setActionSuccessMessage(null), 3000);
  };

  const handleUpdateReferral = (
    confirmationCode: string,
    referralId: string,
    status: ReferralStatus,
    pledge?: string,
    note?: string
  ) => {
    updateReferralStatus(confirmationCode, referralId, {
      status,
      caseworkerName: 'Caseworker Portal (Active)',
      benefitAmountPledged: pledge,
      caseworkerNote: note || `Status transitioned to ${status} via Caseworker Dashboard.`,
    });
    setIntakes(getAllIntakeSubmissions());
    setActionSuccessMessage(`Updated referral for ${confirmationCode} to ${status}.`);
    setTimeout(() => setActionSuccessMessage(null), 3500);
  };

  const filteredResources = resources.filter((res) => {
    if (selectedResourceTab === 'needs_review' && res.verification_status !== 'NEEDS_REVIEW') return false;
    if (selectedResourceTab === 'stale' && res.verification_status !== 'STALE') return false;
    if (selectedResourceTab === 'archived' && res.verification_status !== 'ARCHIVED') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        res.name.toLowerCase().includes(q) ||
        res.category.toLowerCase().includes(q) ||
        res.city.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const filteredIntakes = intakes.filter((sub) => {
    if (selectedIntakeFilter === 'pending') {
      return sub.referrals.some((r) => r.status === 'SUBMITTED' || r.status === 'IN_REVIEW');
    }
    if (selectedIntakeFilter === 'action_required') {
      return sub.referrals.some((r) => r.status === 'ACTION_REQUIRED');
    }
    if (selectedIntakeFilter === 'accepted') {
      return sub.referrals.some((r) => r.status === 'ACCEPTED');
    }
    if (intakeSearchQuery.trim()) {
      const q = intakeSearchQuery.toLowerCase();
      return (
        sub.confirmationCode.toLowerCase().includes(q) ||
        sub.applicant.fullName.toLowerCase().includes(q) ||
        sub.applicant.phone.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const staleCount = auditReport.filter((r) => r.isStale).length;
  const reviewCount = resources.filter((r) => r.verification_status === 'NEEDS_REVIEW').length;
  const pendingIntakesCount = intakes.filter((s) => s.referrals.some((r) => r.status === 'SUBMITTED' || r.status === 'IN_REVIEW')).length;

  return (
    <div className="space-y-6 py-2 max-w-6xl mx-auto px-4 sm:px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Nevada Nexus Caseworker & Admin Portal
            </h1>
            <span className="text-xs font-bold text-civic-700 bg-civic-100 px-2 py-0.5 rounded-full">
              Caseworker Queue Active
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Triage direct electronic intakes, manage closed-loop referral milestones, and audit verified directory sources.
          </p>
        </div>

        {/* Portal Mode Switcher */}
        <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActivePortalTab('intakes')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activePortalTab === 'intakes'
                ? 'bg-white text-civic-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Send className="w-3.5 h-3.5 text-civic-700" />
            <span>Direct Intake Queue ({intakes.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActivePortalTab('resources')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activePortalTab === 'resources'
                ? 'bg-white text-civic-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            <span>Resource Audits ({resources.length})</span>
          </button>
        </div>
      </div>

      {actionSuccessMessage && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{actionSuccessMessage}</span>
        </div>
      )}

      {/* =========================================================
          TAB 1: DIRECT ELECTRONIC INTAKE & CLOSED-LOOP QUEUE
         ========================================================= */}
      {activePortalTab === 'intakes' && (
        <div className="space-y-4">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => setSelectedIntakeFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition border ${
                  selectedIntakeFilter === 'all'
                    ? 'bg-civic-700 text-white border-civic-700'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                All Submissions ({intakes.length})
              </button>

              <button
                type="button"
                onClick={() => setSelectedIntakeFilter('pending')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition border ${
                  selectedIntakeFilter === 'pending'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                Pending Triage ({pendingIntakesCount})
              </button>

              <button
                type="button"
                onClick={() => setSelectedIntakeFilter('action_required')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition border ${
                  selectedIntakeFilter === 'action_required'
                    ? 'bg-amber-600 text-white border-amber-600'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                Action Required
              </button>

              <button
                type="button"
                onClick={() => setSelectedIntakeFilter('accepted')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition border ${
                  selectedIntakeFilter === 'accepted'
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                Accepted / Pledged
              </button>
            </div>

            <div className="relative max-w-xs w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={intakeSearchQuery}
                onChange={(e) => setIntakeSearchQuery(e.target.value)}
                placeholder="Search applicant or code..."
                className="w-full text-xs pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-civic-600 shadow-2xs"
              />
            </div>
          </div>

          {/* Intakes List */}
          <div className="space-y-4">
            {filteredIntakes.map((sub) => (
              <div
                key={sub.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-civic-800">
                        {sub.confirmationCode}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                        {sub.household.size} person(s) • ${sub.household.monthlyIncome.toLocaleString()}/mo
                      </span>
                    </div>
                    <div className="text-sm font-bold text-slate-900 mt-0.5">
                      {sub.applicant.fullName}
                    </div>
                    <div className="text-xs text-slate-500">
                      {sub.applicant.phone} • {sub.applicant.address}, {sub.applicant.city} {sub.applicant.zipCode}
                    </div>
                  </div>

                  <div className="text-right">
                    <Link
                      href={`/tracking?code=${sub.confirmationCode}`}
                      target="_blank"
                      className="inline-flex items-center gap-1 text-xs text-civic-700 hover:underline font-bold"
                    >
                      <span>Open Resident View</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Submitted {formatRelativeTime(sub.createdAt)}
                    </div>
                  </div>
                </div>

                {/* Service Specifics */}
                {sub.serviceDetails.urgentStatement && (
                  <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100 italic">
                    "{sub.serviceDetails.urgentStatement}"
                  </p>
                )}

                {/* Referrals in Queue */}
                <div className="space-y-3 pt-1">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Dispatched Provider Referrals & Caseworker Actions:
                  </div>

                  {sub.referrals.map((ref) => (
                    <div
                      key={ref.id}
                      className="p-3.5 bg-slate-50/70 border border-slate-200 rounded-xl space-y-2.5 text-xs"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div>
                          <div className="font-bold text-slate-900">{ref.providerName}</div>
                          <div className="text-[11px] text-slate-500">{ref.programName}</div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-white border border-slate-200 text-slate-800 shadow-2xs">
                            {ref.status}
                          </span>
                        </div>
                      </div>

                      {ref.benefitAmountPledged && (
                        <div className="text-[11px] text-emerald-800 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Pledged Benefit: {ref.benefitAmountPledged}</span>
                        </div>
                      )}

                      {/* Caseworker 1-Click Action Buttons */}
                      <div className="pt-2 border-t border-slate-200/80 flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Triage:</span>

                        {ref.status !== 'ACCEPTED' && (
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateReferral(
                                sub.confirmationCode,
                                ref.id,
                                'ACCEPTED',
                                sub.serviceDetails.pastDueAmount ? `${sub.serviceDetails.pastDueAmount} authorized directly to account` : '$250 Emergency Crisis Grant authorized',
                                'Eligibility confirmed against 150% FPL guidelines. Disconnection freeze issued.'
                              )
                            }
                            className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-[11px] font-bold hover:bg-emerald-700 transition"
                          >
                            ✓ Accept & Pledge Grant
                          </button>
                        )}

                        {ref.status !== 'IN_REVIEW' && (
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateReferral(
                                sub.confirmationCode,
                                ref.id,
                                'IN_REVIEW',
                                undefined,
                                'Caseworker assigned. Verifying utility account details and past-due statement.'
                              )
                            }
                            className="px-2.5 py-1 bg-blue-100 text-blue-800 border border-blue-300 rounded-lg text-[11px] font-semibold hover:bg-blue-200 transition"
                          >
                            Mark In Review
                          </button>
                        )}

                        {ref.status !== 'ACTION_REQUIRED' && (
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateReferral(
                                sub.confirmationCode,
                                ref.id,
                                'ACTION_REQUIRED',
                                undefined,
                                'Please upload a clear copy of your official 10-day disconnect notice.'
                              )
                            }
                            className="px-2.5 py-1 bg-amber-100 text-amber-800 border border-amber-300 rounded-lg text-[11px] font-semibold hover:bg-amber-200 transition"
                          >
                            Request Document
                          </button>
                        )}

                        {ref.status !== 'WAITLISTED' && (
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateReferral(
                                sub.confirmationCode,
                                ref.id,
                                'WAITLISTED',
                                undefined,
                                'Qualified for seasonal funds. Placed in priority queue.'
                              )
                            }
                            className="px-2.5 py-1 bg-purple-100 text-purple-800 border border-purple-300 rounded-lg text-[11px] font-semibold hover:bg-purple-200 transition"
                          >
                            Place on Waitlist
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 2: RESOURCE VERIFICATION & DIRECTORY AUDIT
         ========================================================= */}
      {activePortalTab === 'resources' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => setSelectedResourceTab('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition border ${
                  selectedResourceTab === 'all'
                    ? 'bg-civic-700 text-white border-civic-700'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                All Resources ({resources.length})
              </button>

              <button
                type="button"
                onClick={() => setSelectedResourceTab('needs_review')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition border ${
                  selectedResourceTab === 'needs_review'
                    ? 'bg-amber-600 text-white border-amber-600'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                Needs Review ({reviewCount})
              </button>

              <button
                type="button"
                onClick={() => setSelectedResourceTab('stale')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition border ${
                  selectedResourceTab === 'stale'
                    ? 'bg-rose-600 text-white border-rose-600'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                Stale (&gt;60d) ({staleCount})
              </button>

              <button
                type="button"
                onClick={() => setSelectedResourceTab('archived')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition border ${
                  selectedResourceTab === 'archived'
                    ? 'bg-slate-800 text-white border-slate-800'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                Archived
              </button>
            </div>

            <div className="relative max-w-xs w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search records by name or category..."
                className="w-full text-xs pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-civic-600 shadow-2xs"
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Resource Name</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Verification Status</th>
                    <th className="py-3 px-4">Last Verified</th>
                    <th className="py-3 px-4">Authoritative Source</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredResources.map((res) => {
                    const audit = auditReport.find((a) => a.resourceId === res.id);
                    return (
                      <tr key={res.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-3 px-4 font-semibold text-slate-900 max-w-xs">
                          <div>{res.name}</div>
                          <div className="text-[11px] text-slate-500 font-normal truncate">
                            {res.address ? `${res.address}, ${res.city}` : res.city}
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-semibold">
                            {t.categories[res.category] || res.category}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              res.verification_status === 'VERIFIED'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : res.verification_status === 'NEEDS_REVIEW'
                                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                : res.verification_status === 'STALE'
                                ? 'bg-rose-50 text-rose-800 border border-rose-200'
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}
                          >
                            {res.verification_status === 'VERIFIED' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                            {res.verification_status === 'NEEDS_REVIEW' && <AlertTriangle className="w-3 h-3 text-amber-600" />}
                            {res.verification_status}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                          {formatRelativeTime(res.last_verified_at)}
                        </td>

                        <td className="py-3 px-4">
                          <a
                            href={res.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-civic-700 hover:underline max-w-[140px] truncate"
                          >
                            <span className="truncate">{new URL(res.source_url).hostname}</span>
                            <ExternalLink className="w-3 h-3 flex-shrink-0" />
                          </a>
                        </td>

                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {res.verification_status !== 'VERIFIED' && (
                              <button
                                type="button"
                                onClick={() => handleResourceStatusChange(res.id, 'VERIFIED')}
                                className="px-2 py-1 bg-emerald-600 text-white rounded font-bold hover:bg-emerald-700 text-[11px]"
                              >
                                Verify
                              </button>
                            )}

                            {res.verification_status !== 'NEEDS_REVIEW' && (
                              <button
                                type="button"
                                onClick={() => handleResourceStatusChange(res.id, 'NEEDS_REVIEW')}
                                className="px-2 py-1 bg-amber-100 text-amber-800 border border-amber-300 rounded font-semibold hover:bg-amber-200 text-[11px]"
                              >
                                Flag
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
