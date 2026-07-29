/**
 * Business Pulse — the workspace's trade metrics as a pure view model.
 *
 * Atlas is an assistant *and* a trade platform; this is the platform half made
 * legible. Five numbers matter to a trader: the buyers and suppliers in reach,
 * the conversations in flight, the deals live, and the money in the pipeline.
 *
 * Two rules govern this module, and they are the same rules the rest of the
 * dashboard follows:
 *
 * 1. It never invents data. The discovery, sourcing, messaging, and deal
 *    engines are not live yet, so there is nothing real to count. Rather than
 *    print a fabricated "+24%", a metric with no data source renders an
 *    *awaiting* state: the value is blank and the line beneath explains what
 *    Atlas will track once the module ships. Colour and trend arrows appear
 *    only when a real comparison exists.
 *
 * 2. It is fully capable the day data arrives. The composer already derives
 *    direction, delta, and attention from a sample with history. When the
 *    repositories land, the page passes a populated snapshot and every card
 *    lights up — no change to this file or the UI.
 *
 * The module is pure: it takes a snapshot of counts and returns view models. It
 * knows nothing about React, Supabase, or the current time.
 */

export type MetricKey = 'buyers' | 'suppliers' | 'conversations' | 'deals' | 'pipeline';

export type TrendDirection = 'up' | 'down' | 'flat';

export interface MetricTrend {
  readonly direction: TrendDirection;
  /** A short signed label, e.g. "+14" or "−2". Empty-safe. */
  readonly label: string;
}

export interface BusinessMetric {
  readonly key: MetricKey;
  readonly label: string;
  /** Ready for display: a formatted number, a currency string, or a blank marker. */
  readonly display: string;
  /** Whether the underlying module is producing data yet. */
  readonly status: 'active' | 'awaiting';
  /** One honest line: what the metric will track (awaiting) or what changed (active). */
  readonly context: string;
  /** Present only when a real prior period exists to compare against. */
  readonly trend?: MetricTrend;
  /** True when this metric has items the user should look at now. */
  readonly attention: boolean;
}

/**
 * A single metric's data with enough history to derive a trend.
 *
 * `null` for a metric means its module is not live — the composer renders the
 * awaiting state rather than a zero, because "no data source" and "a real count
 * of zero" are different truths and should not look the same.
 */
export interface MetricSample {
  readonly current: number;
  /** The comparable value one period ago, for the trend arrow. */
  readonly previous: number;
  /** How many of `current` need the user's attention right now. */
  readonly attention?: number;
}

export interface TradeSnapshot {
  readonly buyers: MetricSample | null;
  readonly suppliers: MetricSample | null;
  readonly conversations: MetricSample | null;
  readonly deals: MetricSample | null;
  readonly pipeline: MetricSample | null;
  /** ISO 4217 code used to format the pipeline value. */
  readonly currency: string;
}

/** The honest state of a brand-new workspace: every trade engine still dark. */
export const EMPTY_TRADE_SNAPSHOT: TradeSnapshot = {
  buyers: null,
  suppliers: null,
  conversations: null,
  deals: null,
  pipeline: null,
  currency: 'USD',
} as const;

// ---------------------------------------------------------------------------
// Per-metric specification: label, formatter, and the two context voices.
// ---------------------------------------------------------------------------

interface MetricSpec {
  readonly key: MetricKey;
  readonly label: string;
  readonly format: (value: number, currency: string) => string;
  /** Shown before the module is live — what Atlas will do here. */
  readonly awaiting: string;
  /** Shown with data — reads the sample and describes what changed / needs eyes. */
  readonly active: (sample: MetricSample) => { context: string; attention: boolean };
}

const COMPACT = new Intl.NumberFormat('en-US', { notation: 'compact' });
const PLAIN = new Intl.NumberFormat('en-US');

function money(value: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}

const SPECS: readonly MetricSpec[] = [
  {
    key: 'buyers',
    label: 'Buyers',
    format: (value) => COMPACT.format(value),
    awaiting: 'Atlas ranks importers by fit and buying signals.',
    active: (sample) => {
      const fresh = sample.current - sample.previous;
      return {
        context:
          fresh > 0
            ? `${PLAIN.format(fresh)} new match${fresh === 1 ? '' : 'es'} this week`
            : 'Matched to what you trade',
        attention: (sample.attention ?? 0) > 0,
      };
    },
  },
  {
    key: 'suppliers',
    label: 'Suppliers',
    format: (value) => COMPACT.format(value),
    awaiting: 'Atlas sources and vets suppliers against your specs.',
    active: (sample) => ({
      context:
        (sample.attention ?? 0) > 0
          ? `${PLAIN.format(sample.attention ?? 0)} awaiting your review`
          : 'Vetted and ready to contact',
      attention: (sample.attention ?? 0) > 0,
    }),
  },
  {
    key: 'conversations',
    label: 'Conversations',
    format: (value) => PLAIN.format(value),
    awaiting: 'Every buyer and supplier thread, tracked in one place.',
    active: (sample) => ({
      context:
        (sample.attention ?? 0) > 0
          ? `${PLAIN.format(sample.attention ?? 0)} need a reply`
          : 'All caught up',
      attention: (sample.attention ?? 0) > 0,
    }),
  },
  {
    key: 'deals',
    label: 'Active deals',
    format: (value) => PLAIN.format(value),
    awaiting: 'Live negotiations, from first quote to close.',
    active: (sample) => ({
      context:
        (sample.attention ?? 0) > 0
          ? `${PLAIN.format(sample.attention ?? 0)} moving stage`
          : 'Progressing on schedule',
      attention: (sample.attention ?? 0) > 0,
    }),
  },
  {
    key: 'pipeline',
    label: 'Pipeline',
    format: money,
    awaiting: 'Projected value across every open deal.',
    active: (sample) => {
      const delta = sample.current - sample.previous;
      return {
        context:
          delta > 0
            ? 'Trending up on recent activity'
            : delta < 0
              ? 'Down as deals closed out'
              : 'Steady week over week',
        attention: false,
      };
    },
  },
] as const;

// ---------------------------------------------------------------------------
// Composition
// ---------------------------------------------------------------------------

/** A blank value marker — an en dash, never a fabricated zero. */
const BLANK = '—';

function trendOf(
  sample: MetricSample,
  format: (value: number, currency: string) => string,
  currency: string,
): MetricTrend {
  const delta = sample.current - sample.previous;
  if (delta === 0) return { direction: 'flat', label: 'no change' };
  const magnitude = format(Math.abs(delta), currency);
  return {
    direction: delta > 0 ? 'up' : 'down',
    label: `${delta > 0 ? '+' : '−'}${magnitude}`,
  };
}

function composeMetric(spec: MetricSpec, snapshot: TradeSnapshot): BusinessMetric {
  const sample = snapshot[spec.key];

  if (sample === null) {
    return {
      key: spec.key,
      label: spec.label,
      display: BLANK,
      status: 'awaiting',
      context: spec.awaiting,
      attention: false,
    };
  }

  const { context, attention } = spec.active(sample);
  return {
    key: spec.key,
    label: spec.label,
    display: spec.format(sample.current, snapshot.currency),
    status: 'active',
    context,
    trend: trendOf(sample, spec.format, snapshot.currency),
    attention,
  };
}

export function composeBusinessPulse(snapshot: TradeSnapshot): readonly BusinessMetric[] {
  return SPECS.map((spec) => composeMetric(spec, snapshot));
}
