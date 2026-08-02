import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { isSuccess } from '@/core/result';
import { resolveBusinessPulse } from '@/modules/dashboard/application/resolve-business-pulse';
import { resolveDashboardView } from '@/modules/dashboard/application/resolve-dashboard-view';
import {
  needsTradeProfileOnboarding,
  shouldRemindAboutProfile,
} from '@/modules/trade-profile/domain/trade-profile';
import { createServerContainer } from '@/server/container';
import { requireTenantContext } from '@/server/session';
import { routes } from '@/shared/config/routes';
import { Button } from '@/shared/ui';
import { PlusIcon } from '@/shared/ui/icons';

import { AboutYouCard } from './_components/about-you-card';
import { AtlasToday } from './_components/atlas-today';
import { BusinessPulse } from './_components/business-pulse';
import { CommandCenter } from './_components/command-center';
import { GreetingHeader } from './_components/greeting-header';
import { type JourneyStep, ProgressJourney } from './_components/progress-journey';
import { TodaysBriefing } from './_components/todays-briefing';

export const metadata: Metadata = {
  title: 'Command Center',
  description: 'Direct Atlas and see what it is working on.',
};

/**
 * The dashboard — Atlas as an employee you direct, not a report you read.
 *
 * The composition is deliberate, top to bottom: a greeting in Atlas's voice, the
 * command bar it takes direction from, then the answer to the one question the
 * screen exists for — what has Atlas done today. Nothing here is a generic
 * metric tile; every surface either takes an instruction or teaches what Atlas
 * will do. Dark is the primary experience, but every colour is a token, so it
 * holds in light too.
 */
export default async function DashboardPage() {
  const context = await requireTenantContext();
  const { tenancy, personalization, tradeProfile, tradeOpportunities } =
    await createServerContainer();

  const [personalizationSnapshot, membersResult, profileResult, opportunitiesResult] =
    await Promise.all([
      personalization.read(),
      tenancy.listMembersOfOrganization(context.organization.id),
      tradeProfile.findByOrganization(context.organization.id),
      tradeOpportunities.list(context.organization.id),
    ]);

  const profile = isSuccess(profileResult) ? profileResult.value : null;
  const opportunityCount = isSuccess(opportunitiesResult)
    ? opportunitiesResult.value.length
    : 0;

  // A brand-new workspace is guided to build its Trade Profile first. Once it is
  // completed or explicitly deferred, the dashboard opens and the reminder takes
  // over. A failed read (e.g. before the migration is applied) is not treated as
  // "empty" here, so a database hiccup never traps the user in a redirect.
  if (isSuccess(profileResult) && needsTradeProfileOnboarding(profile)) {
    redirect(routes.onboardingProfile);
  }

  const memberCount = isSuccess(membersResult) ? membersResult.value.length : 1;

  const profileComplete = !shouldRemindAboutProfile(profile);
  const hasOpportunity = opportunityCount > 0;

  const view = resolveDashboardView({
    context,
    personalization: personalizationSnapshot,
    memberCount,
    profileComplete,
    hasOpportunity,
    now: new Date(),
  });

  const metrics = resolveBusinessPulse();

  const journeySteps: JourneyStep[] = [
    { label: 'Workspace created', state: 'done' },
    { label: 'Email verified', state: 'done' },
    {
      label: 'Company Profile',
      state: profileComplete ? 'done' : 'current',
      hint: 'Teach Atlas about your business to sharpen every match.',
      href: routes.onboardingProfile,
    },
    {
      label: 'First Trade Opportunity',
      state: hasOpportunity ? 'done' : profileComplete ? 'current' : 'todo',
      hint: 'Create a reusable buyer or supplier search.',
      href: routes.opportunityNew,
    },
    { label: 'First buyer / supplier discovery', state: 'soon' },
    {
      label: 'Atlas ready',
      state: profileComplete && hasOpportunity ? 'done' : 'todo',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <GreetingHeader
          greeting={view.greeting}
          timezone={personalizationSnapshot.timezone}
        />

        {/* The platform's primary action, where the eye lands first. */}
        <Button
          asChild
          size="lg"
          className="shrink-0 shadow-lg shadow-primary/25 sm:mt-1"
        >
          <Link href={routes.opportunityNew}>
            <PlusIcon aria-hidden="true" />
            New Trade Opportunity
          </Link>
        </Button>
      </div>

      <CommandCenter firstName={view.firstName} />

      <BusinessPulse metrics={metrics} />

      <TodaysBriefing briefing={view.briefing} />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <AtlasToday />
        </div>

        <div className="flex flex-col gap-4">
          <ProgressJourney steps={journeySteps} />
          <AboutYouCard personalization={personalizationSnapshot} profile={profile} />
        </div>
      </div>
    </div>
  );
}
