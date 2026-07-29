import type { TradeOpportunity } from './trade-opportunity';

/**
 * Trade discovery domain — provider-agnostic.
 *
 * The engine never speaks to a specific data source. Every provider normalises
 * its own results into one `CandidateCompany` shape; an application service can
 * then query one provider or many in parallel, merge duplicates, and hand a
 * single unified list to the ranker. This module holds the shared model and the
 * pure merge/query logic that make that possible — no I/O, no provider details.
 *
 * Honesty is built in: a provider that has no data configured returns
 * `not_configured` with zero candidates. Nothing here fabricates a company.
 */

/** What Atlas is looking for, assembled from the Opportunity Model + Company Profile. */
export interface DiscoveryQuery {
  readonly role: 'buyers' | 'suppliers' | 'both';
  readonly product: string | null;
  readonly category: string | null;
  readonly markets: readonly string[];
  readonly certifications: readonly string[];
  readonly keywords: readonly string[];
  readonly excludeKeywords: readonly string[];
  readonly incoterms: readonly string[];
  readonly paymentTerms: readonly string[];
  /** Company Profile context that sharpens who to look for. */
  readonly companyProducts: readonly string[];
  readonly companyIndustry: string | null;
}

/** The single common shape every provider must return. */
export interface CandidateCompany {
  readonly name: string;
  readonly country: string | null;
  readonly website: string | null;
  readonly role: 'buyer' | 'supplier';
  /** Provider name(s) that surfaced this company — unioned when merged. */
  readonly sources: readonly string[];
  /** Provider-specific evidence, kept loose so any provider can contribute. */
  readonly signals: Readonly<Record<string, unknown>>;
}

/** A candidate after the ranker scores it against the query. */
export interface RankedCompany {
  readonly candidate: CandidateCompany;
  readonly fitScore: number; // 0–100
  readonly reasons: readonly string[];
}

export type DiscoveryStatus = 'ok' | 'not_configured' | 'failed';

/** What a single provider returns. */
export interface DiscoveryProviderResult {
  readonly provider: string;
  readonly status: DiscoveryStatus;
  readonly candidates: readonly CandidateCompany[];
  readonly message?: string | undefined;
}

/** The aggregated outcome across every queried provider. */
export interface DiscoveryOutcome {
  readonly status: DiscoveryStatus;
  readonly candidates: readonly CandidateCompany[];
  readonly providerResults: readonly DiscoveryProviderResult[];
  readonly message?: string | undefined;
}

// --- Query construction ----------------------------------------------------

export function buildDiscoveryQuery(
  opportunity: TradeOpportunity,
  profile: {
    products?: readonly string[] | undefined;
    industry?: string | null | undefined;
  } = {},
): DiscoveryQuery {
  const role =
    opportunity.objective === 'find_suppliers'
      ? 'suppliers'
      : opportunity.objective === 'both'
        ? 'both'
        : 'buyers';

  return {
    role,
    product: opportunity.product,
    category: opportunity.category,
    markets: opportunity.targetMarkets,
    certifications: opportunity.requiredCertifications,
    keywords: opportunity.keywords,
    excludeKeywords: opportunity.excludeKeywords,
    incoterms: opportunity.incoterms,
    paymentTerms: opportunity.paymentTerms,
    companyProducts: profile.products ?? [],
    companyIndustry: profile.industry ?? null,
  };
}

// --- Normalisation & merge (the multi-provider seam) -----------------------

/** A domain from a URL/host, lowercased, without protocol/www/path. */
function domainOf(website: string | null): string | null {
  if (!website) return null;
  const cleaned = website
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .split(/[/?#]/)[0];
  return cleaned && cleaned.includes('.') ? cleaned : null;
}

/**
 * A stable identity for de-duplication: the website domain when present (the
 * strongest signal two providers refer to the same company), otherwise a
 * normalised name + country. Also namespaced by role so a company can appear as
 * both a buyer and a supplier without colliding.
 */
export function candidateIdentity(candidate: CandidateCompany): string {
  const domain = domainOf(candidate.website);
  const key =
    domain ??
    `${candidate.name.trim().toLowerCase().replace(/\s+/g, ' ')}|${(candidate.country ?? '').trim().toLowerCase()}`;
  return `${candidate.role}:${key}`;
}

/**
 * Flattens one-or-many provider results into a single de-duplicated list.
 * Duplicates union their `sources` and keep the richest field values. This is
 * what lets Atlas query several providers in parallel later and present one
 * clean list — it already works for a single provider today.
 */
export function mergeCandidates(
  results: readonly DiscoveryProviderResult[],
): CandidateCompany[] {
  const byIdentity = new Map<string, CandidateCompany>();

  for (const result of results) {
    for (const candidate of result.candidates) {
      const id = candidateIdentity(candidate);
      const existing = byIdentity.get(id);
      if (!existing) {
        byIdentity.set(id, candidate);
        continue;
      }
      byIdentity.set(id, {
        name: existing.name || candidate.name,
        country: existing.country ?? candidate.country,
        website: existing.website ?? candidate.website,
        role: existing.role,
        sources: [...new Set([...existing.sources, ...candidate.sources])],
        signals: { ...candidate.signals, ...existing.signals },
      });
    }
  }

  return [...byIdentity.values()];
}

/**
 * Aggregates provider statuses: any success wins; otherwise "not configured"
 * only when every provider reported it (so a real failure is never hidden).
 */
export function aggregateStatus(
  results: readonly DiscoveryProviderResult[],
): DiscoveryStatus {
  if (results.some((r) => r.status === 'ok')) return 'ok';
  if (results.length > 0 && results.every((r) => r.status === 'not_configured')) {
    return 'not_configured';
  }
  return 'failed';
}
