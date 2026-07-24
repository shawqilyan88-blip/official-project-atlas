import type {
  MembershipWithOrganization,
  MembershipWithProfile,
  Organization,
  OrganizationId,
  Profile,
  UserId,
} from '@/core/entities';
import { type AppError, ConflictError, NotFoundError } from '@/core/errors';
import { failure, type Result, success } from '@/core/result';
import type { AtlasSupabaseClient } from '@/infrastructure/supabase/browser-client';
import type {
  MembershipRow,
  OrganizationRow,
  ProfileRow,
} from '@/infrastructure/supabase/database.types';
import { mapPostgrestError } from '@/infrastructure/supabase/errors';
import type { TenancyRepository } from '@/modules/tenancy/application/ports';

import {
  toMembershipWithOrganization,
  toMembershipWithProfile,
  toOrganization,
  toProfile,
} from './mappers';

/**
 * Supabase adapter for the `TenancyRepository` port.
 *
 * Note what is absent from every query below: an `organization_id` filter
 * supplied by the caller. Row Level Security already restricts each statement
 * to organizations the authenticated user belongs to, so adding a client-chosen
 * filter would be theatre — and worse, it would suggest that filtering is where
 * the safety comes from.
 */
export class SupabaseTenancyRepository implements TenancyRepository {
  constructor(private readonly client: AtlasSupabaseClient) {}

  async findProfileById(userId: UserId): Promise<Result<Profile | null, AppError>> {
    const { data, error } = await this.client
      .from('profiles')
      .select('*')
      .eq('id', userId)
      // `maybeSingle` returns null instead of erroring on an empty result — a
      // missing profile is an expected state during the signup race, not a fault.
      .maybeSingle();

    if (error) return failure(mapPostgrestError(error));
    return success(data ? toProfile(data) : null);
  }

  async listMembershipsForUser(
    userId: UserId,
  ): Promise<Result<readonly MembershipWithOrganization[], AppError>> {
    const { data, error } = await this.client
      .from('memberships')
      // One round trip via the foreign key rather than N+1 lookups.
      .select('*, organizations(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) return failure(mapPostgrestError(error));

    const rows = (data ?? []) as Array<
      MembershipRow & { organizations: OrganizationRow | null }
    >;

    const memberships = rows
      // Defensive: a row whose join came back empty would mean the membership
      // outlived its organization. Skip rather than render a broken switcher.
      .filter(
        (row): row is MembershipRow & { organizations: OrganizationRow } =>
          row.organizations !== null,
      )
      .map(toMembershipWithOrganization);

    return success(memberships);
  }

  async createOrganizationWithOwner({
    name,
    slug,
  }: {
    name: string;
    slug: string;
  }): Promise<Result<Organization, AppError>> {
    const { data, error } = await this.client.rpc('create_organization_with_owner', {
      organization_name: name,
      organization_slug: slug,
    });

    if (error) {
      // A unique violation here is a taken slug, which is a normal outcome of
      // two people picking the same workspace name — not an infrastructure fault.
      if (error.code === '23505') {
        return failure(
          new ConflictError(
            'That workspace address is already taken. Please choose another.',
            { cause: error },
          ),
        );
      }
      return failure(mapPostgrestError(error));
    }

    if (!data) {
      return failure(new NotFoundError('The workspace could not be created.'));
    }

    return success(toOrganization(data));
  }

  async listMembersOfOrganization(
    organizationId: OrganizationId,
  ): Promise<Result<readonly MembershipWithProfile[], AppError>> {
    const { data, error } = await this.client
      .from('memberships')
      .select('*, profiles(*)')
      .eq('organization_id', organizationId)
      // Owners first, then admins, then members — the order people expect to
      // read a team list in. `role` is an enum ordered ascending by privilege.
      .order('role', { ascending: false })
      .order('created_at', { ascending: true });

    if (error) return failure(mapPostgrestError(error));

    const rows = (data ?? []) as Array<MembershipRow & { profiles: ProfileRow | null }>;

    const members = rows
      .filter(
        (row): row is MembershipRow & { profiles: ProfileRow } => row.profiles !== null,
      )
      .map(toMembershipWithProfile);

    return success(members);
  }

  async isSlugAvailable(slug: string): Promise<Result<boolean, AppError>> {
    const { data, error } = await this.client.rpc('is_organization_slug_available', {
      candidate_slug: slug,
    });

    if (error) return failure(mapPostgrestError(error));
    return success(data === true);
  }

  async updateProfile(
    userId: UserId,
    changes: { fullName?: string | null },
  ): Promise<Result<Profile, AppError>> {
    const { data, error } = await this.client
      .from('profiles')
      .update({ full_name: changes.fullName ?? null })
      .eq('id', userId)
      .select('*')
      .single();

    if (error) return failure(mapPostgrestError(error));
    return success(toProfile(data));
  }
}
