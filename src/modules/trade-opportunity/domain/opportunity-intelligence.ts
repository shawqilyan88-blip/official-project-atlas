import type { TradeOpportunity } from './trade-opportunity';

/** Everything Atlas understands about one opportunity, composed for the UI. */
export interface OpportunityIntelligence {
  readonly summary: OpportunitySummary;
  readonly quality: OpportunityQuality;
  readonly suggestions: readonly Suggestion[];
}

/**
 * Opportunity intelligence — Atlas's understanding of a trade opportunity.
 *
 * Pure, deterministic, and honest. There is no language model here: every value
 * this module returns is derived from data the user actually entered (this
 * opportunity) or has entered before (their other opportunities). It never
 * fabricates an "extracted" fact. When real document extraction ships, it feeds
 * the same Opportunity Model these functions read, and this intelligence layer
 * works unchanged.
 *
 * Three things it produces:
 *   1. A structured summary of what the opportunity says.
 *   2. A completeness score, with the missing fields that would sharpen search.
 *   3. Suggestions learned from the workspace's past opportunities (AI memory).
 */

// --- 1. Summary ------------------------------------------------------------

export interface SummarySection {
  readonly label: string;
  readonly values: readonly string[];
}

export interface OpportunitySummary {
  readonly products: readonly string[];
  readonly countries: readonly string[];
  readonly volume: readonly string[];
  readonly requirements: readonly string[];
}

export function summariseOpportunity(o: TradeOpportunity): OpportunitySummary {
  const products = [o.product, o.category].filter((v): v is string =>
    Boolean(v && v.trim()),
  );

  const volume = [
    o.minOrderQuantity ? `MOQ ${o.minOrderQuantity}` : null,
    o.targetPrice ? `Target ${o.targetPrice}` : null,
  ].filter((v): v is string => v !== null);

  const requirements = [
    ...o.requiredCertifications,
    ...o.incoterms,
    ...o.paymentTerms,
    ...o.currencies,
  ];

  return { products, countries: [...o.targetMarkets], volume, requirements };
}

// --- 2. Completeness / quality score --------------------------------------

export type QualityTier = 'forming' | 'developing' | 'strong' | 'ready';

export interface MissingField {
  readonly label: string;
  /** How filling this improves the search — shown to the user. */
  readonly why: string;
}

export interface OpportunityQuality {
  readonly score: number; // 0–100
  readonly tier: QualityTier;
  readonly headline: string;
  readonly missing: readonly MissingField[];
}

interface QualityWeight {
  readonly weight: number;
  readonly present: (o: TradeOpportunity) => boolean;
  readonly label: string;
  readonly why: string;
}

const arr = (v: readonly string[]) => v.length > 0;
const str = (v: string | null) => Boolean(v && v.trim());

const QUALITY_WEIGHTS: readonly QualityWeight[] = [
  {
    weight: 20,
    label: 'Product or service',
    why: 'The core of every search — what you trade.',
    present: (o) => str(o.product),
  },
  {
    weight: 16,
    label: 'Target markets',
    why: 'Focuses discovery on the right countries.',
    present: (o) => arr(o.targetMarkets),
  },
  {
    weight: 10,
    label: 'Required certifications',
    why: 'Filters to partners that meet your compliance bar.',
    present: (o) => arr(o.requiredCertifications),
  },
  {
    weight: 8,
    label: 'Product category',
    why: 'Places the search in the right market segment.',
    present: (o) => str(o.category),
  },
  {
    weight: 8,
    label: 'Keywords',
    why: 'Sharpens what Atlas looks for and excludes.',
    present: (o) => arr(o.keywords),
  },
  {
    weight: 8,
    label: 'Preferred Incoterms',
    why: 'Pre-qualifies partners on shipping responsibility.',
    present: (o) => arr(o.incoterms),
  },
  {
    weight: 8,
    label: 'Payment terms',
    why: 'Screens out partners who cannot meet your terms.',
    present: (o) => arr(o.paymentTerms),
  },
  {
    weight: 6,
    label: 'Minimum order (MOQ)',
    why: 'Avoids partners below your order size.',
    present: (o) => str(o.minOrderQuantity),
  },
  {
    weight: 6,
    label: 'Target price',
    why: 'Anchors matches to your price expectations.',
    present: (o) => str(o.targetPrice),
  },
  {
    weight: 6,
    label: 'Ideal partner criteria',
    why: 'Tells Atlas exactly who to prioritise.',
    present: (o) => str(o.criteria),
  },
  {
    weight: 4,
    label: 'Currencies',
    why: 'Aligns quoting with compatible partners.',
    present: (o) => arr(o.currencies),
  },
];

