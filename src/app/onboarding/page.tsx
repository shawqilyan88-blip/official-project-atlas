import type { Metadata } from 'next';

import { displayName } from '@/core/entities';
import { signOutAction } from '@/modules/auth/actions';
import { CreateOrganizationForm } from '@/modules/tenancy/ui/create-organization-form';
import { requireOnboardingCandidate } from '@/server/session';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Wordmark,
} from '@/shared/ui';

export const metadata: Metadata = {
  title: 'Create your workspace',
  description: 'Set up your Atlas workspace.',
};

/** Reads the session on every request; there is nothing here to prerender. */
export const dynamic = 'force-dynamic';

/**
 * Onboarding deliberately sits outside the `(app)` route group.
 *
 * The workspace shell cannot render before a workspace exists, and `(app)`'s
 * layout redirects here whenever one is missing — nesting this page inside that
 * group would produce a redirect loop. `requireOnboardingCandidate` enforces the
 * complementary rule: signed in, but not yet provisioned.
 */
export default async function OnboardingPage() {
  const profile = await requireOnboardingCandidate();

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-4 py-12">
      <div className="mb-8 flex justify-center">
        <Wordmark />
      </div>

      <Card elevated>
        <CardHeader>
          <CardTitle className="text-lg">Create your workspace</CardTitle>
          <CardDescription>
            Everything in Atlas — buyers, suppliers, conversations, deals — lives inside a
            workspace. You can invite your team once it exists.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <CreateOrganizationForm />
        </CardContent>
      </Card>

      <div className="mt-6 flex items-center justify-center gap-1 text-sm text-muted-foreground">
        <span>Signed in as {displayName(profile)}.</span>
        <form action={signOutAction}>
          <button
            type="submit"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}
