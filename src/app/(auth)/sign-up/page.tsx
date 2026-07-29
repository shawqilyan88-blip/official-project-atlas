import type { Metadata } from 'next';

import { SignUpForm } from '@/modules/auth/ui/sign-up-form';

export const metadata: Metadata = {
  title: 'Create your account',
  description: 'Find buyers and suppliers, and grow your international trade with Atlas.',
  robots: { index: false, follow: false },
};

export default function SignUpPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1.5 text-center">
        <h1 className="text-xl font-semibold tracking-tight">Create your account</h1>
        <p className="text-sm text-muted-foreground">
          Start finding buyers and suppliers and building your global trade network — set
          up in under a minute.
        </p>
      </div>

      <SignUpForm />
    </div>
  );
}
