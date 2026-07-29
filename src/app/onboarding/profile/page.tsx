import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { isSuccess } from '@/core/result';
import { skipTradeProfileAction } from '@/modules/trade-profile/actions';
import { tradeProfileStatus } from '@/modules/trade-profile/domain/trade-profile';
import { createServerContainer } from '@/server/container';
import { requireTenantContext } from '@/server/session';
import { routes } from '@/shared/config/routes';
import { Button, Wordmark } from '@/shared/ui';

import { ProfileWizard } from './_components/profile-wizard';

export const metadata: Metadata = {
  title: 'Build your Company Profile',
  description:
    'Teach Atlas about your business so it can find the right buyers and suppliers.',
};

/** Reads the session and the profile on every request; nothing to prerender. */
export const dynamic = 'force-dynamic';

/**
 * The Trade Profile onboarding.
 *
 * It sits between having a workspace and using the dashboard in earnest: a
 * user with a workspace but no profile is guided here, and can always defer.
 * A finished profile is sent on to the dashboard — this screen is for building
 * one, not re-reading it.
 */
export default async function TradeProfileOnboardingPage() {
  const context = await requireTenantContext();
  const { tradeProfile } = await createServerContainer();

  const profileResult = await tradeProfile.findByOrganization(context.organization.id);
  const profile = isSuccess(profileResult) ? profileResult.value : null;
  if (profile && tradeProfileStatus(profile) === 'complete') {
    redirect(routes.dashboard);
  }

  return (
    <div className="relative flex min-h-dvh flex-col">
      {/* A restrained wash of brand colour so the screen is not a blank sheet. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-gradient-to-b from-primary/[0.08] to-transparent"
      />

      <header className="relative flex h-16 shrink-0 items-center justify-between px-5 sm:px-8">
        <Link
          href={routes.dashboard}
          className="rounded-md focus-visible:outline-none"
          aria-label="Atlas home"
        >
          <Wordmark />
        </Link>

        <form action={skipTradeProfileAction}>
          <Button
            type="submit"
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
          >
            Skip for now
          </Button>
        </form>
      </header>

      <main className="relative flex flex-1 items-center justify-center px-5 py-10 sm:px-8">
        <ProfileWizard />
      </main>
    </div>
  );
}
