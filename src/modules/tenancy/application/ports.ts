import type {
  MembershipWithOrganization,
  MembershipWithProfile,
  Organization,
  OrganizationId,
  Profile,
  UserId,
} from '@/core/entities';
import type { AppError } from '@/core/errors';
import type { Result } from '@/core/result';

/**
 * The tenancy port: how the application reads and creates tenant data,
 * expressed without reference to any particular database.
 */
export interface TenancyRepository {
  findProfileById(userId: UserId): Promise<Result<Profile | null, AppError>>;

  /**
   * Every organization the user belongs to, with the membership role attached.
   * Ordered oldest-first so the workspace switcher is stable between visits.
   */
  listMembershipsForUser(
    userId: UserId,
  ): Promise<Result<readonly MembershipWithOrganization[], AppError>>;

  /**
   * Creates an organization and its owner membership atomically.
   * Fails with a `ConflictError` when the slug is taken.
   */
  createOrganizationWithOwner(input: {
    name: string;
    slug: string;
  }): Promise<Result<Organization, AppError>>;

  /** Whether a slug is free, without revealing anything about who holds it. */
  isSlugAvailable(slug: string): Promise<Result<boolean, AppError>>;

  /**
   * Everyone in an organization, with their profile attached. RLS restricts
   * this to organizations the caller belongs to.
   */
  listMembersOfOrganization(
    organizationId: OrganizationId,
  ): Promise<Result<readonly MembershipWithProfile[], AppError>>;

  updateProfile(
    userId: UserId,
    changes: { fullName?: string | null },
  ): Promise<Result<Profile, AppError>>;
}

/** Identifies the organization a request should act in. */
export interface ActiveOrganizationStore {
  read(): Promise<OrganizationId | null>;
  write(organizationId: OrganizationId): Promise<void>;
  clear(): Promise<void>;
}
