import React from 'react';
import DirectIntakeForm from '@/components/intake/DirectIntakeForm';

export const metadata = {
  title: 'Direct Electronic Intake | Nevada Nexus',
  description: 'Submit a single secure electronic intake packet directly to multiple Nevada assistance provider queues.',
};

export default function IntakePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <DirectIntakeForm />
    </div>
  );
}
