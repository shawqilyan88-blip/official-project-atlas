import type { Metadata } from 'next';
import Link from 'next/link';

import { ArrowRightIcon, ShieldCheckIcon, UsersIcon } from '@/shared/ui/icons';

import { ROLE_DESCRIPTION, ROLE_LABEL, displayName } from '@/core/entities';
import { isSuccess } from '@/core/result';
import { createServerContainer } from '@/server/container';
import { requireTenantContext } from '@/server/session';
import { navigationGroups } from '@/shared/config/navigation';
import { routes } from '@/shared/config/routes';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  PageHeader,
} from '@/shared/ui';

export const metadata: Metadata = {
  title: 'Overview',
  description: 'Your Atlas workspace at a glance.',
};

export default async function DashboardPage() {
  const context = await requireTenantContext();

  const { tenancy } = await createServerContainer();
  const membersResult = await tenancy.listMembersOfOrganization(context.organization.id);
  const memberCount = isSuccess(membersResult) ? membersResult.value.length : null;

  const upcoming = navigationGroups
    .flatMap((group) => group.items)
    .filter((item) => !item.available);

  return (
    <>
      <PageHeader
        title={`Welcome back, ${firstName(displayName(context.profile))}`}
        description={`Here is where ${context.organization.name} stands today.`}
      />

      <section aria-label="Workspace summary" className="grid gap-4 sm:grid-cols-3">
        <SummaryCard
          label="Workspace"
          value={context.organization.name}
          detail={`atlas.app/${context.organization.slug}`}
        />
        <SummaryCard
          label="Your role"
          value={ROLE_LABEL[context.role]}
          detail={ROLE_DESCRIPTION[context.role]}
          icon={<ShieldCheckIcon className="size-4" aria-hidden="true" />}
        />
        <SummaryCard
          label="Members"
          value={memberCount === null ? '—' : String(memberCount)}
          detail={
            memberCount === 1
              ? 'Just you so far'
              : memberCount === null
                ? 'Could not load members'
                : 'People with access to this workspace'
          }
          icon={<UsersIcon className="size-4" aria-hidden="true" />}
        />
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Set up your workspace</CardTitle>
            <CardDescription>
              Two things worth doing before the trade modules arrive.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <NextStep
              title="Review your workspace details"
              description="Confirm the name and address your team will see."
              href={routes.settings}
              actionLabel="Open settings"
            />
            <NextStep
              title="Check who has access"
              description="Roles decide what each person can change."
              href={routes.settingsMembers}
              actionLabel="View members"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>What is coming next</CardTitle>
            <CardDescription>
              The modules that turn Atlas into a full trade operation.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {upcoming.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.href} className="flex items-start gap-3">
                    <span
                      className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground"
                      aria-hidden="true"
                    >
                      <Icon className="size-3.5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-2 text-sm font-medium">
                        {item.label}
                        <Badge tone="neutral" className="px-1.5 py-0 text-[0.625rem]">
                          Soon
                        </Badge>
                      </p>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      </section>
    </>
  );
}

function SummaryCard({
  label,
  value,
  detail,
  icon,
}: {
  label: string;
  value: string;
  detail: string;
  icon?: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="p-5 pt-5">
        <div className="flex items-center gap-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {icon}
          {label}
        </div>
        <p className="mt-2 truncate text-lg font-semibold" title={value}>
          {value}
        </p>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{detail}</p>
      </CardContent>
    </Card>
  );
}

function NextStep({
  title,
  description,
  href,
  actionLabel,
}: {
  title: string;
  description: string;
  href: string;
  actionLabel: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-border p-3">
      <div className="min-w-0">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
      </div>
      <Button variant="ghost" size="sm" asChild className="shrink-0">
        <Link href={href}>
          {actionLabel}
          <ArrowRightIcon aria-hidden="true" />
        </Link>
      </Button>
    </div>
  );
}

/** Greetings read better with a single name than a full one. */
function firstName(name: string): string {
  return name.split(/\s+/)[0] ?? name;
}
