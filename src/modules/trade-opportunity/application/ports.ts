import type { OrganizationId, UserId } from '@/core/entities';
import type { AppError } from '@/core/errors';
import type { Result } from '@/core/result';

import type {
  CandidateCompany,
  DiscoveryProviderResult,
  DiscoveryQuery,
  RankedCompany,
} from '../domain/discovery';
import type { ExtractionResult } from '../domain/extraction';
import type {
  CompanyRole,
  CompanyStatus,
  OpportunityCompany,
} from '../domain/opportunity-company';
import type {
  DocumentKind,
  OpportunityDocument,
  OpportunityTimelineEvent,
} from '../domain/opportunity-document';
import type {
  AuditEvent,
  ChannelSendResult,
  ConversationMessage,
  DraftContext,
  MessageDirection,
  MessageDraft,
  MessageStatus,
} from '../domain/outreach';
import type {
  OpportunityStatus,
  TradeOpportunity,
  TradeOpportunityDraft,
} from '../domain/trade-opportunity';

/**
 * A source of candidate companies — a trade database, company registry,
 * customs/import-export dataset, and so on. The engine depends only on this
 * interface, never on a concrete API, so providers are added by writing a new
 * adapter and nothing else changes. Each provider MUST normalise its own
 * results into the shared `CandidateCompany` model and report an honest status
 * (`not_configured` rather than inventing companies).
 */
export interface DiscoveryProvider {
  readonly name: string;
  discover(query: DiscoveryQuery): Promise<Result<DiscoveryProviderResult, AppError>>;
}

/** Scores merged candidates against the query. Swappable, like the provider. */
export interface CompanyRanker {
  rank(
    query: DiscoveryQuery,
    candidates: readonly CandidateCompany[],
  ): Promise<Result<readonly RankedCompany[], AppError>>;
}

/** Persistence for the companies attached to an opportunity. RLS-scoped to the org. */
export interface OpportunityCompanyRepository {
  list(opportunityId: string): Promise<Result<readonly OpportunityCompany[], AppError>>;
  findById(id: string): Promise<Result<OpportunityCompany | null, AppError>>;
  /** Records newly discovered companies as `suggested`. */
  add(input: {
    organizationId: OrganizationId;
    opportunityId: string;
    userId: UserId;
    companies: readonly {
      role: CompanyRole;
      name: string;
      country: string | null;
      website: string | null;
      fitScore: number | null;
      source: string | null;
    }[];
  }): Promise<Result<number, AppError>>;
  setStatus(input: {
    id: string;
    status: CompanyStatus;
  }): Promise<Result<void, AppError>>;
  remove(id: string): Promise<Result<void, AppError>>;
}

/**
 * Drafts outreach messages. Swappable like every AI seam. Receives a
 * `DraftContext` whose `priorMessages` is the (empty, for now) hook for future
 * conversation memory — the port never changes when that lands.
 */
export interface MessageDrafter {
  draft(context: DraftContext): Promise<Result<MessageDraft, AppError>>;
}

/**
 * A messaging channel (transactional email, SMTP, …). The engine depends only
 * on this interface. A channel with nothing configured returns `not_configured`
 * and sends nothing — never a fabricated success.
 */
export interface OutreachChannel {
  readonly name: string;
  send(input: {
    subject: string;
    body: string;
    toName: string;
    toWebsite: string | null;
  }): Promise<Result<ChannelSendResult, AppError>>;
}

/** Persistence for opportunity messages and their approval lifecycle. */
export interface OpportunityMessageRepository {
  list(opportunityId: string): Promise<Result<readonly ConversationMessage[], AppError>>;
  findById(id: string): Promise<Result<ConversationMessage | null, AppError>>;
  createDraft(input: {
    organizationId: OrganizationId;
    opportunityId: string;
    companyId: string;
    userId: UserId;
    direction: MessageDirection;
    channel: string;
    subject: string;
    body: string;
    aiGenerated: boolean;
  }): Promise<Result<ConversationMessage, AppError>>;
  /** Updates the draft body/subject; the caller resets status to `draft`. */
  updateContent(input: {
    id: string;
    subject: string;
    body: string;
    status: MessageStatus;
    aiGenerated?: boolean;
  }): Promise<Result<ConversationMessage, AppError>>;
  approve(input: { id: string; userId: UserId }): Promise<Result<void, AppError>>;
  setStatus(input: {
    id: string;
    status: MessageStatus;
    failedReason?: string | null;
  }): Promise<Result<void, AppError>>;
}

