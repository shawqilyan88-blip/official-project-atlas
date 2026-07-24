import { cn } from '@/shared/ui';

import { CountryChip, MatchRing, PreviewFrame, TrustChip } from './preview-frame';
import { DISCOVERED_COMPANIES, DISCOVERY_QUERY, MATCH_RATIONALE } from './sample-data';

/**
 * The hero preview: Atlas discovering verified buyers.
 *
 * Discovery is the product's first real moment — before there is a
 * conversation, a sequence, or a deal, there is a company you did not know
 * existed. So the hero shows that, and the capability sections further down the
 * page each carry their own preview for the later stages. Compressing all six
 * capabilities into one image would have produced something dense and
 * unreadable at hero scale.
 *
 * The three-column layout degrades by dropping columns rather than shrinking
 * them: the navigation rail goes below `md`, the reasoning panel below `lg`.
 * A miniature interface scaled to phone width is illegible, and illegible is
 * worse than absent.
 */
export function WorkspacePreview({ className }: { className?: string }) {
  return (
    <PreviewFrame
      label="The Atlas workspace listing buyers discovered for a ceramic tableware exporter, each with an AI match score, a verification grade, and the trade signal that surfaced them."
      view={`Buyers · ${DISCOVERY_QUERY.product}`}
      className={className}
    >
      <div className="flex">
        <NavigationRail />

        <div className="min-w-0 flex-1">
          <QueryBar />
          <ul className="divide-y divide-border/70">
            {DISCOVERED_COMPANIES.map((company, index) => (
              <CompanyRow key={company.id} company={company} highlighted={index === 0} />
            ))}
          </ul>
        </div>

        <ReasoningPanel />
      </div>
    </PreviewFrame>
  );
}

function NavigationRail() {
  // Index 1 is Buyers — the active view.
  const glyphs = [
    'M3 9.5 9 4l6 5.5V15a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5Z',
    'M9 9.5a2.75 2.75 0 1 0 0-5.5 2.75 2.75 0 0 0 0 5.5ZM3.5 15.5c0-2.4 2.4-4 5.5-4s5.5 1.6 5.5 4',
    'M4 15.5V5.5A1.5 1.5 0 0 1 5.5 4h7A1.5 1.5 0 0 1 14 5.5v10M6.75 7.5h1.5M6.75 10.5h1.5M10.5 7.5H12M10.5 10.5H12',
    'M3.5 5.5A1.5 1.5 0 0 1 5 4h8a1.5 1.5 0 0 1 1.5 1.5v6A1.5 1.5 0 0 1 13 13H7l-3.5 2.5V5.5Z',
    'm3.5 9 11-5-4 11-2-4-5-2Z',
    'M3.5 6.5h11v8h-11v-8ZM6.75 6.5V5a1 1 0 0 1 1-1h2.5a1 1 0 0 1 1 1v1.5',
  ];

  return (
    <nav
      className="hidden w-11 shrink-0 flex-col items-center gap-1 border-r border-border/70 bg-sidebar py-3 md:flex"
      aria-hidden="true"
    >
      {glyphs.map((d, index) => (
        <span
          key={d}
          className={cn(
            'flex size-7 items-center justify-center rounded-md',
            index === 1 ? 'bg-primary/12 text-primary' : 'text-muted-foreground/55',
          )}
        >
          <svg viewBox="0 0 18 18" className="size-[15px]">
            <path
              d={d}
              className="fill-none stroke-current"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      ))}
    </nav>
  );
}

function QueryBar() {
  return (
    <div className="flex flex-wrap items-center gap-1.5 border-b border-border/70 px-3 py-2.5 sm:px-4">
      <span className="mr-1 text-[0.8125rem] font-semibold text-foreground">Buyers</span>

      {[DISCOVERY_QUERY.product, DISCOVERY_QUERY.market, DISCOVERY_QUERY.volume].map(
        (chip) => (
          <span
            key={chip}
            className="rounded-full border border-border/70 bg-muted/50 px-2 py-0.5 text-[0.625rem] whitespace-nowrap text-muted-foreground"
          >
            {chip}
          </span>
        ),
      )}

      {/* The live-scanning affordance: the product works continuously. */}
      <span className="ml-auto hidden items-center gap-1.5 text-[0.625rem] font-medium text-primary sm:inline-flex">
        <span className="relative flex size-1.5">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-60" />
          <span className="relative inline-flex size-1.5 rounded-full bg-primary" />
        </span>
        Scanning trade data
      </span>
    </div>
  );
}

function CompanyRow({
  company,
  highlighted,
}: {
  company: (typeof DISCOVERED_COMPANIES)[number];
  highlighted: boolean;
}) {
  return (
    <li
      className={cn(
        'flex items-center gap-3 px-3 py-3 sm:px-4',
        highlighted && 'bg-primary/[0.04]',
      )}
    >
      <MatchRing value={company.match} className="text-foreground" />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-[0.8125rem] font-medium">{company.company}</span>
          <CountryChip code={company.countryCode} />
        </div>
        <p className="mt-0.5 truncate text-[0.6875rem] text-muted-foreground">
          {company.city} · {company.signal}
        </p>
      </div>

      <span className="hidden shrink-0 sm:block">
        <TrustChip grade={company.trust} />
      </span>

      <span
        className={cn(
          'hidden shrink-0 rounded-full px-2 py-0.5 text-[0.625rem] font-medium lg:inline-block',
          company.status === 'Replied'
            ? 'bg-success/12 text-success'
            : company.status === 'Contacted'
              ? 'bg-primary/10 text-primary'
              : 'bg-muted text-muted-foreground',
        )}
      >
        {company.status}
      </span>
    </li>
  );
}

/**
 * Why Atlas surfaced the top match.
 *
 * Included because "the AI found it" is not a reason a trader can act on.
 * Showing the rationale is what separates a recommendation from a black box.
 */
function ReasoningPanel() {
  const top = DISCOVERED_COMPANIES[0];
  if (!top) return null;

  return (
    <aside className="hidden w-56 shrink-0 border-l border-border/70 bg-muted/25 p-3.5 lg:block">
      <p className="text-[0.625rem] font-medium tracking-wider text-muted-foreground uppercase">
        Why this match
      </p>

      <p className="mt-2 text-[0.8125rem] leading-snug font-medium">{top.company}</p>

      <ul className="mt-3 space-y-2.5">
        {MATCH_RATIONALE.map((reason) => (
          <li key={reason.label} className="flex gap-2">
            <svg
              viewBox="0 0 16 16"
              className="mt-px size-3 shrink-0 text-success"
              aria-hidden="true"
            >
              <circle cx="8" cy="8" r="7" className="fill-current opacity-15" />
              <path
                d="m5 8.2 2 2 4-4.4"
                className="fill-none stroke-current"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="min-w-0">
              <span className="block text-[0.6875rem] font-medium">{reason.label}</span>
              <span className="block text-[0.6875rem] leading-snug text-muted-foreground">
                {reason.detail}
              </span>
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex h-7 items-center justify-center rounded-md bg-primary text-[0.6875rem] font-medium text-primary-foreground">
        Draft outreach
      </div>
    </aside>
  );
}
