import {
  type Membership,
  type MembershipId,
  type MembershipWithOrganization,
  type MembershipWithProfile,
  type Organization,
  OrganizationId,
  type Profile,
  type Role,
  UserId,
} from '@/core/entities';
import type {
  MembershipRow,
  OrganizationRow,
  ProfileRow,
} from '@/infrastructure/supabase/database.types';

/**
 * Row-to-entity mappers.
 *
 * The database speaks `snake_case` and nullable columns; the domain speaks
 * `camelCase` and precise types. Confining that translation here means a column
 * rename touches this file and nothing else — and it keeps raw rows, which
 * carry no branded ids, out of the domain.
 */

export function toProfile(row: ProfileRow): Profile {
  return {
    id: UserId(row.id),
    email: row.email,
    fullName: row.full_name,
    avatarUrl: row.avatar_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function toOrganization(row: OrganizationRow): Organization {
  return {
    id: OrganizationId(row.id),
    name: row.name,
    slug: row.slug,
    // `created_by` is nullable because the creator's account may have been
    // deleted. The domain keeps the field non-optional and falls back to an
    // empty id rather than making every consumer handle the null.
    createdBy: UserId(row.created_by ?? ''),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function toMembership(row: MembershipRow): Membership {
  return {
    id: row.id as MembershipId,
    userId: UserId(row.user_id),
    organizationId: OrganizationId(row.organization_id),
    role: row.role as Role,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function toMembershipWithOrganization(
  row: MembershipRow & { organizations: OrganizationRow },
): MembershipWithOrganization {
  return {
    ...toMembership(row),
    organization: toOrganization(row.organizations),
  };
}

export function toMembershipWithProfile(
  row: MembershipRow & { profiles: ProfileRow },
): MembershipWithProfile {
  return {
    ...toMembership(row),
    profile: toProfile(row.profiles),
  };
}
