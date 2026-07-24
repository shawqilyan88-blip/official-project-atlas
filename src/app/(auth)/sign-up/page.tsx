import type { Metadata } from 'next';

import { SignUpForm } from '@/modules/auth/ui/sign-up-form';

export const metadata: Metadata = {
  title: 'Create your account',
  description: 'Start using Atlas.',
  robots: { index: false, follow: false },
};

export default function SignUpPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1.5 text-center">
        <h1 className="text-xl font-semibold tracking-tight">Create your account</h1>
        <p className="text-sm text-muted-foreground">
          Set up your workspace in under a minute.
        </p>
      </div>

      <SignUpForm />
    </div>
  );
}
