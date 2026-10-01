'use client';

import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  ShieldCheck,
  Calculator,
  ArrowRight,
  FileText,
  MapPin,
  Users,
  DollarSign,
  Zap,
  Home,
  Utensils,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/components/providers/LanguageProvider';
import {
  evaluateProgrammaticEligibility,
  HouseholdProfile,
  ProgramEligibilityEvaluation,
  getMonthlyFplThreshold,
  getMonthlyAmi80Threshold,
} from '@/lib/eligibility/rulesEngine';

export default function EligibilityChecker() {
  const { language, t } = useLanguage();
  const lang = language;

  const [householdSize, setHouseholdSize] = useState<number>(3);
  const [monthlyIncome, setMonthlyIncome] = useState<number>(2100);
  const [zipCode, setZipCode] = useState<string>('89030');
  const [housingStatus, setHousingStatus] = useState<'stable' | 'couch_surfing' | 'at_risk' | 'unhoused'>('at_risk');
  const [hasPastDueUtility, setHasPastDueUtility] = useState<boolean>(true);
  const [hasDisconnectNotice, setHasDisconnectNotice] = useState<boolean>(false);
  const [hasChildren, setHasChildren] = useState<boolean>(true);
  const [hasSeniors, setHasSeniors] = useState<boolean>(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const [evaluations, setEvaluations] = useState<ProgramEligibilityEvaluation[]>([]);

  useEffect(() => {
    const profile: HouseholdProfile = {
      householdSize,
      monthlyIncome,
      zipCode,
      housingStatus,
      hasPastDueUtility,
      hasDisconnectNotice,
      hasChildren,
      hasSeniors,
    };
    const results = evaluateProgrammaticEligibility(profile, lang);
    setEvaluations(results);
  }, [householdSize, monthlyIncome, zipCode, housingStatus, hasPastDueUtility, hasDisconnectNotice, hasChildren, hasSeniors, lang]);

  const qualifiedList = evaluations.filter((e) => e.status === 'QUALIFIED');
  const potentialList = evaluations.filter((e) => e.status === 'POTENTIALLY_ELIGIBLE');
  const ruledOutList = evaluations.filter((e) => e.status === 'RULED_OUT');

  const displayedList = evaluations.filter((e) => {
    if (filterCategory === 'qualified') return e.status === 'QUALIFIED';
    if (filterCategory === 'potentially_eligible') return e.status === 'POTENTIALLY_ELIGIBLE';
    if (filterCategory === 'ruled_out') return e.status === 'RULED_OUT';
    if (filterCategory !== 'all') return e.category === filterCategory;
    return true;
  });

  const fpl150 = getMonthlyFplThreshold(householdSize, 150);
  const fpl200 = getMonthlyFplThreshold(householdSize, 200);
  const ami80 = getMonthlyAmi80Threshold(householdSize);

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-civic-900 via-civic-800 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-civic-700/60 border border-civic-500/40 text-civic-200 text-xs font-bold tracking-wide">
            <Calculator className="w-3.5 h-3.5 text-amber-400" />
            <span>Nevada Nexus Programmatic Rules Engine</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
            Instant Programmatic Eligibility Matching
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Instantly evaluate your household against statutory Nevada guidelines (150% FPL, 200% SNAP limits, and 80% Clark County AMI). 
            Save time by ruling out ineligible programs and highlighting immediate assistance.
          </p>
        </div>
      </div>

      {/* Interactive Controls & Guidelines Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Profile Inputs */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Users className="w-4 h-4 text-civic-600" />
              Household Profile
            </h2>
            <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              Clark County / NV-04
            </span>
          </div>

          {/* Household Size */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
              <span>Household Size (including yourself)</span>
              <span className="font-bold text-civic-700">{householdSize} person(s)</span>
            </div>
            <input
              type="range"
              min="1"
              max="8"
              value={householdSize}
              onChange={(e) => setHouseholdSize(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-civic-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>1</span>
              <span>2</span>
              <span>3</span>
              <span>4</span>
              <span>5</span>
              <span>6</span>
              <span>7</span>
              <span>8+</span>
            </div>
          </div>

          {/* Monthly Income */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
              <span>Estimated Monthly Gross Income</span>
              <span className="font-bold text-emerald-700">${monthlyIncome.toLocaleString()} / mo</span>
            </div>
            <input
              type="range"
              min="0"
              max="8000"
              step="50"
              value={monthlyIncome}
              onChange={(e) => setMonthlyIncome(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>$0 (No Income)</span>
              <span>$2,500</span>
              <span>$5,000</span>
              <span>$8,000+</span>
            </div>
          </div>

          {/* Zip Code */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              Nevada Zip Code
            </label>
            <input
              type="text"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              placeholder="e.g. 89030 (North Las Vegas)"
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-civic-600 focus:outline-none"
            />
          </div>

          {/* Housing Stability */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <Home className="w-3.5 h-3.5 text-slate-400" />
              Housing Stability Status
            </label>
            <select
              value={housingStatus}
              onChange={(e) => setHousingStatus(e.target.value as any)}
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-civic-600 focus:outline-none bg-white"
            >
              <option value="stable">Stable Housing (Renting or Owning)</option>
              <option value="at_risk">At risk of losing housing / Behind on rent</option>
              <option value="couch_surfing">Staying temporarily with friends/family</option>
              <option value="unhoused">Currently unhoused / In vehicle / Shelter</option>
            </select>
          </div>

          {/* Quick Toggles */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={hasPastDueUtility}
                onChange={(e) => setHasPastDueUtility(e.target.checked)}
                className="w-4 h-4 rounded text-civic-600 focus:ring-civic-500"
              />
              <span>Past-due power / gas bill or pending shutoff</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={hasChildren}
                onChange={(e) => setHasChildren(e.target.checked)}
                className="w-4 h-4 rounded text-civic-600 focus:ring-civic-500"
              />
              <span>Household has dependent children</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={hasSeniors}
                onChange={(e) => setHasSeniors(e.target.checked)}
                className="w-4 h-4 rounded text-civic-600 focus:ring-civic-500"
              />
              <span>Household has seniors (age 60+)</span>
            </label>
          </div>

          {/* Federal Threshold Reference Box */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] space-y-1.5 text-slate-600">
            <div className="font-bold text-slate-800 text-xs">2026 Guidelines for {householdSize} person(s):</div>
            <div className="flex justify-between">
              <span>DWSS LIHEAP (150% FPL):</span>
              <span className="font-bold text-slate-900">${fpl150.toLocaleString()}/mo</span>
            </div>
            <div className="flex justify-between">
              <span>SNAP / Food Stamps (200% FPL):</span>
              <span className="font-bold text-slate-900">${fpl200.toLocaleString()}/mo</span>
            </div>
            <div className="flex justify-between">
              <span>CHAP Rental Assistance (80% AMI):</span>
              <span className="font-bold text-slate-900">${ami80.toLocaleString()}/mo</span>
            </div>
          </div>
        </div>

        {/* Right Section: Live Match Cards & Stats */}
        <div className="lg:col-span-7 space-y-4">
          {/* Summary Pills Bar */}
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setFilterCategory(filterCategory === 'qualified' ? 'all' : 'qualified')}
              className={`p-3.5 rounded-2xl border text-left transition ${
                filterCategory === 'qualified'
                  ? 'bg-emerald-100 border-emerald-400 ring-2 ring-emerald-500'
                  : 'bg-emerald-50/80 border-emerald-200 hover:bg-emerald-100/60'
              }`}
            >
              <div className="flex items-center gap-1.5 text-emerald-800 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Qualified Match</span>
              </div>
              <div className="text-2xl font-extrabold text-emerald-900 mt-1">{qualifiedList.length}</div>
              <div className="text-[10px] text-emerald-700 mt-0.5">Ready for direct intake</div>
            </button>

            <button
              type="button"
              onClick={() => setFilterCategory(filterCategory === 'potentially_eligible' ? 'all' : 'potentially_eligible')}
              className={`p-3.5 rounded-2xl border text-left transition ${
                filterCategory === 'potentially_eligible'
                  ? 'bg-amber-100 border-amber-400 ring-2 ring-amber-500'
                  : 'bg-amber-50/80 border-amber-200 hover:bg-amber-100/60'
              }`}
            >
              <div className="flex items-center gap-1.5 text-amber-800 text-xs font-bold">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>Pending Info</span>
              </div>
              <div className="text-2xl font-extrabold text-amber-900 mt-1">{potentialList.length}</div>
              <div className="text-[10px] text-amber-700 mt-0.5">Needs doc verification</div>
            </button>

            <button
              type="button"
              onClick={() => setFilterCategory(filterCategory === 'ruled_out' ? 'all' : 'ruled_out')}
              className={`p-3.5 rounded-2xl border text-left transition ${
                filterCategory === 'ruled_out'
                  ? 'bg-rose-100 border-rose-400 ring-2 ring-rose-500'
                  : 'bg-rose-50/80 border-rose-200 hover:bg-rose-100/60'
              }`}
            >
              <div className="flex items-center gap-1.5 text-rose-800 text-xs font-bold">
                <XCircle className="w-4 h-4 text-rose-600" />
                <span>Ruled Out</span>
              </div>
              <div className="text-2xl font-extrabold text-rose-900 mt-1">{ruledOutList.length}</div>
              <div className="text-[10px] text-rose-700 mt-0.5">Exceeds limit / area</div>
            </button>
          </div>

          {/* Program Match Cards */}
          <div className="space-y-3">
            {displayedList.map((item) => {
              const isQualified = item.status === 'QUALIFIED';
              const isRuledOut = item.status === 'RULED_OUT';

              return (
                <div
                  key={item.programId}
                  className={`p-5 rounded-2xl border transition ${
                    isQualified
                      ? 'bg-white border-emerald-200 shadow-sm hover:shadow-md'
                      : isRuledOut
                      ? 'bg-slate-50/80 border-slate-200 opacity-80'
                      : 'bg-white border-amber-200 shadow-xs'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold tracking-wide uppercase ${
                            isQualified
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : isRuledOut
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : 'bg-amber-100 text-amber-800 border border-amber-300'
                          }`}
                        >
                          {isQualified ? '🟢 HIGH PROBABILITY MATCH' : isRuledOut ? '🔴 RULED OUT' : '🟡 POTENTIALLY ELIGIBLE'}
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium capitalize">
                          {item.category.replace('_', ' ')}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 mt-1.5">{item.programName}</h3>
                    </div>

                    {isQualified && (
                      <Link
                        href={`/intake?program=${item.programId}&size=${householdSize}&income=${monthlyIncome}`}
                        className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 bg-civic-700 hover:bg-civic-800 text-white rounded-xl text-xs font-bold transition shadow-xs flex-shrink-0"
                      >
                        <span>Direct Electronic Intake</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>

                  {/* Reasons & Rules Breakdown */}
                  <div className="mt-3.5 space-y-2 text-xs">
                    {/* Qualifying Points */}
                    {item.qualifyingReasons.map((reason, idx) => (
                      <div key={idx} className="flex items-start gap-1.5 text-emerald-800">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span>{reason}</span>
                      </div>
                    ))}

                    {/* Disqualifying Points */}
                    {item.disqualifyingReasons.map((reason, idx) => (
                      <div key={idx} className="flex items-start gap-1.5 text-rose-800 font-medium">
                        <XCircle className="w-3.5 h-3.5 text-rose-600 flex-shrink-0 mt-0.5" />
                        <span>{reason}</span>
                      </div>
                    ))}

                    {/* Pending Verification */}
                    {item.pendingRequirements.map((req, idx) => (
                      <div key={idx} className="flex items-start gap-1.5 text-amber-800">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <span>{req}</span>
                      </div>
                    ))}
                  </div>

                  {/* Required Documents Badge List */}
                  {item.requiredDocuments.length > 0 && !isRuledOut && (
                    <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Required:</span>
                      {item.requiredDocuments.map((doc, dIdx) => (
                        <span
                          key={dIdx}
                          className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-medium border border-slate-200"
                        >
                          {doc}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
