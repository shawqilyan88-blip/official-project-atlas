import type { MembershipId, OrganizationId, UserId } from './identifiers';
import type { Organization } from './organization';
import type { Profile } from './profile';
import type { Role } from './role';

/**
 * The join between a person and a tenant, carrying the role that person holds
 * there. A user with no membership row for an organization cannot see a single
 * one of its records — that is the whole of the tenancy rule.
 */
export interface Membership {
  readonly id: MembershipId;
  readonly userId: UserId;
  readonly organizationId: OrganizationId;
  readonly role: Role;
  readonly createdAt: string;
  readonly updatedAt: string;
}

/** A membership resolved together with the organization it points at. */
export interface MembershipWithOrganization extends Membership {
  readonly organization: Organization;
}

/** A membership resolved together with the person who holds it. */
export interface MembershipWithProfile extends Membership {
  readonly profile: Profile;
}

/**
 * The resolved tenant context for one request: who is asking, which
 * organization they are acting in, and what they may do there.
 *
 * This is assembled server-side on every request from the verified session. It
 * is never accepted from the client, because a client-supplied organization id
 * is exactly how cross-tenant access happens.
 */
export interface TenantContext {
  readonly profile: Profile;
  readonly organization: Organization;
  readonly role: Role;
  /** Every organization the user belongs to, for the workspace switcher. */
  readonly memberships: readonly MembershipWithOrganization[];
}
