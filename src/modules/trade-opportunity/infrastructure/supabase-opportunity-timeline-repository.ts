import type { OrganizationId, UserId } from '@/core/entities';
import type { AppError } from '@/core/errors';
import { failure, type Result, success } from '@/core/result';
import type { AtlasSupabaseClient } from '@/infrastructure/supabase/browser-client';
import { mapPostgrestError } from '@/infrastructure/supabase/errors';

import type { OpportunityTimelineEvent } from '../domain/opportunity-document';
import type { OpportunityTimelineRepository } from '../application/ports';
import { toOpportunityTimelineEvent } from './document-mappers';

/** Supabase adapter for the opportunity timeline. RLS scopes to the caller's org. */
export class SupabaseOpportunityTimelineRepository implements OpportunityTimelineRepository {
  constructor(private readonly client: AtlasSupabaseClient) {}

  async list(
    opportunityId: string,
  ): Promise<Result<readonly OpportunityTimelineEvent[], AppError>> {
    const { data, error } = await this.client
      .from('opportunity_timeline_events')
      .select('*')
      .eq('opportunity_id', opportunityId)
      .order('created_at', { ascending: false });

    if (error) return failure(mapPostgrestError(error));
    return success((data ?? []).map(toOpportunityTimelineEvent));
  }

  async record(input: {
    organizationId: OrganizationId;
    opportunityId: string;
    userId: UserId;
    kind: string;
    title: string;
    detail?: string | null;
  }): Promise<Result<void, AppError>> {
    const { error } = await this.client.from('opportunity_timeline_events').insert({
      organization_id: input.organizationId,
      opportunity_id: input.opportunityId,
      created_by: input.userId,
      kind: input.kind,
      title: input.title,
      detail: input.detail ?? null,
    });

    if (error) return failure(mapPostgrestError(error));
    return success(undefined);
  }
}