const QUALITY_HEADLINES: Record<QualityTier, string> = {
  forming: 'Add a product and markets so Atlas can start understanding this opportunity.',
  developing: 'Taking shape — a few more details will sharpen who Atlas surfaces.',
  strong: 'Well understood. Atlas can run a focused search from this.',
  ready: 'Ready — Atlas has everything it needs for a precise search.',
};

// Shared readiness ladder (Forming → Developing → Strong → Ready) with the same
// thresholds used for profile strength, so a tier word means the same thing on
// every surface (D.2 CT-6 / PAT-RL).
function qualityTier(score: number): QualityTier {
  if (score < 40) return 'forming';
  if (score < 65) return 'developing';
  if (score < 85) return 'strong';
  return 'ready';
}

export function assessOpportunityQuality(o: TradeOpportunity): OpportunityQuality {
  const score = QUALITY_WEIGHTS.reduce(
    (total, w) => (w.present(o) ? total + w.weight : total),
    0,
  );
  const tier = qualityTier(score);
  const missing = QUALITY_WEIGHTS.filter((w) => !w.present(o)).map((w) => ({
    label: w.label,
    why: w.why,
  }));
  return { score, tier, headline: QUALITY_HEADLINES[tier], missing };
}

// --- 3. AI memory: preferences learned from past opportunities -------------

export interface Suggestion {
  readonly dimension:
    | 'targetMarkets'
    | 'incoterms'
    | 'paymentTerms'
    | 'currencies'
    | 'requiredCertifications';
  readonly label: string;
  /** Values seen in past opportunities but not yet on this one, most-used first. */
  readonly values: readonly string[];
  readonly note: string;
}

const DIMENSIONS: readonly {
  key: Suggestion['dimension'];
  label: string;
  note: string;
  get: (o: TradeOpportunity) => readonly string[];
}[] = [
  {
    key: 'targetMarkets',
    label: 'Target markets',
    note: 'You usually target these markets.',
    get: (o) => o.targetMarkets,
  },
  {
    key: 'incoterms',
    label: 'Incoterms',
    note: 'You usually work with these Incoterms.',
    get: (o) => o.incoterms,
  },
  {
    key: 'paymentTerms',
    label: 'Payment terms',
    note: 'You usually prefer these payment terms.',
    get: (o) => o.paymentTerms,
  },
  {
    key: 'currencies',
    label: 'Currencies',
    note: 'You usually settle in these currencies.',
    get: (o) => o.currencies,
  },
  {
    key: 'requiredCertifications',
    label: 'Certifications',
    note: 'You usually require these certifications.',
    get: (o) => o.requiredCertifications,
  },
];

/** Ranks values by how many past opportunities used them. */
function rankByFrequency(
  lists: readonly (readonly string[])[],
): { value: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const list of lists) {
    // Count each value once per opportunity, not per repetition within it.
    for (const value of new Set(list)) {
      counts.set(value, (counts.get(value) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Suggestions drawn only from the workspace's OTHER opportunities. Requires a
 * value to appear in at least two past opportunities before calling it a habit,
 * so a single past entry is not dressed up as "you usually…". Returns nothing
 * when there is not enough history — honest, not padded.
 */
export function suggestFromHistory(
  current: TradeOpportunity,
  history: readonly TradeOpportunity[],
): readonly Suggestion[] {
  const others = history.filter((o) => o.id !== current.id);
  if (others.length < 2) return [];

  const suggestions: Suggestion[] = [];
  for (const dim of DIMENSIONS) {
    const already = new Set(dim.get(current));
    const ranked = rankByFrequency(others.map(dim.get))
      .filter((entry) => entry.count >= 2 && !already.has(entry.value))
      .map((entry) => entry.value)
      .slice(0, 4);
    if (ranked.length > 0) {
      suggestions.push({
        dimension: dim.key,
        label: dim.label,
        values: ranked,
        note: dim.note,
      });
    }
  }
  return suggestions;
}
