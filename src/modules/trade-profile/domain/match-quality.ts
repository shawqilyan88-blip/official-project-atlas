/**
 * Company-profile strength scoring.
 *
 * A pure, framework-free assessment of how complete — and therefore how
 * matchable — a Trade Profile is. The wizard renders this live as the user
 * types, so the work must stay here in the domain: no React, no side effects,
 * just signals in, an honest score and the single most valuable next step out.
 *
 * The weights encode what actually improves discovery. What a company trades and
 * where it wants to trade dominate, because those are what Atlas searches on;
 * everything else sharpens precision. The weights sum to 100 so `score` reads
 * directly as a percentage.
 */

export interface ProfileSignals {
  readonly products: readonly string[];
  readonly businessTypes: readonly string[];
  readonly industry: string;
  readonly markets: readonly string[];
  readonly certifications: readonly string[];
  readonly lookingFor: string | null;
  readonly website: string;
  readonly description: string;
  readonly incoterms: readonly string[];
  readonly paymentTerms: readonly string[];
  readonly currencies: readonly string[];
  readonly companySize: string;
  readonly languages: readonly string[];
}

export type ProfileTier = 'forming' | 'developing' | 'strong' | 'ready';

export interface ProfileStrength {
  /** 0–100, reads directly as a percentage for the progress bar. */
  readonly score: number;
  /** 0–5 filled stars. */
  readonly filledStars: number;
  readonly tier: ProfileTier;
  /** One line describing the profile as it stands. */
  readonly headline: string;
  /** The single highest-value field still empty, framed as a benefit. Null when comprehensive. */
  readonly tip: string | null;
}

interface Weighted {
  readonly key: keyof ProfileSignals;
  readonly weight: number;
  /** Benefit-framed nudge shown when this field is the best next step. */
  readonly tip: string;
}

/**
 * Ordered by weight — `tip` selection walks this list and takes the first empty
 * field, so the most valuable gap is always the one surfaced.
 */
const WEIGHTS: readonly Weighted[] = [
  {
    key: 'products',
    weight: 22,
    tip: 'Add what you trade — it’s what Atlas searches for.',
  },
  {
    key: 'markets',
    weight: 16,
    tip: 'Add target markets so Atlas knows where to search.',
  },
  {
    key: 'certifications',
    weight: 10,
    tip: 'Adding certifications increases buyer and supplier accuracy.',
  },
  {
    key: 'businessTypes',
    weight: 10,
    tip: 'Add your business type to refine who Atlas looks for.',
  },
  {
    key: 'lookingFor',
    weight: 8,
    tip: 'Tell Atlas whether you want buyers, suppliers, or both.',
  },
  {
    key: 'industry',
    weight: 8,
    tip: 'Add your industry to place you in the right market segment.',
  },
  {
    key: 'description',
    weight: 8,
    tip: 'A short description gives Atlas context for sharper matches.',
  },
  {
    key: 'website',
    weight: 6,
    tip: 'Add your website so Atlas can understand your company automatically.',
  },
  {
    key: 'incoterms',
    weight: 3,
    tip: 'Preferred Incoterms help Atlas pre-qualify partners on terms.',
  },
  {
    key: 'paymentTerms',
    weight: 3,
    tip: 'Payment terms filter out partners who can’t meet them.',
  },
  {
    key: 'currencies',
    weight: 2,
    tip: 'Currencies streamline quoting with the right partners.',
  },
  {
    key: 'companySize',
    weight: 2,
    tip: 'Company size helps Atlas match partners of a compatible scale.',
  },
  {
    key: 'languages',
    weight: 2,
    tip: 'Languages improve outreach with overseas companies.',
  },
];

function isPresent(value: ProfileSignals[keyof ProfileSignals]): boolean {
  if (Array.isArray(value)) return value.length > 0;
  return typeof value === 'string' && value.trim().length > 0;
}

const HEADLINES: Record<ProfileTier, string> = {
  forming: 'Add your products so Atlas knows what to search for.',
  developing: 'Good start — a few more details will sharpen your matches.',
  strong: 'This profile is strong enough to find verified buyers and suppliers.',
  ready: 'Ready — Atlas can match you with high precision.',
};

// Shared readiness ladder (Forming → Developing → Strong → Ready) with the same
// thresholds used for opportunity quality, so a tier word means the same thing
// on every surface (D.2 CT-6 / PAT-RL).
function tierFor(score: number): ProfileTier {
  if (score < 40) return 'forming';
  if (score < 65) return 'developing';
  if (score < 85) return 'strong';
  return 'ready';
}

export function assessProfileStrength(signals: ProfileSignals): ProfileStrength {
  const score = WEIGHTS.reduce(
    (total, field) => (isPresent(signals[field.key]) ? total + field.weight : total),
    0,
  );

  const tier = tierFor(score);
  const nextGap = WEIGHTS.find((field) => !isPresent(signals[field.key]));

  return {
    score,
    filledStars: Math.max(0, Math.min(5, Math.round(score / 20))),
    tier,
    headline: HEADLINES[tier],
    tip: nextGap?.tip ?? null,
  };
}
