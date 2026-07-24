import type { Metadata } from 'next';

import { SignInForm } from '@/modules/auth/ui/sign-in-form';
import { sanitiseRedirectPath } from '@/shared/config/routes';

export const metadata: Metadata = {
  title: 'Sign in',
  description: 'Sign in to your Atlas workspace.',
  // Auth screens carry no content worth indexing and should never rank.
  robots: { index: false, follow: false },
};

export default async function SignInPage({
  searchParams,
}: {
  // Async in Next.js 16 — request data is no longer available synchronously.
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const raw = params['redirectTo'];

  // Validated here as well as in the action: this value ends up in a hidden
  // field, and an unchecked absolute URL would make the form an open redirect.
  const redirectTo = sanitiseRedirectPath(typeof raw === 'string' ? raw : null);

  return (
    <div className="space-y-6">
      <div className="space-y-1.5 text-center">
        <h1 className="text-xl font-semibold tracking-tight">Welcome back</h1>
        <p className="text-sm text-muted-foreground">
          Sign in to continue to your workspace.
        </p>
      </div>

      <SignInForm {...(redirectTo !== null ? { redirectTo } : {})} />
    </div>
  );
}
