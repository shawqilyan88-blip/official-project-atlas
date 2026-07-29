import type { OrganizationId, UserId } from '@/core/entities';
import type { AppError } from '@/core/errors';
import type { Result } from '@/core/result';

import type {
  TradeProfile,
  TradeProfileDocument,
  TradeProfileDraft,
} from '../domain/trade-profile';

/**
 * How the application reads and writes Trade Profiles, without naming a
 * database. RLS scopes every call to organizations the caller belongs to, so
 * these methods never take a caller-supplied filter as their security.
 */
export interface TradeProfileRepository {
  /** The organization's profile, or null if it has never been started. */
  findByOrganization(
    organizationId: OrganizationId,
  ): Promise<Result<TradeProfile | null, AppError>>;

  /**
   * Persists the wizard's result. Upserts on organization, stamping
   * `completed_at` so the onboarding gate opens.
   */
  save(input: {
    organizationId: OrganizationId;
    userId: UserId;
    draft: TradeProfileDraft;
  }): Promise<Result<TradeProfile, AppError>>;

  /** Records that the user chose to finish later, without losing existing data. */
  markSkipped(input: {
    organizationId: OrganizationId;
    userId: UserId;
  }): Promise<Result<void, AppError>>;

  /** The documents uploaded for this organization, newest first. */
  listDocuments(
    organizationId: OrganizationId,
  ): Promise<Result<readonly TradeProfileDocument[], AppError>>;

  /** Records metadata for a document already stored in Storage. */
  recordDocument(input: {
    organizationId: OrganizationId;
    userId: UserId;
    fileName: string;
    storagePath: string;
    mimeType: string | null;
    sizeBytes: number | null;
  }): Promise<Result<TradeProfileDocument, AppError>>;
}

/**
 * How the application stores the document bytes. Separated from the metadata
 * repository so the file store (Supabase Storage today) can change without
 * touching the table.
 */
export interface TradeDocumentStorage {
  upload(input: {
    path: string;
    body: ArrayBuffer;
    contentType: string;
  }): Promise<Result<void, AppError>>;

  /** Best-effort cleanup, used to roll back a failed metadata write. */
  remove(path: string): Promise<Result<void, AppError>>;
}
