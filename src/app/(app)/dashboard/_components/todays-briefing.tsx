import Link from 'next/link';

import type { Briefing, BriefingItem } from '@/modules/dashboard/domain/briefing';
import { cn } from '@/shared/ui';
import {
  ArrowRightIcon,
  CheckCircle2Icon,
  ClockIcon,
  SparklesIcon,
} from '@/shared/ui/icons';

/**
 * Today's Briefing — Atlas's account of the day, in two honest columns.
 *
 * "Handled" reassures; "Needs you" asks. Keeping them side by side makes the
 * card read the way a good assistant speaks: here is what I took care of, and
 * here is the short list only you can do. Every line is real — the handled items
 * are genuine system facts, the asks each point somewhere you can act.
 *
 * A Server Component: the briefing arrives fully composed.
 */
export function TodaysBriefing({ briefing }: { readonly briefing: Briefing }) {
  return (
    <section
      aria-labelledby="briefing-heading"
      className={cn(
        'animate-rise relative overflow-hidden rounded-2xl border border-border/70 bg-card',
        'p-5 sm:p-6',
      )}
      style={{ ['--rise-delay' as string]: '120ms' }}
    >
      <div className="flex items-start gap-3">
        <span
          className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"
          aria-hidden="true"
        >
          <SparklesIcon className="size-4" />
        </span>
        <div className="min-w-0">
          <h2 id="briefing-heading" className="text-sm font-semibold">
            Today&rsquo;s briefing
          </h2>
          <p className="mt-1 text-[0.9375rem] leading-relaxed text-balance text-foreground/90">
            {briefing.headline}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <BriefingColumn
          title="Handled"
          icon={<CheckCircle2Icon className="size-3.5 text-success" aria-hidden="true" />}
          count={briefing.accomplished.length}
        >
          {briefing.accomplished.map((item, index) => (
            <li
              key={item.text}
              className="animate-rise flex gap-2.5"
              style={{ ['--rise-delay' as string]: `${index * 60}ms` }}
            >
              <CheckCircle2Icon
                className="mt-0.5 size-4 shrink-0 text-success/80"
                aria-hidden="true"
              />
              <span className="text-[0.8125rem] leading-relaxed text-muted-foreground">
                {item.text}
              </span>
            </li>
          ))}
        </BriefingColumn>

        <BriefingColumn
          title="Needs you"
          icon={<ClockIcon className="size-3.5 text-warning" aria-hidden="true" />}
          count={briefing.attention.length}
        >
          {briefing.attention.length === 0 ? (
            <li className="animate-rise flex gap-2.5">
              <CheckCircle2Icon
                className="mt-0.5 size-4 shrink-0 text-success/80"
                aria-hidden="true"
              />
              <span className="text-[0.8125rem] leading-relaxed text-muted-foreground">
                You&rsquo;re all set — nothing needs you right now.
              </span>
            </li>
          ) : (
            briefing.attention.map((item, index) => (
              <li
                key={item.text}
                className="animate-rise"
                style={{ ['--rise-delay' as string]: `${index * 60}ms` }}
              >
                <AttentionRow item={item} />
              </li>
            ))
          )}
        </BriefingColumn>
      </div>
    </section>
  );
}

function BriefingColumn({
  title,
  icon,
  count,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        {icon}
        <h3 className="text-xs font-semibold tracking-[0.04em] text-foreground/80 uppercase">
          {title}
        </h3>
        <span className="rounded-full bg-muted/60 px-1.5 text-[0.625rem] font-medium text-muted-foreground tabular-nums">
          {count}
        </span>
      </div>
      <ul className="space-y-2.5">{children}</ul>
    </div>
  );
}

function AttentionRow({ item }: { item: BriefingItem }) {
  const content = (
    <>
      <span className="text-[0.8125rem] leading-relaxed text-muted-foreground group-hover:text-foreground">
        {item.text}
      </span>
      {item.href !== undefined && (
        <ArrowRightIcon
          className="mt-0.5 size-3.5 shrink-0 text-muted-foreground/60 transition-transform group-hover:translate-x-0.5 group-hover:text-foreground"
          aria-hidden="true"
        />
      )}
    </>
  );

  if (item.href === undefined) {
    return (
      <span className="flex items-start justify-between gap-2.5">
        <span className="text-[0.8125rem] leading-relaxed text-muted-foreground">
          {item.text}
        </span>
      </span>
    );
  }

  return (
    <Link
      href={item.href}
      className="focus-ring group flex items-start justify-between gap-2.5 rounded-md transition-colors"
    >
      {content}
    </Link>
  );
}
