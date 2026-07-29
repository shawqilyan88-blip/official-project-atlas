import type { OrganizationId, UserId } from '@/core/entities';
import type { AppError } from '@/core/errors';
import type { Result } from '@/core/result';

import type { ExtractionResult } from '../domain/extraction';
import type {
  DocumentKind,
  OpportunityDocument,
  OpportunityTimelineEvent,
} from '../domain/opportunity-document';
import type {
  OpportunityStatus,
  TradeOpportunity,
  TradeOpportunityDraft,
} from '../domain/trade-opportunity';

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
