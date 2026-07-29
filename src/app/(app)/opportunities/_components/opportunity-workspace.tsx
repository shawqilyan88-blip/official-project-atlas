'use client';

import Link from 'next/link';
import { type ReactNode, useState } from 'react';

import type {
  OpportunityDocument,
  OpportunityTimelineEvent,
} from '@/modules/trade-opportunity/domain/opportunity-document';
import type {
  OpportunityIntelligence,
  OpportunityQuality,
} from '@/modules/trade-opportunity/domain/opportunity-intelligence';
import {
  OBJECTIVE_LABEL,
  STATUS_LABEL,
  type TradeObjective,
  type TradeOpportunity,
} from '@/modules/trade-opportunity/domain/trade-opportunity';
import { routes } from '@/shared/config/routes';
import { Button, cn } from '@/shared/ui';

import { DocumentIntelligence } from './document-intelligence';
import { DocumentList } from './document-list';
import {
  ArrowLeftIcon,
  BriefcaseIcon,
  ClockIcon,
  FileTextIcon,
  LayoutDashboardIcon,
  type LucideIcon,
  MessagesSquareIcon,
  PencilIcon,
  SparklesIcon,
  UsersIcon,
} from '@/shared/ui/icons';

/**
 * The Trade Opportunity workspace — every opportunity is its own operating space.
 *
 * Seven tabs mirror the object's lifecycle: the brief and plan (Overview), the
 * buyers and suppliers Atlas surfaces (Companies), source documents, AI analysis,
 * message threads, a growing timeline, and deals. Discovery and outreach are not
 * live yet, so each result surface is an honest, empty seam — never fabricated
 * data — but the architecture is complete: the day those engines ship, their
 * output flows straight into these tabs with no re-entry.
 */
type TabId =
  | 'overview'
  | 'companies'
  | 'documents'
  | 'analysis'
  | 'conversations'
  | 'timeline'
  | 'deals';

interface Tab {
  readonly id: TabId;
  readonly label: string;
  readonly icon: LucideIcon;
}

const TABS: readonly Tab[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboardIcon },
  { id: 'companies', label: 'Companies', icon: UsersIcon },
  { id: 'documents', label: 'Documents', icon: FileTextIcon },
  { id: 'analysis', label: 'AI Analysis', icon: SparklesIcon },
  { id: 'conversations', label: 'Conversations', icon: MessagesSquareIcon },
  { id: 'timeline', label: 'Timeline', icon: ClockIcon },
  { id: 'deals', label: 'Deals', icon: BriefcaseIcon },
];

