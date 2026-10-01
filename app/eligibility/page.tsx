import React from 'react';
import EligibilityChecker from '@/components/eligibility/EligibilityChecker';

export const metadata = {
  title: 'Programmatic Eligibility Rules Engine | Nevada Nexus',
  description: 'Evaluate your household against statutory Nevada guidelines (FPL, AMI) to instantly find qualifying community assistance programs.',
};

export default function EligibilityPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <EligibilityChecker />
    </div>
  );
}
