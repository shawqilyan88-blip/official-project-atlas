import Link from 'next/link';

import { cn } from '@/shared/ui';
import { ArrowRightIcon, CheckIcon, SparklesIcon } from '@/shared/ui/icons';

/**
 * The setup journey — a rewarding checklist, not a nagging banner.
 *
 * It names the real path to a working Atlas and shows exactly where the user is
 * on it. Completed steps read as earned (a success check), the next step is
 * highlighted and actionable, and the whole thing crowns itself when the last
 * box is ticked. It replaces the old single-line "complete your profile" nudge.
 */
export type JourneyState = 'done' | 'current' | 'todo' | 'soon';

export interface JourneyStep {
  readonly label: string;
  readonly hint?: string;
  readonly state: JourneyState;
  readonly href?: string;
}

export function ProgressJourney({ steps }: { readonly steps: readonly JourneyStep[] }) {
  const done = steps.filter((step) => step.state === 'done').length;
  const complete = done === steps.length;

  return (
    <section
      aria-labelledby="journey-heading"
      className="animate-rise rounded-2xl border border-border/70 bg-card p-5"
      style={{ ['--rise-delay' as string]: '160ms' }}
    >
      <div className="flex items-center justify-between gap-3">
        <h2
          id="journey-heading"
          className="flex items-center gap-2 text-sm font-semibold"
        >
          {complete && (
            <SparklesIcon className="size-4 text-primary" aria-hidden="true" />
          )}
          {complete ? 'Atlas is ready' : 'Get Atlas ready'}
        </h2>
        <span className="text-xs font-medium text-muted-foreground tabular-nums">
          {done}/{steps.length}
        </span>
      </div>

      {/* Progress bar — the reward meter. */}
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-700 ease-[--ease-out-quart]"
          style={{ width: `${Math.round((done / steps.length) * 100)}%` }}
        />
      </div>

      <ol className="mt-4 space-y-0.5">
        {steps.map((step, index) => (
          <li key={step.label}>
            <StepRow step={step} isLast={index === steps.length - 1} />
          </li>
        ))}
      </ol>
    </section>
  );
}

function StepRow({ step, isLast }: { step: JourneyStep; isLast: boolean }) {
  const inner = (
    <>
      <span className="relative flex flex-col items-center">
        <span
          className={cn(
            'flex size-6 items-center justify-center rounded-full border transition-colors',
            step.state === 'done'
              ? 'border-success/40 bg-success/15 text-success'
              : step.state === 'current'
                ? 'border-primary/50 bg-primary/10 text-primary'
                : 'border-border bg-muted/40 text-muted-foreground',
          )}
          aria-hidden="true"
        >
          {step.state === 'done' ? (
            <CheckIcon className="size-3.5" />
          ) : step.state === 'current' ? (
            <span className="animate-breathe size-2 rounded-full bg-current" />
          ) : (
            <span className="size-1.5 rounded-full bg-current opacity-50" />
          )}
        </span>
        {!isLast && (
          <span
            aria-hidden="true"
            className={cn(
              'mt-0.5 h-5 w-px',
              step.state === 'done' ? 'bg-success/30' : 'bg-border',
            )}
          />
        )}
      </span>

      <span className="min-w-0 flex-1 pt-0.5">
        <span
          className={cn(
            'flex items-center gap-2 text-sm',
            step.state === 'done'
              ? 'font-medium text-muted-foreground'
              : step.state === 'current'
                ? 'font-medium text-foreground'
                : 'text-muted-foreground',
          )}
        >
          <span className="truncate">{step.label}</span>
          {step.state === 'soon' && (
            <span className="shrink-0 rounded-full bg-muted px-1.5 py-0 text-[0.625rem] font-medium text-muted-foreground">
              Soon
            </span>
          )}
          {step.href !== undefined && step.state !== 'done' && (
            <ArrowRightIcon
              className="ml-auto size-3.5 shrink-0 text-muted-foreground/60 transition-transform group-hover:translate-x-0.5 group-hover:text-foreground"
              aria-hidden="true"
            />
          )}
        </span>
        {step.hint !== undefined && step.state === 'current' && (
          <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
            {step.hint}
          </span>
        )}
      </span>
    </>
  );

  const base = 'group flex gap-3 rounded-lg px-1.5 py-1 transition-colors';

  if (step.href !== undefined && step.state !== 'done' && step.state !== 'soon') {
    return (
      <Link href={step.href} className={cn(base, 'hover:bg-muted/40')}>
        {inner}
      </Link>
    );
  }
  return <div className={base}>{inner}</div>;
}
