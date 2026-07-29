import type {
  BusinessMetric,
  MetricKey,
} from '@/modules/dashboard/domain/business-pulse';
import { cn } from '@/shared/ui';
import {
  ArrowUpRightIcon,
  BriefcaseIcon,
  BuildingIcon,
  type LucideIcon,
  MessagesSquareIcon,
  TrendingUpIcon,
  UsersIcon,
} from '@/shared/ui/icons';

/**
 * Business Pulse — the trade platform's vital signs, beneath the command bar.
 *
 * Five metrics that matter to a trader, rendered as premium cards rather than
 * flat stat boxes. Each carries an icon, the value, and one line of context.
 * Crucially, an unbuilt module shows an honest *awaiting* state — a blank value
 * and a line describing what Atlas will track — instead of a fabricated number.
 * Trend arrows and attention accents appear only when real data backs them, so
 * the colour on the screen always means something.
 *
 * A Server Component: the metrics arrive resolved, nothing here is interactive.
 */
const ICONS: Readonly<Record<MetricKey, LucideIcon>> = {
  buyers: UsersIcon,
  suppliers: BuildingIcon,
  conversations: MessagesSquareIcon,
  deals: BriefcaseIcon,
  pipeline: TrendingUpIcon,
};

export function BusinessPulse({
  metrics,
}: {
  readonly metrics: readonly BusinessMetric[];
}) {
  return (
    <section
      aria-labelledby="business-pulse-heading"
      className="animate-rise"
      style={{ ['--rise-delay' as string]: '60ms' }}
    >
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h2 id="business-pulse-heading" className="text-sm font-semibold">
          Business pulse
        </h2>
        <p className="text-xs text-muted-foreground">
          Activates as Atlas starts working your market
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {metrics.map((metric, index) => (
          <MetricCard key={metric.key} metric={metric} index={index} />
        ))}
      </div>
    </section>
  );
}

function MetricCard({ metric, index }: { metric: BusinessMetric; index: number }) {
  const Icon = ICONS[metric.key];
  const isAwaiting = metric.status === 'awaiting';

  return (
    <article
      className={cn(
        'hover-lift animate-rise group relative flex flex-col overflow-hidden rounded-2xl border bg-card p-4',
        metric.attention ? 'border-warning/40' : 'border-border/70 hover:border-border',
      )}
      style={{ ['--rise-delay' as string]: `${100 + index * 50}ms` }}
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <span
          className={cn(
            'flex size-8 items-center justify-center rounded-lg',
            isAwaiting
              ? 'bg-muted/50 text-muted-foreground'
              : 'bg-primary/10 text-primary',
          )}
          aria-hidden="true"
        >
          <Icon className="size-[1.0625rem]" />
        </span>

        {metric.trend ? (
          <TrendBadge trend={metric.trend} />
        ) : (
          <span className="rounded-full border border-border/60 px-2 py-0.5 text-[0.625rem] font-medium text-muted-foreground/70">
            Soon
          </span>
        )}
      </div>

      <p className="text-[0.8125rem] font-medium text-muted-foreground">{metric.label}</p>

      <p
        className={cn(
          'mt-0.5 text-2xl font-semibold tracking-tight tabular-nums',
          isAwaiting && 'text-muted-foreground/40',
        )}
      >
        {metric.display}
      </p>

      <p
        className={cn(
          'mt-1.5 text-xs leading-relaxed',
          metric.attention ? 'text-warning' : 'text-muted-foreground',
        )}
      >
        {metric.context}
      </p>
    </article>
  );
}

function TrendBadge({ trend }: { trend: NonNullable<BusinessMetric['trend']> }) {
  const tone =
    trend.direction === 'up'
      ? 'text-success'
      : trend.direction === 'down'
        ? 'text-destructive'
        : 'text-muted-foreground';

  return (
    <span
      className={cn('inline-flex items-center gap-1 text-[0.6875rem] font-medium', tone)}
    >
      {trend.direction !== 'flat' && (
        <ArrowUpRightIcon
          className={cn('size-3', trend.direction === 'down' && 'rotate-90')}
          aria-hidden="true"
        />
      )}
      {trend.label}
    </span>
  );
}
