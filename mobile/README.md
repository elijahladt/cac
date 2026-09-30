# Nevada Nexus — Mobile (Expo / React Native)

**Multimodal AI Community Assistance Navigator**  
*Target: Congressional App Challenge 2026 • Nevada's 4th Congressional District*

---

## Overview

The `mobile/` directory contains the cross-platform **Expo (React Native)** application for **Nevada Nexus**, supporting iOS, Android, and Web. It connects seamlessly to the Next.js backend and includes full local offline fallback support.

---

## Core Mobile Capabilities

1. **Multimodal AI Assistant & Voice Input**:
   - Conversational intake for English, Spanish, and Tagalog.
   - One-tap voice sample prompts in all three languages.
   - Inline verified community resource recommendation cards.
   - Dynamic step-by-step action plan generation.
2. **Authoritative NV-04 Verified Resource Directory**:
   - Filter by categories: Utility & Power, Food, Housing & Rent, Medical & Clinic, Jobs, Transit, Childcare.
   - Direct telephone dialing (`tel:`) and Google Maps directions navigation.
   - Detailed eligibility criteria and required documents checklist modal.
3. **Document Scanner & Vision Analysis**:
   - Integrated camera & photo library picker (`expo-image-picker`).
   - Ephemeral analysis extracting provider, amount due, and notice dates.
   - Program matching (NV Energy Project REACH, DWSS LIHEAP).
   - Strict privacy guarantee (zero persistent storage without user consent).
4. **Interactive My Case File Tracker**:
   - Step checklist with checkboxes and progress bar.
   - Required document requirements by step.
5. **Immediate Crisis / Life Safety Support (911 / 988 / 2-1-1)**:
   - Persistent red SOS button accessible from any screen.
   - Instant direct dial for 911, 988 Lifeline, 2-1-1 Nevada, Safe Nest Domestic Violence, and Clark County DFS.

---

## How to Run

### 1. Start the Next.js API Backend (Optional but recommended)
In the root directory:
```bash
npm run dev
```
*(Runs at `http://localhost:3000`)*

### 2. Start the Expo Mobile App
In the `mobile/` directory:
```bash
cd mobile
npm start
```

### 3. Choose Your Target
- **Web Browser**: Press `w` or run `npm run web`
- **Android Device / Emulator**: Press `a` or run `npm run android`
- **iOS Simulator / Expo Go**: Press `i` or scan the QR code with Expo Go on your iPhone
