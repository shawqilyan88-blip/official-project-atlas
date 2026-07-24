import type { OrganizationId, UserId } from './identifiers';

/**
 * An organization is the tenant boundary. Every business record in Project
 * Atlas — buyer, supplier, conversation, deal — belongs to exactly one, and no
 * query may ever span two.
 */
export interface Organization {
  readonly id: OrganizationId;
  readonly name: string;
  /** URL-safe unique handle, used in paths and invitations. */
  readonly slug: string;
  readonly createdBy: UserId;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export const ORGANIZATION_NAME_MIN_LENGTH = 2;
export const ORGANIZATION_NAME_MAX_LENGTH = 60;
export const ORGANIZATION_SLUG_MIN_LENGTH = 3;
export const ORGANIZATION_SLUG_MAX_LENGTH = 40;

/** Lowercase alphanumerics and single inner hyphens. */
export const ORGANIZATION_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Slugs that would collide with a reserved application path, or that would let
 * a tenant impersonate the product itself.
 */
const RESERVED_SLUGS = new Set([
  'about',
  'account',
  'admin',
  'api',
  'app',
  'atlas',
  'auth',
  'billing',
  'blog',
  'dashboard',
  'docs',
  'help',
  'internal',
  'legal',
  'login',
  'logout',
  'new',
  'onboarding',
  'pricing',
  'privacy',
  'settings',
  'signin',
  'signup',
  'security',
  'status',
  'support',
  'system',
  'terms',
  'www',
]);

export function isReservedSlug(slug: string): boolean {
  return RESERVED_SLUGS.has(slug);
}

/**
 * Derives a candidate slug from a display name. Deliberately lossy: the result
 * is a *suggestion* the user can override, and uniqueness is settled by the
 * database's unique index rather than assumed here.
 */
export function slugifyOrganizationName(name: string): string {
  return (
    name
      .normalize('NFKD')
      // Strip combining marks so "Ünïcode" becomes "Unicode" rather than vanishing.
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, ORGANIZATION_SLUG_MAX_LENGTH)
      .replace(/-+$/, '')
  );
}
