import type { OrganizationId } from '@/core/entities';

/**
 * The Trade Opportunity domain.
 *
 * An opportunity is one reusable trade project — "find buyers for Green
 * Edamame", "source frozen mango suppliers". It is the object a company creates
 * over and over; the Company Profile it belongs to holds the permanent identity
 * (products, role, markets) so an opportunity only carries what is specific to
 * this pursuit and inherits the rest. That split is what lets a workspace run
 * hundreds of opportunities without ever re-entering company data.
 *
 * Pure data and rules — no persistence, no React.
 */

export const TRADE_OBJECTIVES = ['find_buyers', 'find_suppliers', 'both'] as const;
export type TradeObjective = (typeof TRADE_OBJECTIVES)[number];

export const OPPORTUNITY_STATUSES = ['draft', 'active', 'archived'] as const;
export type OpportunityStatus = (typeof OPPORTUNITY_STATUSES)[number];

export interface TradeOpportunity {
  readonly id: string;
  readonly organizationId: OrganizationId;
  readonly name: string;
  readonly objective: TradeObjective;
  readonly product: string | null;
  readonly category: string | null;
  readonly targetMarkets: readonly string[];
  readonly minOrderQuantity: string | null;
  readonly targetPrice: string | null;
  readonly incoterms: readonly string[];
  readonly requiredCertifications: readonly string[];
  readonly paymentTerms: readonly string[];
  readonly currencies: readonly string[];
  readonly keywords: readonly string[];
  readonly excludeKeywords: readonly string[];
  readonly criteria: string | null;
  readonly notes: string | null;
  readonly status: OpportunityStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly archivedAt: string | null;
  readonly lastOpenedAt: string | null;
}

/** The editable fields, as the editor collects them. */
export interface TradeOpportunityDraft {
  readonly name: string;
  readonly objective: TradeObjective;
  readonly product: string | null;
  readonly category: string | null;
  readonly targetMarkets: readonly string[];
  readonly minOrderQuantity: string | null;
  readonly targetPrice: string | null;
  readonly incoterms: readonly string[];
  readonly requiredCertifications: readonly string[];
  readonly paymentTerms: readonly string[];
  readonly currencies: readonly string[];
  readonly keywords: readonly string[];
  readonly excludeKeywords: readonly string[];
  readonly criteria: string | null;
  readonly notes: string | null;
}

// ---------------------------------------------------------------------------
// Display metadata — labels live with the domain so every surface agrees.
// ---------------------------------------------------------------------------

export const OBJECTIVE_OPTIONS: readonly {
  value: TradeObjective;
  label: string;
  hint: string;
}[] = [
  { value: 'find_buyers', label: 'Find buyers', hint: 'Companies to sell to' },
  { value: 'find_suppliers', label: 'Find suppliers', hint: 'Companies to source from' },
  { value: 'both', label: 'Both', hint: 'Buyers and suppliers' },
];

export const OBJECTIVE_LABEL: Readonly<Record<TradeObjective, string>> =
  Object.fromEntries(
    OBJECTIVE_OPTIONS.map((option) => [option.value, option.label]),
  ) as Record<TradeObjective, string>;

export const STATUS_LABEL: Readonly<Record<OpportunityStatus, string>> = {
  draft: 'Draft',
  active: 'Active',
  archived: 'Archived',
};

export const OPPORTUNITY_LIMITS = {
  nameMax: 120,
  productMax: 160,
  categoryMax: 120,
  shortTextMax: 120,
  criteriaMax: 2000,
  notesMax: 4000,
  tagMax: 80,
  maxTags: 30,
} as const;

// ---------------------------------------------------------------------------
// Construction & inheritance
// ---------------------------------------------------------------------------

/**
 * Defaults an opportunity inherits from its Company Profile. The caller (an app
 * service that can see the profile) maps profile fields into this small shape,
 * so the domain never depends on the trade-profile module.
 */
export interface InheritedDefaults {
  readonly objective?: TradeObjective;
  readonly category?: string | null;
  readonly targetMarkets?: readonly string[];
  readonly requiredCertifications?: readonly string[];
  readonly incoterms?: readonly string[];
  readonly paymentTerms?: readonly string[];
  readonly currencies?: readonly string[];
}

export function newOpportunityDraft(
  defaults: InheritedDefaults = {},
): TradeOpportunityDraft {
  return {
    name: '',
    objective: defaults.objective ?? 'find_buyers',
    product: null,
    category: defaults.category ?? null,
    targetMarkets: defaults.targetMarkets ?? [],
    minOrderQuantity: null,
    targetPrice: null,
    incoterms: defaults.incoterms ?? [],
    requiredCertifications: defaults.requiredCertifications ?? [],
    paymentTerms: defaults.paymentTerms ?? [],
    currencies: defaults.currencies ?? [],
    keywords: [],
    excludeKeywords: [],
    criteria: null,
    notes: null,
  };
}

/** The draft form of an existing opportunity, for editing. */
export function draftOf(opportunity: TradeOpportunity): TradeOpportunityDraft {
  return {
    name: opportunity.name,
    objective: opportunity.objective,
    product: opportunity.product,
    category: opportunity.category,
    targetMarkets: opportunity.targetMarkets,
    minOrderQuantity: opportunity.minOrderQuantity,
    targetPrice: opportunity.targetPrice,
    incoterms: opportunity.incoterms,
    requiredCertifications: opportunity.requiredCertifications,
    paymentTerms: opportunity.paymentTerms,
    currencies: opportunity.currencies,
    keywords: opportunity.keywords,
    excludeKeywords: opportunity.excludeKeywords,
    criteria: opportunity.criteria,
    notes: opportunity.notes,
  };
}

/**
 * A sensible name when the user has not typed one, from what they have entered.
 * Mirrors how people name these: by product, by market, or by intent.
 */
export function suggestOpportunityName(input: {
  product?: string | null;
  objective: TradeObjective;
  markets?: readonly string[];
}): string {
  const product = input.product?.trim();
  const market = input.markets?.[0]?.trim();
  const kind =
    input.objective === 'find_suppliers'
      ? 'Supplier Search'
      : input.objective === 'both'
        ? 'Trade Search'
        : 'Buyer Search';

  if (product && market) return `${product} — ${market}`;
  if (product) return `${product} ${kind}`;
  if (market) return `${market} ${kind}`;
  return `New ${kind}`;
}

/** A copy's name: "Green Edamame — EU" becomes "Green Edamame — EU (Copy)". */
export function duplicatedName(name: string): string {
  const base = name.replace(/\s*\(Copy(?: \d+)?\)\s*$/i, '').trim();
  return `${base} (Copy)`;
}
