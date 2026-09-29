# Nevada Nexus

**Multimodal AI Community Assistance Navigator**  
*Target: Congressional App Challenge 2026 • Nevada Congressional District 4 (North Las Vegas)*  
*Supported Languages: English (`en`), Spanish (`es`), Tagalog (`tl`)*

---

## 🏛️ Project Vision & Purpose

**Nevada Nexus** is a civic technology application engineered to help residents of North Las Vegas and Nevada's 4th Congressional District discover, understand, and act on verified local assistance programs for utilities, emergency food, housing, healthcare, jobs, and childcare.

Rather than acting as a generic chatbot, Nevada Nexus functions as an **agentic resource-navigation system** where **AI serves as the reasoning and orchestration layer, not the source of truth**.

### Key Capabilities
- 🗣️ **Multilingual Voice Intake:** Speak naturally in English, Spanish, or Tagalog with an interactive transcription confirmation workflow (*Continue*, *Edit*, *Try again*).
- 🔒 **Document Application Readiness:** Photograph or upload NV Energy utility statements to extract required fields (amount due, due date, account presence) with immediate transient deletion of raw images to safeguard user privacy.
- 🎯 **Deterministic Resource Scoring & "Why This Resource?":** Explanations are strictly grounded in verified database records (e.g. NV Energy Project REACH, Three Square Food Bank, DWSS LIHEAP).
- 📋 **Personalized Action Plans ("My Bridge Plan"):** Actionable, step-by-step checklists with required document lists, phone numbers, and official application links.
- 🗺️ **Geospatial Navigation:** Route time estimates (driving & walking) and one-click Google Maps turn-by-turn directions.
- 🛡️ **Deterministic Emergency Safeguard:** Immediate mental health (988), emergency (911), and crisis lines (Nevada 211) are hard-coded to prevent AI hallucinations during life safety situations.
- 🕵️ **Resource Verification & Admin Portal:** Auditing system that detects records older than 60 days and flags changes for human review in `/admin`.

---

## 🏗️ Multi-Agent Architecture

```
User (Voice / Text / Document)
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
User Interface (Next.js Responsive Web App & PWA)
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (tested on Node v20/v24)
- npm

### 1. Installation
```bash
git clone https://github.com/example/nevada-nexus.git
cd nevada-nexus
npm install
```

### 2. Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Configure your keys:
- `OPENAI_API_KEY`: (Optional for local testing; full deterministic fallback engine runs out-of-the-box without an API key).
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`: (Optional; seeded offline dataset is provided).
- `GOOGLE_MAPS_API_KEY`: (Optional; fallback Haversine distance engine is provided).

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing & Verification

Run the automated test suite covering all agents, deterministic emergency pathways, scoring algorithms, and end-to-end user workflows:
```bash
npm test
```

Run TypeScript strict verification:
```bash
npm run typecheck
```

Run ESLint:
```bash
npm run lint
```

Build for production:
```bash
npm run build
```

---

## 🏛️ Congressional App Challenge Compliance

- **AI Disclosure:** Detailed in `/about` adhering to Congressional App Challenge guidelines.
- **Privacy & Safety:** Zero permanent retention of user uploaded document images. All factual community resource data is verified against authoritative government and nonprofit publishers.