export function OpportunityWorkspace({
  opportunity,
  intelligence,
  documents,
  timeline,
}: {
  readonly opportunity: TradeOpportunity;
  readonly intelligence: OpportunityIntelligence;
  readonly documents: readonly OpportunityDocument[];
  readonly timeline: readonly OpportunityTimelineEvent[];
}) {
  const [active, setActive] = useState<TabId>('overview');
  const editHref = `${routes.opportunities}/${opportunity.id}/edit`;

  return (
    <div className="space-y-6">
      <Link
        href={routes.opportunities}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeftIcon className="size-4" aria-hidden="true" />
        Opportunities
      </Link>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="mb-1.5 flex items-center gap-2">
            <StatusBadge status={opportunity.status} />
            <span className="text-xs text-muted-foreground">
              {OBJECTIVE_LABEL[opportunity.objective]}
            </span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-balance">
            {opportunity.name}
          </h1>
        </div>
        <Button asChild variant="outline" className="shrink-0">
          <Link href={`${routes.opportunities}/${opportunity.id}/edit`}>
            <PencilIcon aria-hidden="true" />
            Edit brief
          </Link>
        </Button>
      </div>

      {/* Tab bar — scrolls horizontally on narrow screens rather than wrapping. */}
      <div
        role="tablist"
        aria-label="Opportunity sections"
        className="flex gap-1 overflow-x-auto border-b border-border/70 pb-px"
      >
        {TABS.map((tab) => {
          const selected = tab.id === active;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              role="tab"
              type="button"
              aria-selected={selected}
              onClick={() => setActive(tab.id)}
              className={cn(
                'relative flex shrink-0 items-center gap-1.5 rounded-t-lg px-3 py-2 text-sm font-medium transition-colors',
                'focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
                selected
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <Icon className="size-4" aria-hidden="true" />
              {tab.label}
              {selected && (
                <span
                  aria-hidden="true"
                  className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-primary"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Panels. `key` on the wrapper replays the entrance animation per tab. */}
      <div key={active} className="animate-rise">
        {active === 'overview' && (
          <OverviewPanel opportunity={opportunity} quality={intelligence.quality} />
        )}
        {active === 'companies' && <CompaniesPanel objective={opportunity.objective} />}
        {active === 'documents' && (
          <DocumentsPanel opportunityId={opportunity.id} documents={documents} />
        )}
        {active === 'analysis' && (
          <AnalysisPanel intelligence={intelligence} editHref={editHref} />
        )}
        {active === 'conversations' && <ConversationsPanel />}
        {active === 'timeline' && (
          <TimelinePanel opportunity={opportunity} events={timeline} />
        )}
        {active === 'deals' && <DealsPanel />}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Overview — the brief and the plan Atlas will run.
// ---------------------------------------------------------------------------

function OverviewPanel({
  opportunity,
  quality,
}: {
  opportunity: TradeOpportunity;
  quality: OpportunityQuality;
}) {
  const briefChips = [
    opportunity.product,
    opportunity.category,
    ...opportunity.targetMarkets.slice(0, 4),
  ].filter((value): value is string => Boolean(value));

  return (
    <div className="space-y-4">
      <QualityMeter quality={quality} compact />
      <section className="relative overflow-hidden rounded-3xl border border-primary/15 bg-gradient-to-br from-primary/[0.09] via-card to-card p-6 sm:p-7">
        <div
          aria-hidden="true"
          className="animate-breathe pointer-events-none absolute -top-24 -right-16 size-64 rounded-full bg-primary/20 blur-3xl"
        />
        <div className="relative">
          <div className="mb-4 flex items-center gap-3">
            <span className="relative flex size-9 items-center justify-center">
              <span
                aria-hidden="true"
                className="animate-orbit absolute inset-0 rounded-full border border-dashed border-primary/40"
              />
              <span className="animate-breathe flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <SparklesIcon className="size-4" aria-hidden="true" />
              </span>
            </span>
            <div>
              <p className="text-sm font-semibold">Atlas is preparing this search</p>
              <p className="text-xs text-muted-foreground">
                {searchDescription(opportunity.objective, opportunity.targetMarkets)}
              </p>
            </div>
          </div>

          {briefChips.length > 0 && (
            <ul className="mb-5 flex flex-wrap gap-1.5">
              {briefChips.map((chip) => (
                <li
                  key={chip}
                  className="rounded-full border border-border/70 bg-background/60 px-2.5 py-0.5 text-xs text-muted-foreground"
                >
                  {chip}
                </li>
              ))}
            </ul>
          )}

          <ol className="space-y-2.5">
            {planFor(opportunity.objective).map((step, index) => (
              <li key={step} className="flex items-start gap-3">
                <span
                  className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 font-mono text-[0.625rem] text-primary"
                  aria-hidden="true"
                >
                  {index + 1}
                </span>
                <span className="text-[0.8125rem] leading-relaxed text-muted-foreground">
                  {step}
                </span>
              </li>
            ))}
          </ol>

          <p className="mt-5 rounded-xl border border-dashed border-primary/30 bg-primary/[0.04] px-3.5 py-2.5 text-xs leading-relaxed text-muted-foreground">
            Live discovery activates in an upcoming release. When it does, buyers and
            suppliers appear under Companies automatically — no re-entry.
          </p>
        </div>
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Result surfaces — honest, empty seams until their engines ship.
// ---------------------------------------------------------------------------

function CompaniesPanel({ objective }: { objective: TradeObjective }) {
  const who =
    objective === 'find_suppliers'
      ? 'suppliers'
      : objective === 'both'
        ? 'buyers and suppliers'
        : 'buyers';
  return (
    <EmptyPanel
      icon={UsersIcon}
      title="No companies yet"
      body={`Atlas will surface qualified ${who} for this opportunity, ranked by fit and trade signals. They appear here the moment discovery activates.`}
      badge="Discovery activating soon"
    />
  );
}

function DocumentsPanel({
  opportunityId,
  documents,
}: {
  opportunityId: string;
  documents: readonly OpportunityDocument[];
}) {
  return (
    <div className="space-y-6">
      <div>
        <div className="mb-3 flex items-start gap-3">
          <span
            className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"
            aria-hidden="true"
          >
            <FileTextIcon className="size-4" />
          </span>
          <div>
            <h2 className="text-sm font-semibold">Documents</h2>
            <p className="text-xs text-muted-foreground">
              Attach LOIs, RFQs, POs, specs, or catalogs. Upload, rename, replace, and
              keep a version history — all stored with this opportunity.
            </p>
          </div>
        </div>
        <DocumentList opportunityId={opportunityId} documents={documents} />
      </div>

      <div className="border-t border-border/60 pt-6">
        <div className="mb-3 flex items-start gap-3">
          <span
            className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"
            aria-hidden="true"
          >
            <SparklesIcon className="size-4" />
          </span>
          <div>
            <h2 className="text-sm font-semibold">Analyze with Atlas</h2>
            <p className="text-xs text-muted-foreground">
              Read a document and apply what Atlas understands to this opportunity.
            </p>
          </div>
        </div>
        <DocumentIntelligence opportunityId={opportunityId} />
      </div>
    </div>
  );
}

function AnalysisPanel({
  intelligence,
  editHref,
}: {
  intelligence: OpportunityIntelligence;
  editHref: string;
}) {
  const { summary, quality, suggestions } = intelligence;
  const sections: { label: string; values: readonly string[] }[] = [
    { label: 'Products', values: summary.products },
    { label: 'Countries', values: summary.countries },
    { label: 'Volume & price', values: summary.volume },
    { label: 'Requirements', values: summary.requirements },
  ];

  return (
    <div className="space-y-4">
      {/* AI Summary header + honest framing. */}
      <section className="rounded-2xl border border-border/70 bg-card p-5 sm:p-6">
        <div className="mb-4 flex items-start gap-3">
          <span
            className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"
            aria-hidden="true"
          >
            <SparklesIcon className="size-4" />
          </span>
          <div>
            <h2 className="text-sm font-semibold">Here&rsquo;s what Atlas understands</h2>
            <p className="text-xs text-muted-foreground">
              Built from what you&rsquo;ve entered. Automatic extraction from uploaded
              documents is coming soon — nothing here is guessed.
            </p>
          </div>
        </div>

        <dl className="grid gap-3 sm:grid-cols-2">
          {sections.map((section) => (
            <div
              key={section.label}
              className="rounded-xl border border-border/60 bg-background/40 p-3.5"
            >
              <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                {section.label}
              </dt>
              <dd className="mt-1.5">
                {section.values.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {section.values.map((value) => (
                      <span
                        key={value}
                        className="rounded-full border border-border/70 bg-card px-2 py-0.5 text-xs text-foreground/90"
                      >
                        {value}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground/70">
                    Not specified yet
                  </span>
                )}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Opportunity quality + what's missing. */}
      <section className="rounded-2xl border border-border/70 bg-card p-5 sm:p-6">
        <QualityMeter quality={quality} />
        {quality.missing.length > 0 && (
          <div className="mt-4 border-t border-border/60 pt-4">
            <p className="mb-2.5 text-xs font-medium text-foreground/80">
              Add these to sharpen the search
            </p>
            <ul className="space-y-2">
              {quality.missing.slice(0, 6).map((field) => (
                <li key={field.label} className="flex items-start gap-2.5">
                  <span
                    className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary/50"
                    aria-hidden="true"
                  />
                  <span className="text-[0.8125rem] leading-relaxed">
                    <span className="font-medium">{field.label}</span>
                    <span className="text-muted-foreground"> — {field.why}</span>
                  </span>
                </li>
              ))}
            </ul>
            <Button asChild variant="outline" size="sm" className="mt-4">
              <Link href={editHref}>
                <PencilIcon aria-hidden="true" />
                Complete the brief
              </Link>
            </Button>
          </div>
        )}
      </section>

      {/* AI memory: preferences learned from past opportunities. */}
      {suggestions.length > 0 && (
        <section className="rounded-2xl border border-primary/20 bg-primary/[0.04] p-5 sm:p-6">
          <div className="mb-3 flex items-center gap-2">
            <SparklesIcon className="size-4 text-primary" aria-hidden="true" />
            <h2 className="text-sm font-semibold">From your other opportunities</h2>
          </div>
          <ul className="space-y-3">
            {suggestions.map((s) => (
              <li key={s.dimension}>
                <p className="text-[0.8125rem] text-muted-foreground">{s.note}</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {s.values.map((value) => (
                    <span
                      key={value}
                      className="rounded-full border border-primary/30 bg-background/60 px-2.5 py-0.5 text-xs font-medium text-foreground/90"
                    >
                      {value}
                    </span>
                  ))}
                </div>
              </li>
            ))}
          </ul>
          <Button asChild variant="outline" size="sm" className="mt-4">
            <Link href={editHref}>
              <PencilIcon aria-hidden="true" />
              Apply in the brief
            </Link>
          </Button>
        </section>
      )}
    </div>
  );
}

function QualityMeter({
  quality,
  compact = false,
}: {
  quality: OpportunityQuality;
  compact?: boolean;
}) {
  const tierLabel =
    quality.tier === 'excellent'
      ? 'Excellent'
      : quality.tier === 'strong'
        ? 'Strong'
        : quality.tier === 'developing'
          ? 'Developing'
          : 'Forming';

  return (
    <div
      className={cn(
        compact &&
          'rounded-2xl border border-border/70 bg-card/80 p-4 shadow-sm backdrop-blur-sm',
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium">Opportunity quality</span>
        <span className="text-sm font-semibold text-muted-foreground tabular-nums">
          {quality.score}% · {tierLabel}
        </span>
      </div>
      <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            'h-full rounded-full transition-[width] duration-[--duration-slow] ease-[--ease-out-quart]',
            quality.tier === 'excellent' ? 'bg-success' : 'bg-primary',
          )}
          style={{ width: `${Math.max(quality.score, 3)}%` }}
        />
      </div>
      <p className="mt-2.5 text-[0.8125rem] leading-relaxed text-muted-foreground">
        {quality.headline}
      </p>
    </div>
  );
}

function ConversationsPanel() {
  return (
    <EmptyPanel
      icon={MessagesSquareIcon}
      title="No conversations yet"
      body="Every thread with buyers and suppliers on this opportunity lands here — one place for outreach, replies, and follow-ups, with nothing sent without your approval."
      badge="Outreach activating soon"
    />
  );
}

function DealsPanel() {
  return (
    <EmptyPanel
      icon={BriefcaseIcon}
      title="No deals yet"
      body="As conversations advance to quote, sample, negotiation, and contract, Atlas tracks each deal here with its stage, value, and expected close."
      badge="Deal tracking activating soon"
    />
  );
}

// ---------------------------------------------------------------------------
// Timeline — the one real, growing record.
// ---------------------------------------------------------------------------

function TimelinePanel({
  opportunity,
  events,
}: {
  opportunity: TradeOpportunity;
  events: readonly OpportunityTimelineEvent[];
}) {
  // Repo returns newest-first; render the record oldest → newest.
  const chronological = [...events].reverse();

  return (
    <section className="rounded-2xl border border-border/70 bg-card p-5 sm:p-6">
      <h2 className="mb-4 text-sm font-semibold">Timeline</h2>
      <ol className="space-y-4">
        <TimelineRow
          done
          title="Opportunity created"
          detail={formatDate(opportunity.createdAt)}
        />
        {chronological.map((event) => (
          <TimelineRow
            key={event.id}
            done
            title={event.title}
            detail={
              event.detail
                ? `${event.detail} · ${formatDate(event.createdAt)}`
                : formatDate(event.createdAt)
            }
          />
        ))}
        <TimelineRow
          title="Atlas begins discovery"
          detail="Activates in an upcoming release."
          isLast
        />
      </ol>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Shared pieces.
// ---------------------------------------------------------------------------

function EmptyPanel({
  icon: Icon,
  title,
  body,
  badge,
}: {
  icon: LucideIcon;
  title: string;
  body: string;
  badge: string;
}) {
  return (
    <section className="flex flex-col items-center rounded-2xl border border-dashed border-border/70 bg-card/50 px-6 py-14 text-center">
      <span
        className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary"
        aria-hidden="true"
      >
        <Icon className="size-6" />
      </span>
      <h2 className="text-base font-semibold">{title}</h2>
      <p className="mt-1.5 max-w-md text-sm leading-relaxed text-balance text-muted-foreground">
        {body}
      </p>
      <span className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-border/60 px-2.5 py-1 text-[0.6875rem] font-medium text-muted-foreground">
        <ClockIcon className="size-3" aria-hidden="true" />
        {badge}
      </span>
    </section>
  );
}

function StatusBadge({ status }: { status: TradeOpportunity['status'] }) {
  const style =
    status === 'active'
      ? 'border-success/30 bg-success/10 text-success'
      : status === 'archived'
        ? 'border-border/60 text-muted-foreground/70'
        : 'border-border/70 bg-muted/50 text-muted-foreground';
  return (
    <span
      className={cn('rounded-full border px-2 py-0.5 text-[0.625rem] font-medium', style)}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

function TimelineRow({
  done = false,
  title,
  detail,
  isLast = false,
}: {
  done?: boolean;
  title: string;
  detail: string;
  isLast?: boolean;
}): ReactNode {
  return (
    <li className="flex gap-3">
      <span className="relative flex flex-col items-center">
        <span
          className={cn(
            'flex size-5 items-center justify-center rounded-full border',
            done
              ? 'border-success/40 bg-success/15 text-success'
              : 'border-primary/40 bg-primary/10 text-primary',
          )}
          aria-hidden="true"
        >
          {done ? (
            <span className="size-1.5 rounded-full bg-current" />
          ) : (
            <span className="animate-breathe size-1.5 rounded-full bg-current" />
          )}
        </span>
        {!isLast && <span aria-hidden="true" className="mt-1 h-6 w-px bg-border" />}
      </span>
      <div className="min-w-0 pt-0.5">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{detail}</p>
      </div>
    </li>
  );
}

function searchDescription(
  objective: TradeObjective,
  markets: readonly string[],
): string {
  const who =
    objective === 'find_suppliers'
      ? 'suppliers'
      : objective === 'both'
        ? 'buyers and suppliers'
        : 'buyers';
  const where = markets.length > 0 ? ` in ${markets.slice(0, 3).join(', ')}` : '';
  return `Looking for ${who}${where}.`;
}

function planFor(objective: TradeObjective): readonly string[] {
  const target =
    objective === 'find_suppliers'
      ? 'reliable suppliers'
      : objective === 'both'
        ? 'qualified buyers and reliable suppliers'
        : 'qualified buyers';
  return [
    `Read global trade data for ${target} that match this brief.`,
    'Rank each by fit, certifications, and live trade signals.',
    'Draft tailored introductions for your approval before anything sends.',
  ];
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeZone: 'UTC',
  }).format(new Date(iso));
}
