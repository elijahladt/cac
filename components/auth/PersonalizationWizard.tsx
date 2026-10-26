'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  DollarSign,
  MapPin,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Zap,
  Apple,
  Home,
  HeartPulse,
  Briefcase,
  Bus,
  Baby,
  AlertTriangle,
  Lock,
  Mail,
  User,
  Phone,
  FileCheck,
} from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { NV04_ZIP_CODES } from '@/lib/auth/demoProfiles';
import { ResourceCategory, SupportedLanguage } from '@/lib/types';
import { HousingStatusType, UserPersonalizationProfile } from '@/lib/types/auth';
import { evaluateProgrammaticEligibility, getMonthlyFplThreshold } from '@/lib/eligibility/rulesEngine';

interface PersonalizationWizardProps {
  mode?: 'signup' | 'edit';
  onCompleted?: () => void;
}

export function PersonalizationWizard({ mode = 'signup', onCompleted }: PersonalizationWizardProps) {
  const router = useRouter();
  const { user, signup, updateProfile } = useAuth();
  const { language, setLanguage } = useLanguage();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Account / Contact fields
  const [fullName, setFullName] = useState(user?.profile.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState(user?.profile.phone || '');
  const [preferredLang, setPreferredLang] = useState<SupportedLanguage>(user?.profile.preferredLanguage || language || 'en');

  // Location & Household
  const [zipCode, setZipCode] = useState<string>(user?.profile.zipCode || '89030');
  const [householdSize, setHouseholdSize] = useState<number>(user?.profile.householdSize || 3);
  const [monthlyIncome, setMonthlyIncome] = useState<number>(user?.profile.monthlyIncome || 1850);
  const [housingStatus, setHousingStatus] = useState<HousingStatusType>(user?.profile.housingStatus || 'at_risk');

  // Needs & Priorities
  const [primaryNeeds, setPrimaryNeeds] = useState<ResourceCategory[]>(
    user?.profile.primaryNeeds || ['utility_assistance', 'food_assistance']
  );

  // Circumstances
  const [hasChildren, setHasChildren] = useState<boolean>(user?.profile.hasChildren ?? true);
  const [hasSeniors, setHasSeniors] = useState<boolean>(user?.profile.hasSeniors ?? false);
  const [hasDisability, setHasDisability] = useState<boolean>(user?.profile.hasDisability ?? false);
  const [isVeteran, setIsVeteran] = useState<boolean>(user?.profile.isVeteran ?? false);
  const [hasPastDueUtility, setHasPastDueUtility] = useState<boolean>(user?.profile.hasPastDueUtility ?? true);
  const [hasDisconnectNotice, setHasDisconnectNotice] = useState<boolean>(user?.profile.hasDisconnectNotice ?? true);
  const [utilityProvider, setUtilityProvider] = useState<'NV Energy' | 'Southwest Gas' | 'Other' | 'None'>(
    user?.profile.utilityProvider || 'NV Energy'
  );

  const toggleNeed = (need: ResourceCategory) => {
    setPrimaryNeeds((prev) =>
      prev.includes(need) ? prev.filter((n) => n !== need) : [...prev, need]
    );
  };

  const handleNext = () => {
    setError(null);
    if (currentStep === 1) {
      if (!fullName.trim()) {
        setError('Please enter your name.');
        return;
      }
      if (mode === 'signup' && !email.trim()) {
        setError('Please enter your email.');
        return;
      }
      if (mode === 'signup' && !password.trim()) {
        setError('Please create a password for your account.');
        return;
      }
      if (preferredLang !== language) {
        setLanguage(preferredLang);
      }
    }
    setCurrentStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setError(null);
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const handleFinish = async () => {
    setIsSubmitting(true);
    setError(null);

    const profileData: UserPersonalizationProfile = {
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
      zipCode,
      neighborhood: NV04_ZIP_CODES.find((z) => z.zip === zipCode)?.area || 'North Las Vegas / NV-04',
      preferredLanguage: preferredLang,
      householdSize,
      monthlyIncome,
      housingStatus,
      primaryNeeds,
      hasChildren,
      hasSeniors,
      hasDisability,
      isVeteran,
      hasPastDueUtility,
      hasDisconnectNotice,
      utilityProvider,
      onboardingCompleted: true,
    };

    try {
      if (mode === 'signup') {
        const res = await signup({ email, password }, profileData);
        if (!res.success) {
          setError(res.error || 'Failed to complete signup.');
          setIsSubmitting(false);
          return;
        }
      } else {
        updateProfile(profileData);
      }

      setCurrentStep(4); // Celebration / personalized results step
    } catch (err: any) {
      setError(err?.message || 'An error occurred while saving your profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Instant eligibility preview calculations
  const fpl150 = getMonthlyFplThreshold(householdSize, 150);
  const isBelow150Fpl = monthlyIncome <= fpl150;
  const instantEvaluations = evaluateProgrammaticEligibility(
    {
      householdSize,
      monthlyIncome,
      zipCode,
      housingStatus,
      hasPastDueUtility,
      hasDisconnectNotice,
      hasChildren,
      hasSeniors,
      hasDisability,
    },
    preferredLang
  );
  const qualifiedMatches = instantEvaluations.filter((e) => e.status === 'QUALIFIED');

  const categoriesList: {
    key: ResourceCategory;
    name: string;
    icon: React.ComponentType<{ className?: string }>;
    desc: string;
  }[] = [
    { key: 'utility_assistance', name: 'Utility & Energy Bills', icon: Zap, desc: 'NV Energy & Southwest Gas payment aid' },
    { key: 'food_assistance', name: 'Food & Groceries', icon: Apple, desc: 'Pantries, SNAP/EBT & food box deliveries' },
    { key: 'housing', name: 'Emergency Rent & Housing', icon: Home, desc: 'Eviction defense & rental assistance' },
    { key: 'healthcare', name: 'Health & Community Clinics', icon: HeartPulse, desc: 'No-cost clinics, prescriptions & Medicaid' },
    { key: 'childcare', name: 'Childcare & Youth Programs', icon: Baby, desc: 'Head Start, early learning & subsidies' },
    { key: 'jobs', name: 'Job Training & Careers', icon: Briefcase, desc: 'Employ NV workforce training & placement' },
    { key: 'transportation', name: 'Transportation & Bus Passes', icon: Bus, desc: 'RTC discounted passes & transit access' },
  ];

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden max-w-2xl mx-auto">
      {/* Step Indicator Header */}
      <div className="bg-gradient-to-r from-civic-900 via-civic-800 to-slate-900 text-white p-6 sm:p-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center">
              NV
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-civic-200">
              Personalized Assistance Setup
            </span>
          </div>
          <span className="text-xs text-slate-300 font-medium">
            {currentStep <= 3 ? `Step ${currentStep} of 3` : 'Setup Complete'}
          </span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          {currentStep === 1 && 'Create Your Personalized Profile'}
          {currentStep === 2 && 'Location & Household Details'}
          {currentStep === 3 && 'Assistance Needs & Priorities'}
          {currentStep === 4 && 'Your Personalized Portal is Ready!'}
        </h2>
        <p className="text-slate-300 text-xs sm:text-sm mt-1.5 leading-relaxed">
          {currentStep === 1 && 'Your answers customize eligibility calculations and auto-fill applications across Nevada Nexus.'}
          {currentStep === 2 && 'We strictly filter for programs serving North Las Vegas and Congressional District 4.'}
          {currentStep === 3 && 'Choose what matters most to your household right now.'}
          {currentStep === 4 && 'Here are verified Nevada programs matched specifically to your situation.'}
        </p>

        {/* Step dots */}
        <div className="flex items-center gap-2 mt-6">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                currentStep >= step ? 'bg-amber-400' : 'bg-civic-950/60'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="p-6 sm:p-8">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: Account / Personal info */}
        {currentStep === 1 && (
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g., Elena Gomez"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-civic-600 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="elena@example.com"
                    disabled={mode === 'edit'}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-civic-600 focus:outline-none disabled:bg-slate-100"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Phone (Optional)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(702) 555-0142"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-civic-600 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a secure password"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-civic-600 focus:outline-none"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Preferred Language
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { code: 'en' as SupportedLanguage, label: 'English' },
                  { code: 'es' as SupportedLanguage, label: 'Español' },
                  { code: 'tl' as SupportedLanguage, label: 'Tagalog' },
                ].map((item) => (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => setPreferredLang(item.code)}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold text-center transition ${
                      preferredLang === item.code
                        ? 'border-civic-600 bg-civic-50 text-civic-700 font-bold ring-2 ring-civic-600/20'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleNext}
                className="w-full py-3 px-4 rounded-xl bg-civic-700 hover:bg-civic-800 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition"
              >
                <span>Continue to Household Details</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Location & Household Finances */}
        {currentStep === 2 && (
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                North Las Vegas / NV-04 Zip Code
              </label>
              <select
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-civic-600 focus:outline-none bg-white font-medium"
              >
                {NV04_ZIP_CODES.map((item) => (
                  <option key={item.zip} value={item.zip}>
                    {item.zip} — {item.area}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-civic-600" />
                <span>Geographic targeting ensures direct access to local Clark County providers.</span>
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Household Size (Persons)
                </label>
                <div className="relative">
                  <Users className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={householdSize}
                    onChange={(e) => setHouseholdSize(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-civic-600 focus:outline-none font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Monthly Gross Income ($)
                </label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={monthlyIncome}
                    onChange={(e) => setMonthlyIncome(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-civic-600 focus:outline-none font-semibold"
                  />
                </div>
              </div>
            </div>

            {/* Income guide badge */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-800">150% Federal Poverty Ceiling:</span>{' '}
                ${fpl150.toLocaleString()}/mo for {householdSize} people
              </div>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  isBelow150Fpl ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}
              >
                {isBelow150Fpl ? 'Qualifies for Full EAP / REACH' : 'Income Above 150% FPL'}
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Current Housing Situation
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { id: 'stable', label: 'Stable Housing (Renting/Owner)' },
                  { id: 'at_risk', label: 'Renting with Eviction / Shutoff Risk' },
                  { id: 'couch_surfing', label: 'Staying with Friends / Family' },
                  { id: 'unhoused', label: 'Unhoused / Temporary Shelter' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setHousingStatus(item.id as HousingStatusType)}
                    className={`p-2.5 rounded-xl border text-left font-medium transition ${
                      housingStatus === item.id
                        ? 'border-civic-600 bg-civic-50 text-civic-800 font-bold ring-2 ring-civic-600/20'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleBack}
                className="py-3 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-sm flex items-center justify-center gap-1.5 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="flex-1 py-3 px-4 rounded-xl bg-civic-700 hover:bg-civic-800 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition"
              >
                <span>Continue to Priorities</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Needs & Priorities */}
        {currentStep === 3 && (
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                What assistance do you need most? (Select all that apply)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {categoriesList.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = primaryNeeds.includes(cat.key);
                  return (
                    <button
                      key={cat.key}
                      type="button"
                      onClick={() => toggleNeed(cat.key)}
                      className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition ${
                        isSelected
                          ? 'border-civic-600 bg-civic-50 text-civic-900 ring-2 ring-civic-600/20'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div
                        className={`p-2 rounded-lg ${
                          isSelected ? 'bg-civic-700 text-white' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold">{cat.name}</div>
                        <div className="text-[11px] text-slate-500 leading-tight mt-0.5">{cat.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Household Circumstances (For accurate statutory matching)
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasChildren}
                    onChange={(e) => setHasChildren(e.target.checked)}
                    className="w-4 h-4 rounded text-civic-600"
                  />
                  <span className="font-medium text-slate-700">Children under 18</span>
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasSeniors}
                    onChange={(e) => setHasSeniors(e.target.checked)}
                    className="w-4 h-4 rounded text-civic-600"
                  />
                  <span className="font-medium text-slate-700">Seniors (Age 60+)</span>
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isVeteran}
                    onChange={(e) => setIsVeteran(e.target.checked)}
                    className="w-4 h-4 rounded text-civic-600"
                  />
                  <span className="font-medium text-slate-700">Military Veteran</span>
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasDisability}
                    onChange={(e) => setHasDisability(e.target.checked)}
                    className="w-4 h-4 rounded text-civic-600"
                  />
                  <span className="font-medium text-slate-700">Person with Disability</span>
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasPastDueUtility}
                    onChange={(e) => setHasPastDueUtility(e.target.checked)}
                    className="w-4 h-4 rounded text-civic-600"
                  />
                  <span className="font-medium text-slate-700">Past-Due Utility Bill</span>
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasDisconnectNotice}
                    onChange={(e) => setHasDisconnectNotice(e.target.checked)}
                    className="w-4 h-4 rounded text-civic-600"
                  />
                  <span className="font-medium text-slate-700">Active Shutoff Notice</span>
                </label>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleBack}
                className="py-3 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-sm flex items-center justify-center gap-1.5 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={handleFinish}
                disabled={isSubmitting}
                className="flex-1 py-3 px-4 rounded-xl bg-civic-700 hover:bg-civic-800 disabled:bg-slate-300 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition"
              >
                {isSubmitting ? (
                  <span>Personalizing Portal...</span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Complete & Save My Personalized Profile</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Celebration / Personalized Matches */}
        {currentStep === 4 && (
          <div className="space-y-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h3 className="text-2xl font-extrabold text-slate-900">
                Welcome to Nevada Nexus, {fullName}!
              </h3>
              <p className="text-sm text-slate-600 mt-1 max-w-md mx-auto">
                Your profile is saved. All navigation, eligibility checks, and intake forms are now personalized for your household in zip code <span className="font-semibold text-slate-900">{zipCode}</span>.
              </p>
            </div>

            {/* Instant matches preview */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Instant Matches for Your Profile
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                  {qualifiedMatches.length} Programs Qualified
                </span>
              </div>

              <div className="space-y-2">
                {qualifiedMatches.slice(0, 3).map((match) => (
                  <div
                    key={match.programId}
                    className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-slate-900">{match.programName}</div>
                      <div className="text-[11px] text-slate-500">{match.actionRecommendation}</div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-civic-100 text-civic-800">
                      Match {match.score}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Next actions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  onCompleted ? onCompleted() : router.push('/chat');
                }}
                className="p-3 rounded-xl bg-civic-700 hover:bg-civic-800 text-white font-bold text-xs flex flex-col items-center justify-center gap-1 shadow-sm transition"
              >
                <span>Ask AI Navigator</span>
                <span className="text-[10px] text-civic-200 font-normal">Pre-loaded with your profile</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onCompleted ? onCompleted() : router.push('/intake');
                }}
                className="p-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex flex-col items-center justify-center gap-1 shadow-sm transition"
              >
                <span>Direct Electronic Intake</span>
                <span className="text-[10px] text-emerald-200 font-normal">Pre-filled application</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onCompleted ? onCompleted() : router.push('/eligibility');
                }}
                className="p-3 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-800 font-bold text-xs flex flex-col items-center justify-center gap-1 transition"
              >
                <span>View Full Eligibility</span>
                <span className="text-[10px] text-slate-500 font-normal">Rules engine details</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
