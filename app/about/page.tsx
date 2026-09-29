'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Compass,
  FileCheck2,
  Lock,
  AlertTriangle,
  Info,
  CheckCircle2,
  ExternalLink,
  Code2,
  Layers,
  Sparkles,
} from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 py-2">
      {/* Page Title */}
      <div className="border-b border-slate-200 pb-5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-civic-100 text-civic-800 text-xs font-semibold mb-2">
          <ShieldCheck className="w-3.5 h-3.5 text-civic-700" />
          <span>Congressional App Challenge 2026 Submission</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          AI Transparency, Governance & Architecture
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          How Nevada Nexus balances cutting-edge multimodal AI with strict civic accountability for North Las Vegas residents.
        </p>
      </div>

      {/* Core Principle Callout (PRD Section 2) */}
      <div className="p-5 rounded-2xl bg-civic-50 border border-civic-200 space-y-2">
        <h2 className="text-base font-bold text-civic-900 flex items-center gap-2">
          <Compass className="w-5 h-5 text-civic-700" />
          <span>Core Principle: AI as the Reasoning Layer, Not the Source of Truth</span>
        </h2>
        <p className="text-xs sm:text-sm text-civic-900/90 leading-relaxed">
          Nevada Nexus will <strong>never</strong> allow a large language model to independently invent organizations, phone numbers, addresses, application links, or eligibility criteria. All factual program and contact data originates strictly from verified database records. AI is employed exclusively to understand natural human language, extract structured needs, analyze document fields, and synthesize clear next steps.
        </p>
      </div>

      {/* AI Disclosure Required for CAC (PRD Section 53) */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Info className="w-5 h-5 text-civic-700" />
          <span>Official AI Disclosures</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-700">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="font-bold text-slate-900 block">1. Natural Language & Voice Intake</span>
            <p className="text-slate-600 leading-relaxed">
              AI translates and normalizes multilingual user speech (English, Spanish, Tagalog) into structured community need categories (e.g. utility assistance, food access).
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="font-bold text-slate-900 block">2. Multimodal Document Analysis</span>
            <p className="text-slate-600 leading-relaxed">
              Computer vision and OCR analyze uploaded utility bills to identify amounts due and due dates without storing raw user images permanently.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="font-bold text-slate-900 block">3. Retrieval-Augmented Generation</span>
            <p className="text-slate-600 leading-relaxed">
              Every recommendation is grounded in verified public community records (NV Energy Project REACH, Three Square Food Bank, DWSS LIHEAP).
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="font-bold text-slate-900 block">4. Non-Authoritative Eligibility</span>
            <p className="text-slate-600 leading-relaxed">
              AI evaluations indicate potential matches (&quot;This program may be a match...&quot;). Legally authoritative determinations are made solely by the official administering agencies.
            </p>
          </div>
        </div>
      </section>

      {/* Privacy Safeguards (PRD Section 14 & 37) */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Lock className="w-5 h-5 text-emerald-700" />
          <span>User Privacy & Zero-Retention Architecture</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Nevada Nexus is built for high-vulnerability civic assistance. We adhere to strict data-minimization practices:
        </p>
        <ul className="text-xs sm:text-sm text-slate-700 space-y-2 list-disc list-inside">
          <li>
            <strong>Anonymous Discovery:</strong> No account, sign-in, or registration is required to search resources, speak via voice, or generate a bridge plan.
          </li>
          <li>
            <strong>No Sensitive Data Collection:</strong> We never request Social Security numbers, immigration status, or bank account numbers.
          </li>
          <li>
            <strong>Transient Document Processing:</strong> Photographed utility bills are inspected in volatile memory and immediately discarded after key fields are extracted for user review.
          </li>
          <li>
            <strong>No Auto-Submissions:</strong> Nevada Nexus never automatically submits applications or impersonates applicants.
          </li>
        </ul>
      </section>

      {/* Multi-Agent Architecture Diagram (PRD Section 5 & 49) */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Layers className="w-5 h-5 text-civic-700" />
          <span>Multi-Agent System Architecture</span>
        </h2>

        <div className="p-4 rounded-xl bg-slate-900 text-slate-200 font-mono text-xs overflow-x-auto leading-relaxed">
          <pre>{`User (Voice / Text / Document)
  ↓
Multimodal Intake Agent (Language detection, Needs extraction, Urgency)
  ↓
Orchestrator Agent (Case State Machine: NEW → UNDERSTANDING → SEARCHING → PLAN_CREATED)
  ├── Resource Agent (PostgreSQL + pgvector hybrid retrieval)
  ├── Eligibility Agent (Non-authoritative criteria matching)
  ├── Document Agent (Vision extraction: provider, amount due, checklist)
  └── Verification Agent (Authoritative source audits & stale detection)
  ↓
Deterministic Action Plan ("My Nevada Nexus Bridge Plan")
  ↓
User UI (English • Español • Tagalog)`}</pre>
        </div>
      </section>

      {/* Primary Target Geography */}
      <section className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2 text-xs sm:text-sm text-amber-950">
        <h3 className="font-bold text-amber-900 text-base">Target Community: Nevada Congressional District 4</h3>
        <p>
          Focused on North Las Vegas and Southern Nevada communities, Nevada Nexus addresses real disparities in civic technology access by supporting multilingual residents, voice-first navigation, and verifiable local resources.
        </p>
      </section>
    </div>
  );
}
