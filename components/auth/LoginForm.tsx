'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
  AlertTriangle,
  UserCheck,
  Zap,
  Users,
  Compass,
} from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { DEMO_PROFILES } from '@/lib/auth/demoProfiles';

export function LoginForm() {
  const router = useRouter();
  const { login, loginAsDemo } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await login(email, password);
      if (!res.success) {
        setError(res.error || 'Failed to sign in.');
      } else {
        router.push('/');
      }
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSelect = (demoId: string) => {
    loginAsDemo(demoId);
    router.push('/');
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden max-w-lg mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-civic-900 via-civic-800 to-slate-900 text-white p-6 sm:p-8 text-center">
        <div className="w-12 h-12 rounded-2xl bg-civic-700 text-white flex items-center justify-center mx-auto mb-3 shadow-md shadow-civic-950/40">
          <Compass className="w-7 h-7" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Welcome to Nevada Nexus
        </h2>
        <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-sm mx-auto">
          Sign in to access your personalized eligibility matches, auto-filled direct intakes, and saved referrals.
        </p>
      </div>

      <div className="p-6 sm:p-8 space-y-6">
        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* 1-Click Demo Profiles for instant testing */}
        <div className="bg-civic-50/70 border border-civic-200/80 rounded-2xl p-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-civic-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              1-Click Instant Demo Login
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-900">
              NV-04 Residents
            </span>
          </div>
          <p className="text-[11px] text-slate-600">
            Select a representative North Las Vegas profile to experience personalized matches immediately:
          </p>

          <div className="grid grid-cols-1 gap-2 pt-1">
            {DEMO_PROFILES.map((demo) => (
              <button
                key={demo.id}
                type="button"
                onClick={() => handleDemoSelect(demo.id)}
                className="p-2.5 rounded-xl bg-white hover:bg-civic-100/50 border border-slate-200 text-left transition flex items-center justify-between group shadow-2xs"
              >
                <div>
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <span>{demo.name}</span>
                    <span className="text-[10px] font-normal text-slate-500">({demo.profile.zipCode})</span>
                  </div>
                  <div className="text-[11px] text-slate-500 leading-tight mt-0.5">
                    {demo.tagline}
                  </div>
                </div>
                <UserCheck className="w-4 h-4 text-civic-600 group-hover:scale-110 transition flex-shrink-0 ml-2" />
              </button>
            ))}
          </div>
        </div>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-200 w-full" />
          <span className="bg-white px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider absolute">
            Or sign in with email
          </span>
        </div>

        {/* Standard Email Login */}
        <form onSubmit={handleSubmit} className="space-y-4">
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
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-civic-600 focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Password
              </label>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-civic-600 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-civic-700 hover:bg-civic-800 disabled:bg-slate-300 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition mt-2"
          >
            {loading ? <span>Signing in...</span> : <span>Sign In to Nevada Nexus</span>}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Sign up prompt */}
        <div className="text-center pt-2 border-t border-slate-100">
          <p className="text-xs text-slate-600">
            Don&apos;t have an account yet?{' '}
            <Link
              href="/signup"
              className="font-bold text-civic-700 hover:text-civic-800 underline underline-offset-2"
            >
              Sign up &amp; answer a few questions to personalize
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
