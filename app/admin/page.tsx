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
} from 'lucide-react';
import { Resource, VerificationStatus } from '@/lib/types';
import { getAdminResources, updateResourceStatus } from '@/tools/verification';
import { auditResources, AuditReportItem } from '@/agents/verification';
import { formatRelativeTime } from '@/lib/utils';
import { useLanguage } from '@/components/providers/LanguageProvider';

export default function AdminPage() {
  const { t } = useLanguage();
  const [resources, setResources] = useState<Resource[]>([]);
  const [selectedTab, setSelectedTab] = useState<'all' | 'needs_review' | 'stale' | 'archived'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [auditReport, setAuditReport] = useState<AuditReportItem[]>([]);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const list = getAdminResources();
    setResources(list);
    const report = auditResources(list);
    setAuditReport(report);
  }, []);

  const handleStatusChange = (resourceId: string, newStatus: VerificationStatus) => {
    const updated = updateResourceStatus(resourceId, newStatus, resources);
    setResources(updated);
    setAuditReport(auditResources(updated));

    const res = resources.find((r) => r.id === resourceId);
    setActionSuccessMessage(`Updated "${res?.name.slice(0, 30)}..." to ${newStatus}.`);
    setTimeout(() => setActionSuccessMessage(null), 3000);
  };

  const filteredResources = resources.filter((res) => {
    // Tab filter
    if (selectedTab === 'needs_review' && res.verification_status !== 'NEEDS_REVIEW') return false;
    if (selectedTab === 'stale' && res.verification_status !== 'STALE') return false;
    if (selectedTab === 'archived' && res.verification_status !== 'ARCHIVED') return false;

    // Search query
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

  const staleCount = auditReport.filter((r) => r.isStale).length;
  const reviewCount = resources.filter((r) => r.verification_status === 'NEEDS_REVIEW').length;

  return (
    <div className="space-y-6 py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Admin & Resource Verification Portal
            </h1>
            <span className="text-xs font-bold text-civic-700 bg-civic-100 px-2 py-0.5 rounded-full">
              Nevada Nexus Admin
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit community assistance resources, resolve verification flags, and enforce authoritative sources.
          </p>
        </div>

        {/* Stats Pill Badges */}
        <div className="flex items-center gap-2">
          {reviewCount > 0 && (
            <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              {reviewCount} Needs Review
            </span>
          )}
          {staleCount > 0 && (
            <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {staleCount} Stale (&gt;60d)
            </span>
          )}
        </div>
      </div>

      {actionSuccessMessage && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{actionSuccessMessage}</span>
        </div>
      )}

      {/* Tabs and Search Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setSelectedTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition border ${
              selectedTab === 'all'
                ? 'bg-civic-700 text-white border-civic-700'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            All Resources ({resources.length})
          </button>

          <button
            type="button"
            onClick={() => setSelectedTab('needs_review')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition border ${
              selectedTab === 'needs_review'
                ? 'bg-amber-600 text-white border-amber-600'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            Needs Review ({reviewCount})
          </button>

          <button
            type="button"
            onClick={() => setSelectedTab('stale')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition border ${
              selectedTab === 'stale'
                ? 'bg-rose-600 text-white border-rose-600'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            Stale Resources ({staleCount})
          </button>

          <button
            type="button"
            onClick={() => setSelectedTab('archived')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition border ${
              selectedTab === 'archived'
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

      {/* Resource Table (PRD Section 38) */}
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
                      {audit?.issuesDetected.length ? (
                        <p className="text-[10px] text-rose-600 mt-0.5 line-clamp-1">
                          {audit.issuesDetected[0]}
                        </p>
                      ) : null}
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
                        title={res.source_url}
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
                            onClick={() => handleStatusChange(res.id, 'VERIFIED')}
                            className="px-2 py-1 bg-emerald-600 text-white rounded font-bold hover:bg-emerald-700 text-[11px]"
                            title="Verify and update timestamp"
                          >
                            Verify
                          </button>
                        )}

                        {res.verification_status !== 'NEEDS_REVIEW' && (
                          <button
                            type="button"
                            onClick={() => handleStatusChange(res.id, 'NEEDS_REVIEW')}
                            className="px-2 py-1 bg-amber-100 text-amber-800 border border-amber-300 rounded font-semibold hover:bg-amber-200 text-[11px]"
                            title="Flag for review"
                          >
                            Flag
                          </button>
                        )}

                        {res.verification_status !== 'ARCHIVED' && (
                          <button
                            type="button"
                            onClick={() => handleStatusChange(res.id, 'ARCHIVED')}
                            className="px-2 py-1 bg-slate-100 text-slate-600 border border-slate-200 rounded font-semibold hover:bg-slate-200 text-[11px]"
                            title="Archive resource"
                          >
                            Archive
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
  );
}
