import type { OrganizationId } from '@/core/entities';

/**
 * The Trade Profile domain.
 *
 * A Trade Profile is a workspace's business identity: what it trades, which
 * markets it works in, and whether it is looking for buyers, suppliers, or
 * both. It is the context Atlas needs before it can search intelligently — the
 * difference between "find buyers" and "find EU importers of ceramic tableware
 * who buy from mid-size exporters."
 *
 * This module is pure data and rules. Persistence, Storage, and React live
 * elsewhere; keeping the shape here means the onboarding wizard, the dashboard,
 * and the future extraction pipeline all agree on what a profile *is*.
 */

export const TRADE_ROLES = [
  'manufacturer',
  'exporter',
  'importer',
  'trader',
  'distributor',
] as const;
export type TradeRole = (typeof TRADE_ROLES)[number];

export const LOOKING_FOR = ['buyers', 'suppliers', 'both'] as const;
export type LookingFor = (typeof LOOKING_FOR)[number];

/** Status of a document's (future) AI analysis. `pending` until the engine lands. */
export const DOCUMENT_STATUSES = ['pending', 'processing', 'analyzed', 'failed'] as const;
export type DocumentStatus = (typeof DOCUMENT_STATUSES)[number];

export interface TradeProfile {
  readonly organizationId: OrganizationId;
  readonly products: readonly string[];
  readonly industry: string | null;
  readonly roles: readonly TradeRole[];
  readonly businessTypes: readonly string[];
  readonly companySize: string | null;
  readonly lookingFor: LookingFor | null;
  readonly countries: readonly string[];
  readonly productionCapacity: string | null;
  readonly moq: string | null;
  readonly certifications: readonly string[];
  readonly languages: readonly string[];
  readonly incoterms: readonly string[];
  readonly paymentTerms: readonly string[];
  readonly currencies: readonly string[];
  readonly website: string | null;
  readonly description: string | null;
  /** Set when the user finishes the wizard. The signal that the profile is done. */
  readonly completedAt: string | null;
  /** Set when the user chooses to finish later. Suppresses the onboarding gate. */
  readonly skippedAt: string | null;
}

/** The editable fields, as the wizard collects them before persistence. */
export interface TradeProfileDraft {
  readonly products: readonly string[];
  readonly industry: string | null;
  readonly roles: readonly TradeRole[];
  readonly businessTypes: readonly string[];
  readonly companySize: string | null;
  readonly lookingFor: LookingFor | null;
  readonly countries: readonly string[];
  readonly productionCapacity: string | null;
  readonly moq: string | null;
  readonly certifications: readonly string[];
  readonly languages: readonly string[];
  readonly incoterms: readonly string[];
  readonly paymentTerms: readonly string[];
  readonly currencies: readonly string[];
  readonly website: string | null;
  readonly description: string | null;
}

export interface TradeProfileDocument {
  readonly id: string;
  readonly fileName: string;
  readonly mimeType: string | null;
  readonly sizeBytes: number | null;
  readonly status: DocumentStatus;
  readonly createdAt: string;
}

// ---------------------------------------------------------------------------
// Status
// ---------------------------------------------------------------------------

/**
 * Where a workspace sits in the onboarding journey.
 * - `empty`   — no profile, or one begun but neither finished nor deferred.
 * - `skipped` — the user chose to finish later; let them into the app.
 * - `complete`— a real profile exists; Atlas can personalise around it.
 */
export type TradeProfileStatus = 'empty' | 'skipped' | 'complete';

export function tradeProfileStatus(profile: TradeProfile | null): TradeProfileStatus {
  if (!profile) return 'empty';
  if (profile.completedAt !== null) return 'complete';
  if (profile.skippedAt !== null) return 'skipped';
  return 'empty';
}

/** The onboarding gate: a brand-new workspace is sent to build its profile. */
export function needsTradeProfileOnboarding(profile: TradeProfile | null): boolean {
  return tradeProfileStatus(profile) === 'empty';
}

/** The dashboard reminder shows until the profile is genuinely complete. */
export function shouldRemindAboutProfile(profile: TradeProfile | null): boolean {
  return tradeProfileStatus(profile) !== 'complete';
}

/**
 * Command-bar suggestions tuned to what the workspace is looking for.
 *
 * Once Atlas knows the direction of trade, its prompts should lean that way
 * rather than stay generic — a supplier-sourcing workspace is offered sourcing
 * moves first. With no profile yet, a balanced both-sides set is returned.
 */
export function suggestedActions(lookingFor: LookingFor | null): readonly string[] {
  switch (lookingFor) {
    case 'buyers':
      return [
        'Find potential buyers',
        'Explore new export markets',
        'Research competitors',
        'Draft a buyer introduction',
      ];
    case 'suppliers':
      return [
        'Find reliable suppliers',
        'Build a supplier shortlist',
        'Find manufacturers',
        'Draft supplier outreach',
      ];
    default:
      return [
        'Find buyers in Germany',
        'Find suppliers in Vietnam',
        'Research a new market',
        'Analyze import trends',
      ];
  }
}

// ---------------------------------------------------------------------------
// Display options — labels live with the domain so every surface matches.
// ---------------------------------------------------------------------------

export const TRADE_ROLE_OPTIONS: readonly { value: TradeRole; label: string }[] = [
  { value: 'manufacturer', label: 'Manufacturer' },
  { value: 'exporter', label: 'Exporter' },
  { value: 'importer', label: 'Importer' },
  { value: 'trader', label: 'Trader' },
  { value: 'distributor', label: 'Distributor' },
];

export const LOOKING_FOR_OPTIONS: readonly {
  value: LookingFor;
  label: string;
  hint: string;
}[] = [
  { value: 'buyers', label: 'Buyers', hint: 'Companies to sell to' },
  { value: 'suppliers', label: 'Suppliers', hint: 'Companies to source from' },
  { value: 'both', label: 'Both', hint: 'Grow both sides of your trade' },
];

export const TRADE_ROLE_LABEL: Readonly<Record<TradeRole, string>> = Object.fromEntries(
  TRADE_ROLE_OPTIONS.map((option) => [option.value, option.label]),
) as Record<TradeRole, string>;

// ---------------------------------------------------------------------------
// Field limits — mirror the CHECK constraints in the 0003 migration.
// ---------------------------------------------------------------------------

export const TRADE_PROFILE_LIMITS = {
  industryMax: 120,
  descriptionMax: 2000,
  websiteMax: 2048,
  shortTextMax: 120,
  tagMax: 80,
  maxTags: 30,
} as const;
