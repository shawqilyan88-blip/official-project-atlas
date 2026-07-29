import type { OrganizationId, UserId } from '@/core/entities';
import type { AppError } from '@/core/errors';
import { failure, type Result, success } from '@/core/result';
import type { AtlasSupabaseClient } from '@/infrastructure/supabase/browser-client';
import type { TablesInsert } from '@/infrastructure/supabase/database.types';
import { mapPostgrestError } from '@/infrastructure/supabase/errors';

import type {
  TradeProfile,
  TradeProfileDocument,
  TradeProfileDraft,
} from '../domain/trade-profile';
import type { TradeProfileRepository } from '../application/ports';
import { toTradeProfile, toTradeProfileDocument } from './mappers';

/**
 * Supabase adapter for the `TradeProfileRepository` port.
 *
 * As with tenancy, no query below carries a caller-supplied organization
 * filter as its safety — RLS restricts every statement to the caller's
 * organizations. The `organization_id` values passed here are for addressing
 * the right row, and the database independently verifies the caller may touch it.
 */
export class SupabaseTradeProfileRepository implements TradeProfileRepository {
  constructor(private readonly client: AtlasSupabaseClient) {}

  async findByOrganization(
    organizationId: OrganizationId,
  ): Promise<Result<TradeProfile | null, AppError>> {
    const { data, error } = await this.client
      .from('trade_profiles')
      .select('*')
      .eq('organization_id', organizationId)
      .maybeSingle();

    if (error) return failure(mapPostgrestError(error));
    return success(data ? toTradeProfile(data) : null);
  }

  async save(input: {
    organizationId: OrganizationId;
    userId: UserId;
    draft: TradeProfileDraft;
  }): Promise<Result<TradeProfile, AppError>> {
    const row: TablesInsert<'trade_profiles'> = {
      organization_id: input.organizationId,
      created_by: input.userId,
      products: [...input.draft.products],
      industry: input.draft.industry,
      roles: [...input.draft.roles],
      business_types: [...input.draft.businessTypes],
      company_size: input.draft.companySize,
      looking_for: input.draft.lookingFor,
      countries: [...input.draft.countries],
      production_capacity: input.draft.productionCapacity,
      moq: input.draft.moq,
      certifications: [...input.draft.certifications],
      languages: [...input.draft.languages],
      incoterms: [...input.draft.incoterms],
      payment_terms: [...input.draft.paymentTerms],
      currencies: [...input.draft.currencies],
      website: input.draft.website,
      description: input.draft.description,
      completed_at: new Date().toISOString(),
    };

    const { data, error } = await this.client
      .from('trade_profiles')
      .upsert(row, { onConflict: 'organization_id' })
      .select('*')
      .single();

    if (error) return failure(mapPostgrestError(error));
    return success(toTradeProfile(data));
  }

  async markSkipped(input: {
    organizationId: OrganizationId;
    userId: UserId;
  }): Promise<Result<void, AppError>> {
    // Only `skipped_at` and `created_by` are provided, so an existing row keeps
    // any products or `completed_at` it already has — skipping never destroys data.
    const { error } = await this.client.from('trade_profiles').upsert(
      {
        organization_id: input.organizationId,
        created_by: input.userId,
        skipped_at: new Date().toISOString(),
      },
      { onConflict: 'organization_id' },
    );

    if (error) return failure(mapPostgrestError(error));
    return success(undefined);
  }

  async listDocuments(
    organizationId: OrganizationId,
  ): Promise<Result<readonly TradeProfileDocument[], AppError>> {
    const { data, error } = await this.client
      .from('trade_profile_documents')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) return failure(mapPostgrestError(error));
    return success((data ?? []).map(toTradeProfileDocument));
  }

  async recordDocument(input: {
    organizationId: OrganizationId;
    userId: UserId;
    fileName: string;
    storagePath: string;
    mimeType: string | null;
    sizeBytes: number | null;
  }): Promise<Result<TradeProfileDocument, AppError>> {
    const { data, error } = await this.client
      .from('trade_profile_documents')
      .insert({
        organization_id: input.organizationId,
        uploaded_by: input.userId,
        file_name: input.fileName,
        storage_path: input.storagePath,
        mime_type: input.mimeType,
        size_bytes: input.sizeBytes,
        status: 'pending',
      })
      .select('*')
      .single();

    if (error) return failure(mapPostgrestError(error));
    return success(toTradeProfileDocument(data));
  }
}
