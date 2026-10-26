import type { Metadata } from 'next';
import { PersonalizationWizard } from '@/components/auth/PersonalizationWizard';

export const metadata: Metadata = {
  title: 'Sign Up & Personalize | Nevada Nexus',
  description: 'Create an account and personalize your assistance matches for North Las Vegas and NV-04.',
};

export default function SignupPage() {
  return (
    <div className="py-6 sm:py-12">
      <PersonalizationWizard mode="signup" />
    </div>
  );
}
