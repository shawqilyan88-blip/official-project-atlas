import { cn } from '@/shared/ui';
import {
  BriefcaseIcon,
  BuildingIcon,
  type LucideIcon,
  MessagesSquareIcon,
  UsersIcon,
} from '@/shared/ui/icons';

/**
 * "What has Atlas done for me today?"
 *
 * This is the question the dashboard exists to answer, so it gets the main
 * column. Atlas has no autonomous engines yet, so instead of a dead "No
 * activity" card it renders a *preview* of the real feed — a few dimmed, clearly
 * labelled example entries that teach what will land here once the engines run.
 * The empty state does a job: it shows the shape of the work to come and points
 * at the one action that starts it.
 */
interface PreviewEntry {
  readonly icon: LucideIcon;
  readonly title: string;
  readonly detail: string;
  readonly time: string;
}

const PREVIEW: readonly PreviewEntry[] = [
  {
    icon: UsersIcon,
    title: 'Found 14 buyers importing your product',
    detail: 'Ranked by fit and purchase signals, ready to review.',
    time: '08:10',
  },
  {
    icon: BuildingIcon,
    title: 'Shortlisted 9 suppliers matched to your specs',
    detail: 'Vetted on capability, certification, and delivered reliability.',
    time: '08:12',
  },
  {
    icon: MessagesSquareIcon,
    title: 'Flagged 2 replies worth your attention',
    detail:
      'A buyer’s price question and a supplier’s sample offer, both time-sensitive.',
    time: '11:47',
  },
  {
    icon: BriefcaseIcon,
    title: 'Advanced 1 deal to “Quoted”',
    detail: 'Terms and documents attached to the record automatically.',
    time: '15:03',
  },
];

export function AtlasToday() {
  return (
    <section
      aria-labelledby="atlas-today-heading"
      className="animate-rise flex flex-col rounded-2xl border border-border/70 bg-card"
      style={{ ['--rise-delay' as string]: '80ms' }}
    >
      <header className="flex items-center justify-between gap-3 border-b border-border/60 px-5 py-3.5">
        <h2 id="atlas-today-heading" className="text-sm font-semibold">
          What Atlas did today
        </h2>
        <span className="rounded-full border border-border/70 bg-muted/40 px-2 py-0.5 text-[0.625rem] font-medium text-muted-foreground">
          Preview
        </span>
      </header>

      <div className="p-5">
        <p className="mb-5 text-sm leading-relaxed text-muted-foreground">
          Atlas hasn’t started working yet. Once you point it at a market, your day will
          fill in here — this is what it will look like:
        </p>

        {/* The preview timeline. Dimmed and marked so it is never mistaken for
            real activity, but concrete enough to teach the capability. */}
        <ol className="relative space-y-4" aria-label="Example of Atlas activity">
          {PREVIEW.map((entry, index) => {
            const Icon = entry.icon;
            const isLast = index === PREVIEW.length - 1;
            return (
              <li key={entry.title} className="relative flex gap-3.5">
                {!isLast && (
                  <span
                    aria-hidden="true"
                    className="absolute top-9 left-[1.0625rem] h-[calc(100%-1rem)] w-px bg-border/70"
                  />
                )}
                <span
                  className="relative z-10 mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-muted/40 text-muted-foreground"
                  aria-hidden="true"
                >
                  <Icon className="size-4" />
                </span>
                <div className="min-w-0 flex-1 opacity-70">
                  <p className="flex items-center gap-2 text-sm font-medium">
                    <span className="truncate">{entry.title}</span>
                    <span className="tabular shrink-0 font-mono text-[0.625rem] text-muted-foreground/70">
                      {entry.time}
                    </span>
                  </p>
                  <p className="mt-0.5 text-[0.8125rem] leading-relaxed text-muted-foreground">
                    {entry.detail}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>

        <div
          className={cn(
            'mt-6 rounded-xl border border-dashed border-primary/30 bg-primary/[0.04] px-4 py-3',
            'text-sm text-muted-foreground',
          )}
        >
          Start an opportunity above to point Atlas at a market, and real entries replace
          this preview.
        </div>
      </div>
    </section>
  );
}
