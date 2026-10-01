'use client';

import React, { useState, useEffect } from 'react';
import {
  Send,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Users,
  Building2,
  ShieldCheck,
  Zap,
  Home,
  Utensils,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  Lock,
  ArrowRight,
  Sparkles,
  Upload,
} from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { VERIFIED_RESOURCES } from '@/lib/data/verifiedResources';
import { ResourceCategory } from '@/lib/types';

export default function DirectIntakeForm() {
  const { language, t } = useLanguage();
  const lang = language;

  const [step, setStep] = useState<number>(1);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submissionResult, setSubmissionResult] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Applicant info
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('2415 E Craig Rd #104');
  const [city, setCity] = useState('North Las Vegas');
  const [zipCode, setZipCode] = useState('89030');

  // Household & Income
  const [householdSize, setHouseholdSize] = useState<number>(3);
  const [monthlyIncome, setMonthlyIncome] = useState<number>(2150);
  const [housingStatus, setHousingStatus] = useState<'stable' | 'couch_surfing' | 'at_risk' | 'unhoused'>('at_risk');
  const [hasChildren, setHasChildren] = useState<boolean>(true);
  const [hasSeniors, setHasSeniors] = useState<boolean>(false);
  const [hasDisability, setHasDisability] = useState<boolean>(false);

  // Service Details
  const [primaryNeeds, setPrimaryNeeds] = useState<ResourceCategory[]>(['utility_assistance', 'food_assistance']);
  const [utilityProvider, setUtilityProvider] = useState<'NV Energy' | 'Southwest Gas' | 'Other'>('NV Energy');
  const [utilityAccountNumber, setUtilityAccountNumber] = useState('9082-114-88');
  const [pastDueAmount, setPastDueAmount] = useState('$218.50');
  const [disconnectNoticeDate, setDisconnectNoticeDate] = useState('2026-10-04');
  const [urgentStatement, setUrgentStatement] = useState('Received a 10-day power shutoff notice and need emergency grocery support for 2 kids.');

  // Target Providers to Dispatch to
  const [targetProviderIds, setTargetProviderIds] = useState<string[]>([
    'res-state-dwss-liheap',
    'res-three-square',
  ]);

  const availableProviders = VERIFIED_RESOURCES.slice(0, 6);

  const toggleProvider = (id: string) => {
    setTargetProviderIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const toggleNeed = (need: ResourceCategory) => {
    setPrimaryNeeds((prev) =>
      prev.includes(need) ? prev.filter((n) => n !== need) : [...prev, need]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage(null);

    try {
      const payload = {
        applicant: {
          fullName,
          phone,
          email,
          address,
          city,
          zipCode,
        },
        household: {
          size: householdSize,
          monthlyIncome,
          housingStatus,
          hasChildren,
          hasSeniors,
          hasDisability,
        },
        serviceDetails: {
          primaryNeeds,
          utilityProvider,
          utilityAccountNumber,
          pastDueAmount,
          disconnectNoticeDate,
          urgentStatement,
        },
        targetProviderIds,
        attachedDocuments: [
          { id: 'doc-1', type: 'utility_bill', fileName: 'nv_energy_bill.pdf', verified: true },
        ],
        language: lang,
      };

      const res = await fetch('/api/intake/direct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSubmissionResult(data.submission);
      } else {
        setErrorMessage(data.error || 'Failed to submit electronic intake.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Network error submitting direct electronic intake.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submissionResult) {
    return (
      <div className="max-w-2xl mx-auto bg-white p-6 sm:p-8 rounded-3xl border border-emerald-200 shadow-xl text-center space-y-6 animate-in fade-in">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold tracking-wide uppercase">
            Direct Electronic Intake Dispatched
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Application Transmitted to Provider Queues
          </h2>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            Your single electronic intake packet was securely formatted and sent directly to {submissionResult.referrals.length} community provider(s).
          </p>
        </div>

        {/* Confirmation Code Card */}
        <div className="p-5 bg-slate-50 border-2 border-dashed border-civic-300 rounded-2xl max-w-md mx-auto space-y-1">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Your Closed-Loop Tracking Code</div>
          <div className="text-2xl sm:text-3xl font-mono font-black text-civic-800 tracking-wider">
            {submissionResult.confirmationCode}
          </div>
          <p className="text-[11px] text-slate-500">
            Save this confirmation code to check live caseworker reviews, benefit pledge amounts, and waitlist progress anytime.
          </p>
        </div>

        {/* Dispatched Providers List */}
        <div className="text-left space-y-2 max-w-md mx-auto">
          <div className="text-xs font-bold text-slate-700">Dispatched Referral Queues:</div>
          {submissionResult.referrals.map((ref: any) => (
            <div
              key={ref.id}
              className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-xs"
            >
              <div>
                <div className="font-bold text-slate-900">{ref.providerName}</div>
                <div className="text-[11px] text-slate-500">{ref.programName}</div>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-civic-100 text-civic-800 font-bold text-[10px]">
                {ref.status}
              </span>
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href={`/tracking?code=${submissionResult.confirmationCode}`}
            className="w-full sm:w-auto px-6 py-3 bg-civic-700 hover:bg-civic-800 text-white font-bold rounded-xl text-sm transition shadow-md flex items-center justify-center gap-2"
          >
            <span>Open Closed-Loop Tracking Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <button
            type="button"
            onClick={() => {
              setSubmissionResult(null);
              setStep(1);
            }}
            className="w-full sm:w-auto px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
          >
            Submit Another Intake
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-civic-900 via-civic-800 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-civic-700/60 border border-civic-500/40 text-civic-200 text-xs font-bold tracking-wide">
            <Send className="w-3.5 h-3.5 text-amber-400" />
            <span>Single Unified Application Protocol</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Direct Electronic Intake Form
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Fill out one secure electronic packet once. Nevada Nexus automatically maps your demographics, utility details, and household income directly into verified provider queues—eliminating duplicate PDF forms and phone tag.
          </p>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Multi-Step Intake Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        {/* Step Indicator */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-civic-700 text-white font-bold text-xs flex items-center justify-center">
              1
            </span>
            <span className="font-bold text-slate-900 text-sm">Applicant & Household Details</span>
          </div>
          <div className="flex items-center gap-1 text-slate-400 text-xs">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-[11px] text-emerald-700 font-semibold">256-Bit Encrypted Transmission</span>
          </div>
        </div>

        {/* Section 1: Applicant Information */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">1. Applicant Contact Info</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Legal Name *</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Maria Santos"
                className="w-full text-xs px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-civic-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number (SMS Updates) *</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(702) 555-0192"
                className="w-full text-xs px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-civic-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="m.santos702@example.com"
                className="w-full text-xs px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-civic-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Physical Street Address *</label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="2415 E Craig Rd #104"
                className="w-full text-xs px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-civic-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full text-xs px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-civic-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Zip Code *</label>
              <input
                type="text"
                required
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                placeholder="89030"
                className="w-full text-xs px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-civic-600 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Household & Income Profile */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">2. Household & Income Profile</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Household Size</label>
              <input
                type="number"
                min="1"
                max="12"
                value={householdSize}
                onChange={(e) => setHouseholdSize(Number(e.target.value))}
                className="w-full text-xs px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-civic-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Monthly Gross Income ($)</label>
              <input
                type="number"
                min="0"
                step="50"
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                className="w-full text-xs px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-civic-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Housing Status</label>
              <select
                value={housingStatus}
                onChange={(e) => setHousingStatus(e.target.value as any)}
                className="w-full text-xs px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-civic-600 focus:outline-none bg-white"
              >
                <option value="stable">Stable Housing</option>
                <option value="at_risk">At Risk of Eviction / Behind</option>
                <option value="couch_surfing">Staying with Friends/Family</option>
                <option value="unhoused">Unhoused / Shelter / Vehicle</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 pt-1">
            <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={hasChildren}
                onChange={(e) => setHasChildren(e.target.checked)}
                className="w-4 h-4 rounded text-civic-600 focus:ring-civic-500"
              />
              <span>Children under 18 in home</span>
            </label>

            <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={hasSeniors}
                onChange={(e) => setHasSeniors(e.target.checked)}
                className="w-4 h-4 rounded text-civic-600 focus:ring-civic-500"
              />
              <span>Seniors (age 60+)</span>
            </label>

            <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={hasDisability}
                onChange={(e) => setHasDisability(e.target.checked)}
                className="w-4 h-4 rounded text-civic-600 focus:ring-civic-500"
              />
              <span>Household member with disability</span>
            </label>
          </div>
        </div>

        {/* Section 3: Utility & Urgent Crisis Details */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">3. Utility & Crisis Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Utility Provider</label>
              <select
                value={utilityProvider}
                onChange={(e) => setUtilityProvider(e.target.value as any)}
                className="w-full text-xs px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-civic-600 focus:outline-none bg-white"
              >
                <option value="NV Energy">NV Energy (Electric)</option>
                <option value="Southwest Gas">Southwest Gas</option>
                <option value="Other">Water / Other Utility</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Account Number</label>
              <input
                type="text"
                value={utilityAccountNumber}
                onChange={(e) => setUtilityAccountNumber(e.target.value)}
                placeholder="e.g. 9082-114-88"
                className="w-full text-xs px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-civic-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Past Due Amount ($)</label>
              <input
                type="text"
                value={pastDueAmount}
                onChange={(e) => setPastDueAmount(e.target.value)}
                placeholder="$218.50"
                className="w-full text-xs px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-civic-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Urgency Statement / Circumstances
            </label>
            <textarea
              rows={2}
              value={urgentStatement}
              onChange={(e) => setUrgentStatement(e.target.value)}
              placeholder="Explain your situation in your own words..."
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-civic-600 focus:outline-none"
            />
          </div>
        </div>

        {/* Section 4: Target Provider Queues Selection */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                4. Select Target Providers to Transmit Data To
              </h3>
              <p className="text-[11px] text-slate-500">
                Check the verified providers who will receive your electronic application packet directly.
              </p>
            </div>
            <span className="text-xs font-bold text-civic-700 bg-civic-100 px-2.5 py-1 rounded-full">
              {targetProviderIds.length} Selected
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {availableProviders.map((prov) => {
              const selected = targetProviderIds.includes(prov.id);
              return (
                <div
                  key={prov.id}
                  onClick={() => toggleProvider(prov.id)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-start gap-3 ${
                    selected
                      ? 'bg-civic-50/80 border-civic-400 ring-1 ring-civic-500'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => {}}
                    className="w-4 h-4 rounded text-civic-600 focus:ring-civic-500 mt-0.5"
                  />
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-slate-900">{prov.name}</div>
                    <div className="text-[11px] text-slate-500 line-clamp-1">{prov.description}</div>
                    <div className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Direct Electronic Queue Enabled
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="text-[11px] text-slate-500">
            By transmitting, you authorize Nevada Nexus to securely route your intake packet to the selected verified providers.
          </div>

          <button
            type="submit"
            disabled={submitting || targetProviderIds.length === 0}
            className="px-6 py-3.5 bg-civic-700 hover:bg-civic-800 disabled:bg-slate-300 text-white font-bold rounded-xl text-sm transition shadow-md flex items-center gap-2 flex-shrink-0"
          >
            {submitting ? (
              <span>Transmitting Packet...</span>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Submit Electronic Intake</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
