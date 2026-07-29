import type { Metadata } from 'next';
import Link from 'next/link';

import { isSuccess } from '@/core/result';
import type { TradeOpportunity } from '@/modules/trade-opportunity/domain/trade-opportunity';
import { createServerContainer } from '@/server/container';
import { requireTenantContext } from '@/server/session';
import { routes } from '@/shared/config/routes';
import { Button, cn } from '@/shared/ui';
import { ArrowRightIcon, PlusIcon, SparklesIcon, TargetIcon } from '@/shared/ui/icons';

import {
  OpportunityCard,
  type OpportunityCardData,
} from './_components/opportunity-card';

export const metadata: Metadata = {
  title: 'Trade Opportunities',
  description: 'Your reusable buyer and supplier searches.',
};

export const dynamic = 'force-dynamic';

/**
 * The Trade Opportunities library.
 *
 * The home of the company's trade projects — reusable searches it returns to
 * rather than re-creating. Everything a user built before is here to open,
 * duplicate, archive, or resume; nothing has to be entered twice.
 */
export default async function OpportunitiesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const context = await requireTenantContext();
  const params = await searchParams;
  const showArchived = params['view'] === 'archived';

  const { tradeOpportunities } = await createServerContainer();
  const result = await tradeOpportunities.list(context.organization.id);
  const all = isSuccess(result) ? result.value : [];

  const open = all.filter((opportunity) => opportunity.status !== 'archived');
  const archived = all.filter((opportunity) => opportunity.status === 'archived');
  const shown = (showArchived ? archived : open).map(toCardData);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Trade Opportunities</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Reusable buyer and supplier searches, built on your company profile.
          </p>
        </div>
        <Button asChild className="shrink-0">
          <Link href={routes.opportunityNew}>
            <PlusIcon aria-hidden="true" />
            New opportunity
          </Link>
        </Button>
      </header>

      <div className="flex items-center gap-1 border-b border-border/60">
        <Tab
          href={routes.opportunities}
          active={!showArchived}
          label="Open"
          count={open.length}
        />
        <Tab
          href={`${routes.opportunities}?view=archived`}
          active={showArchived}
          label="Archived"
          count={archived.length}
        />
      </div>

      {shown.length === 0 ? (
        showArchived ? (
          <EmptyArchived />
        ) : (
          <EmptyLibrary />
        )
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((opportunity) => (
            <li key={opportunity.id}>
              <OpportunityCard opportunity={opportunity} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Tab({
  href,
  active,
  label,
  count,
}: {
  href: string;
  active: boolean;
  label: string;
  count: number;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={cn(
        '-mb-px flex items-center gap-2 border-b-2 px-3 py-2 text-sm font-medium transition-colors',
        active
          ? 'border-primary text-foreground'
          : 'border-transparent text-muted-foreground hover:text-foreground',
      )}
    >
      {label}
      <span className="rounded-full bg-muted/60 px-1.5 text-[0.6875rem] text-muted-foreground tabular-nums">
        {count}
      </span>
    </Link>
  );
}

const EXAMPLES = [
  'Green Edamame → EU buyers',
  'Frozen Mango → UAE',
  'Packaging manufacturer search',
  'Coconut water → Germany',
];

function EmptyLibrary() {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card/50 px-6 py-12 text-center">
      <span
        className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary"
        aria-hidden="true"
      >
        <TargetIcon className="size-6" />
      </span>
      <h2 className="text-base font-semibold">Create your first Trade Opportunity</h2>
      <p className="mx-auto mt-1.5 max-w-md text-sm leading-relaxed text-muted-foreground">
        An opportunity is one reusable search — a product, a direction, a market. Atlas
        pre-fills it from your company profile, so you only add what is specific to this
        pursuit, and you never start from scratch again.
      </p>

      <ul className="mx-auto mt-5 flex max-w-md flex-wrap justify-center gap-2">
        {EXAMPLES.map((example) => (
          <li
            key={example}
            className="rounded-full border border-border/60 bg-muted/30 px-2.5 py-1 text-xs text-muted-foreground"
          >
            {example}
          </li>
        ))}
      </ul>

      <Button asChild className="mt-6">
        <Link href={routes.opportunityNew}>
          <SparklesIcon aria-hidden="true" />
          New opportunity
          <ArrowRightIcon aria-hidden="true" />
        </Link>
      </Button>
    </div>
  );
}

function EmptyArchived() {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card/50 px-6 py-12 text-center">
      <p className="text-sm text-muted-foreground">
        Nothing archived. Opportunities you archive will rest here, ready to restore.
      </p>
    </div>
  );
}

function toCardData(opportunity: TradeOpportunity): OpportunityCardData {
  return {
    id: opportunity.id,
    name: opportunity.name,
    objective: opportunity.objective,
    product: opportunity.product,
    category: opportunity.category,
    targetMarkets: opportunity.targetMarkets,
    status: opportunity.status,
    updatedLabel: `Updated ${formatDate(opportunity.updatedAt)}`,
  };
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  }).format(new Date(iso));
}
