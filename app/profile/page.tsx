'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  ShieldCheck,
  MapPin,
  Users,
  DollarSign,
  Zap,
  Apple,
  Home,
  HeartPulse,
  Briefcase,
  Bus,
  Baby,
  LogOut,
  Edit3,
  CheckCircle2,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { PersonalizationWizard } from '@/components/auth/PersonalizationWizard';
import { getMonthlyFplThreshold } from '@/lib/eligibility/rulesEngine';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
          <User className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900">Sign In to View Your Profile</h1>
        <p className="text-sm text-slate-600">
          Personalize your Nevada Nexus experience by signing in or completing the onboarding questionnaire.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link
            href="/login"
            className="px-5 py-2.5 rounded-xl bg-civic-700 text-white font-bold text-sm shadow-sm hover:bg-civic-800 transition"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-sm hover:bg-slate-50 transition"
          >
            Create Account &amp; Personalize
          </Link>
        </div>
      </div>
    );
  }

  const { profile } = user;
  const fpl150 = getMonthlyFplThreshold(profile.householdSize, 150);

  if (isEditing) {
    return (
      <div className="py-6 space-y-6">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-900">Edit Your Personalized Information</h1>
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            Cancel
          </button>
        </div>
        <PersonalizationWizard mode="edit" onCompleted={() => setIsEditing(false)} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 sm:py-8 space-y-8">
      {/* Profile Header */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-civic-700 to-civic-500 text-white flex items-center justify-center font-extrabold text-2xl shadow-md">
            {profile.fullName.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-slate-900">{profile.fullName}</h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                Personalized
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{profile.email} {profile.phone && `• ${profile.phone}`}</p>
            <div className="flex items-center gap-2 mt-2 text-xs text-slate-600">
              <span className="flex items-center gap-1 font-semibold text-slate-700">
                <MapPin className="w-3.5 h-3.5 text-civic-700" />
                {profile.neighborhood || `Zip ${profile.zipCode}`}
              </span>
              <span>•</span>
              <span className="uppercase text-[11px] font-bold text-slate-500">
                Language: {profile.preferredLanguage}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition"
          >
            <Edit3 className="w-3.5 h-3.5 text-slate-500" />
            <span>Update Answers</span>
          </button>
          <button
            type="button"
            onClick={() => {
              logout();
              router.push('/');
            }}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-rose-700 font-bold text-xs hover:bg-rose-50 transition"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-600" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Household & Finances */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Household &amp; Income</h2>
            <Users className="w-4 h-4 text-civic-700" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{profile.householdSize} Persons</div>
            <div className="text-xs text-slate-500 mt-0.5">
              ${profile.monthlyIncome.toLocaleString()} / month gross
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600">
            <div className="font-semibold text-slate-800">150% FPL Ceiling: ${fpl150.toLocaleString()}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              {profile.monthlyIncome <= fpl150 ? 'Eligible for State Energy Assistance' : 'Standard assistance tiers apply'}
            </div>
          </div>
        </div>

        {/* Priority Needs */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Priority Needs</h2>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {profile.primaryNeeds.map((need) => (
              <span
                key={need}
                className="px-2.5 py-1 rounded-lg bg-civic-50 text-civic-800 border border-civic-200 text-xs font-semibold capitalize"
              >
                {need.replace('_', ' ')}
              </span>
            ))}
          </div>
        </div>

        {/* Circumstances & Indicators */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Special Circumstances</h2>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <ul className="text-xs space-y-1.5 text-slate-700">
            {profile.hasChildren && <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Children under 18</li>}
            {profile.hasSeniors && <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Seniors in household</li>}
            {profile.isVeteran && <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Military Veteran</li>}
            {profile.hasDisability && <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Person with disability</li>}
            {profile.hasPastDueUtility && <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-amber-600" /> Past-due utility bill</li>}
            {profile.hasDisconnectNotice && <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-rose-600" /> Active shutoff notice</li>}
          </ul>
        </div>
      </div>

      {/* Quick Launchpad */}
      <div className="bg-gradient-to-r from-civic-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h2 className="text-lg font-bold text-white">Your Pre-Configured Action Shortcuts</h2>
          <p className="text-xs text-slate-300">
            Jump directly into intake or chat with your answers already filled in.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link
            href="/intake"
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition"
          >
            <span>Pre-Filled Intake</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            href="/chat"
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-civic-700 hover:bg-civic-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition"
          >
            <span>Personalized AI Chat</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
