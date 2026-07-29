import type { OrganizationId, UserId } from '@/core/entities';
import type { AppError } from '@/core/errors';
import { failure, type Result, success } from '@/core/result';
import type { AtlasSupabaseClient } from '@/infrastructure/supabase/browser-client';
import type { TablesUpdate } from '@/infrastructure/supabase/database.types';
import { mapPostgrestError } from '@/infrastructure/supabase/errors';

import type {
  OpportunityStatus,
  TradeOpportunity,
  TradeOpportunityDraft,
} from '../domain/trade-opportunity';
import type { TradeOpportunityRepository } from '../application/ports';
import { toTradeOpportunity } from './mappers';

/** Maps a domain draft to the table's writable columns. */
function draftToColumns(
  draft: TradeOpportunityDraft,
): TablesUpdate<'trade_opportunities'> {
  return {
    name: draft.name,
    objective: draft.objective,
    product: draft.product,
    category: draft.category,
    target_markets: [...draft.targetMarkets],
    min_order_quantity: draft.minOrderQuantity,
    target_price: draft.targetPrice,
    incoterms: [...draft.incoterms],
    required_certifications: [...draft.requiredCertifications],
    payment_terms: [...draft.paymentTerms],
    currencies: [...draft.currencies],
    keywords: [...draft.keywords],
    exclude_keywords: [...draft.excludeKeywords],
    criteria: draft.criteria,
    notes: draft.notes,
  };
}

/**
 * Supabase adapter for the `TradeOpportunityRepository` port. RLS confines every
 * statement to the caller's organization; the ids here address rows, they do
 * not authorise access.
 */
export class SupabaseTradeOpportunityRepository implements TradeOpportunityRepository {
  constructor(private readonly client: AtlasSupabaseClient) {}

  async list(
    organizationId: OrganizationId,
  ): Promise<Result<readonly TradeOpportunity[], AppError>> {
    const { data, error } = await this.client
      .from('trade_opportunities')
      .select('*')
      .eq('organization_id', organizationId)
      .order('updated_at', { ascending: false });

    if (error) return failure(mapPostgrestError(error));
    return success((data ?? []).map(toTradeOpportunity));
  }

  async findById(id: string): Promise<Result<TradeOpportunity | null, AppError>> {
    const { data, error } = await this.client
      .from('trade_opportunities')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) return failure(mapPostgrestError(error));
    return success(data ? toTradeOpportunity(data) : null);
  }

  async create(input: {
    organizationId: OrganizationId;
    userId: UserId;
    draft: TradeOpportunityDraft;
    status: OpportunityStatus;
  }): Promise<Result<TradeOpportunity, AppError>> {
    const { data, error } = await this.client
      .from('trade_opportunities')
      .insert({
        ...draftToColumns(input.draft),
        name: input.draft.name,
        organization_id: input.organizationId,
        created_by: input.userId,
        status: input.status,
      })
      .select('*')
      .single();

    if (error) return failure(mapPostgrestError(error));
    return success(toTradeOpportunity(data));
  }

  async update(input: {
    id: string;
    draft: TradeOpportunityDraft;
    status?: OpportunityStatus;
  }): Promise<Result<TradeOpportunity, AppError>> {
    const columns = draftToColumns(input.draft);
    const patch =
      input.status === undefined
        ? columns
        : {
            ...columns,
            status: input.status,
            archived_at: input.status === 'archived' ? new Date().toISOString() : null,
          };

    const { data, error } = await this.client
      .from('trade_opportunities')
      .update(patch)
      .eq('id', input.id)
      .select('*')
      .single();

    if (error) return failure(mapPostgrestError(error));
    return success(toTradeOpportunity(data));
  }

  async setStatus(input: {
    id: string;
    status: OpportunityStatus;
  }): Promise<Result<TradeOpportunity, AppError>> {
    const { data, error } = await this.client
      .from('trade_opportunities')
      .update({
        status: input.status,
        archived_at: input.status === 'archived' ? new Date().toISOString() : null,
      })
      .eq('id', input.id)
      .select('*')
      .single();

    if (error) return failure(mapPostgrestError(error));
    return success(toTradeOpportunity(data));
  }

  async remove(id: string): Promise<Result<void, AppError>> {
    const { error } = await this.client.from('trade_opportunities').delete().eq('id', id);

    if (error) return failure(mapPostgrestError(error));
    return success(undefined);
  }

  async touchOpened(id: string): Promise<Result<void, AppError>> {
    const { error } = await this.client
      .from('trade_opportunities')
      .update({ last_opened_at: new Date().toISOString() })
      .eq('id', id);

    if (error) return failure(mapPostgrestError(error));
    return success(undefined);
  }
}