/** Append-only audit log for outreach. Write and read only — never mutated. */
export interface OutreachAuditLog {
  record(input: {
    organizationId: OrganizationId;
    opportunityId: string;
    companyId?: string | null;
    messageId?: string | null;
    channel?: string | null;
    actor: UserId;
    event: AuditEvent;
    result?: string | null;
    detail?: Readonly<Record<string, unknown>>;
  }): Promise<Result<void, AppError>>;
}

/**
 * Persistence for the documents an opportunity owns, with versioning. RLS scopes
 * every call to the caller's organization.
 */
export interface OpportunityDocumentRepository {
  /** All rows for an opportunity, current and superseded, newest first. */
  list(opportunityId: string): Promise<Result<readonly OpportunityDocument[], AppError>>;
  findById(id: string): Promise<Result<OpportunityDocument | null, AppError>>;
  record(input: {
    organizationId: OrganizationId;
    opportunityId: string;
    userId: UserId;
    kind: DocumentKind;
    fileName: string;
    storagePath: string;
    mimeType: string | null;
    sizeBytes: number | null;
    version?: number;
    replacesId?: string | null;
  }): Promise<Result<OpportunityDocument, AppError>>;
  rename(input: {
    id: string;
    fileName: string;
  }): Promise<Result<OpportunityDocument, AppError>>;
  /** Marks a document not-current after a replacement supersedes it. */
  supersede(id: string): Promise<Result<void, AppError>>;
  remove(id: string): Promise<Result<void, AppError>>;
}

/** Blob storage for opportunity documents (a private Supabase Storage bucket). */
export interface OpportunityDocumentStorage {
  upload(input: {
    path: string;
    body: ArrayBuffer;
    contentType: string;
  }): Promise<Result<void, AppError>>;
  remove(path: string): Promise<Result<void, AppError>>;
  /** A short-lived signed URL for private download/preview. */
  createSignedUrl(
    path: string,
    expiresInSeconds: number,
  ): Promise<Result<string, AppError>>;
}

/** The opportunity's growing record of what happened. */
export interface OpportunityTimelineRepository {
  list(
    opportunityId: string,
  ): Promise<Result<readonly OpportunityTimelineEvent[], AppError>>;
  record(input: {
    organizationId: OrganizationId;
    opportunityId: string;
    userId: UserId;
    kind: string;
    title: string;
    detail?: string | null;
  }): Promise<Result<void, AppError>>;
}

/**
 * Turns a business document into a structured, honest `ExtractionResult`.
 *
 * Implementations must never fabricate: with no model configured, return a
 * `not_configured` result, not invented fields. The adapter is the only place
 * that knows about a specific AI provider.
 */
export interface DocumentExtractionInput {
  readonly bytes: ArrayBuffer;
  readonly mimeType: string;
  readonly fileName: string;
}

export interface DocumentExtractor {
  extract(input: DocumentExtractionInput): Promise<Result<ExtractionResult, AppError>>;
}

/**
 * How the application reads and writes Trade Opportunities. RLS scopes every
 * call to the caller's organization, so ids alone are enough to address a row
 * safely — a mismatched organization simply returns nothing.
 */
export interface TradeOpportunityRepository {
  list(
    organizationId: OrganizationId,
  ): Promise<Result<readonly TradeOpportunity[], AppError>>;

  findById(id: string): Promise<Result<TradeOpportunity | null, AppError>>;

  create(input: {
    organizationId: OrganizationId;
    userId: UserId;
    draft: TradeOpportunityDraft;
    status: OpportunityStatus;
  }): Promise<Result<TradeOpportunity, AppError>>;

  update(input: {
    id: string;
    draft: TradeOpportunityDraft;
    status?: OpportunityStatus;
  }): Promise<Result<TradeOpportunity, AppError>>;

  setStatus(input: {
    id: string;
    status: OpportunityStatus;
  }): Promise<Result<TradeOpportunity, AppError>>;

  remove(id: string): Promise<Result<void, AppError>>;

  /** Records that the user just opened this opportunity, for "recent" ordering. */
  touchOpened(id: string): Promise<Result<void, AppError>>;
}
