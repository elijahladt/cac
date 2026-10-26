import type { Metadata } from 'next';
import { LoginForm } from '@/components/auth/LoginForm';

export const metadata: Metadata = {
  title: 'Sign In | Nevada Nexus',
  description: 'Sign in to access your personalized community assistance matches and intake dashboard.',
};

export default function LoginPage() {
  return (
    <div className="py-6 sm:py-12">
      <LoginForm />
    </div>
  );
}
