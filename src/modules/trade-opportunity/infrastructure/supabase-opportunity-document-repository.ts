import type { OrganizationId, UserId } from '@/core/entities';
import type { AppError } from '@/core/errors';
import { failure, type Result, success } from '@/core/result';
import type { AtlasSupabaseClient } from '@/infrastructure/supabase/browser-client';
import { mapPostgrestError } from '@/infrastructure/supabase/errors';

import type { DocumentKind, OpportunityDocument } from '../domain/opportunity-document';
import type { OpportunityDocumentRepository } from '../application/ports';
import { toOpportunityDocument } from './document-mappers';

/**
 * Supabase adapter for opportunity documents. RLS confines every statement to
 * the caller's organization; the ids here address rows, they do not authorise.
 */
export class SupabaseOpportunityDocumentRepository implements OpportunityDocumentRepository {
  constructor(private readonly client: AtlasSupabaseClient) {}

  async list(
    opportunityId: string,
  ): Promise<Result<readonly OpportunityDocument[], AppError>> {
    const { data, error } = await this.client
      .from('opportunity_documents')
      .select('*')
      .eq('opportunity_id', opportunityId)
      .order('created_at', { ascending: false });

    if (error) return failure(mapPostgrestError(error));
    return success((data ?? []).map(toOpportunityDocument));
  }

  async findById(id: string): Promise<Result<OpportunityDocument | null, AppError>> {
    const { data, error } = await this.client
      .from('opportunity_documents')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) return failure(mapPostgrestError(error));
    return success(data ? toOpportunityDocument(data) : null);
  }

  async record(input: {
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
  }): Promise<Result<OpportunityDocument, AppError>> {
    const { data, error } = await this.client
      .from('opportunity_documents')
      .insert({
        organization_id: input.organizationId,
        opportunity_id: input.opportunityId,
        created_by: input.userId,
        kind: input.kind,
        file_name: input.fileName,
        storage_path: input.storagePath,
        mime_type: input.mimeType,
        size_bytes: input.sizeBytes,
        version: input.version ?? 1,
        replaces_id: input.replacesId ?? null,
        is_current: true,
      })
      .select('*')
      .single();

    if (error) return failure(mapPostgrestError(error));
    return success(toOpportunityDocument(data));
  }

  async rename(input: {
    id: string;
    fileName: string;
  }): Promise<Result<OpportunityDocument, AppError>> {
    const { data, error } = await this.client
      .from('opportunity_documents')
      .update({ file_name: input.fileName })
      .eq('id', input.id)
      .select('*')
      .single();

    if (error) return failure(mapPostgrestError(error));
    return success(toOpportunityDocument(data));
  }

  async supersede(id: string): Promise<Result<void, AppError>> {
    const { error } = await this.client
      .from('opportunity_documents')
      .update({ is_current: false })
      .eq('id', id);

    if (error) return failure(mapPostgrestError(error));
    return success(undefined);
  }

  async remove(id: string): Promise<Result<void, AppError>> {
    const { error } = await this.client
      .from('opportunity_documents')
      .delete()
      .eq('id', id);

    if (error) return failure(mapPostgrestError(error));
    return success(undefined);
  }
}
