import type { OrganizationId, UserId } from '@/core/entities';
import type { AppError } from '@/core/errors';
import { failure, type Result, success } from '@/core/result';
import type { AtlasSupabaseClient } from '@/infrastructure/supabase/browser-client';
import type { OpportunityCompanyRow } from '@/infrastructure/supabase/database.types';
import { mapPostgrestError } from '@/infrastructure/supabase/errors';

import type {
  CompanyRole,
  CompanyStatus,
  OpportunityCompany,
} from '../domain/opportunity-company';
import type { OpportunityCompanyRepository } from '../application/ports';

function toOpportunityCompany(row: OpportunityCompanyRow): OpportunityCompany {
  return {
    id: row.id,
    opportunityId: row.opportunity_id,
    role: row.role,
    name: row.name,
    country: row.country,
    website: row.website,
    fitScore: row.fit_score,
    status: row.status,
    source: row.source,
    createdAt: row.created_at,
  };
}

/**
 * Supabase adapter for the companies attached to an opportunity. RLS confines
 * every statement to the caller's organization.
 */
export class SupabaseOpportunityCompanyRepository implements OpportunityCompanyRepository {
  constructor(private readonly client: AtlasSupabaseClient) {}

  async list(
    opportunityId: string,
  ): Promise<Result<readonly OpportunityCompany[], AppError>> {
    const { data, error } = await this.client
      .from('opportunity_companies')
      .select('*')
      .eq('opportunity_id', opportunityId)
      .order('fit_score', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false });

    if (error) return failure(mapPostgrestError(error));
    return success((data ?? []).map(toOpportunityCompany));
  }

  async findById(id: string): Promise<Result<OpportunityCompany | null, AppError>> {
    const { data, error } = await this.client
      .from('opportunity_companies')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) return failure(mapPostgrestError(error));
    return success(data ? toOpportunityCompany(data) : null);
  }

  async add(input: {
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
  }): Promise<Result<number, AppError>> {
    if (input.companies.length === 0) return success(0);

    const rows = input.companies.map((c) => ({
      organization_id: input.organizationId,
      opportunity_id: input.opportunityId,
      created_by: input.userId,
      role: c.role,
      name: c.name,
      country: c.country,
      website: c.website,
      fit_score: c.fitScore,
      source: c.source,
      status: 'suggested' as const,
    }));

    const { data, error } = await this.client
      .from('opportunity_companies')
      .insert(rows)
      .select('id');

    if (error) return failure(mapPostgrestError(error));
    return success(data?.length ?? 0);
  }

  async setStatus(input: {
    id: string;
    status: CompanyStatus;
  }): Promise<Result<void, AppError>> {
    const { error } = await this.client
      .from('opportunity_companies')
      .update({ status: input.status })
      .eq('id', input.id);

    if (error) return failure(mapPostgrestError(error));
    return success(undefined);
  }

  async remove(id: string): Promise<Result<void, AppError>> {
    const { error } = await this.client
      .from('opportunity_companies')
      .delete()
      .eq('id', id);

    if (error) return failure(mapPostgrestError(error));
    return success(undefined);
  }
}
