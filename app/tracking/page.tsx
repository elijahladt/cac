import React, { Suspense } from 'react';
import ReferralTrackingDashboard from '@/components/tracking/ReferralTrackingDashboard';

export const metadata = {
  title: 'Closed-Loop Referral Tracking | Nevada Nexus',
  description: 'Track your electronic assistance referral status, caseworker reviews, benefit pledge amounts, and waitlists in real-time.',
};

export default function TrackingPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <Suspense fallback={<div className="text-center py-12 text-slate-500 text-sm">Loading referral tracking...</div>}>
        <ReferralTrackingDashboard />
      </Suspense>
    </div>
  );
}
