/**
 * Branded identifiers.
 *
 * Every id in this system is a UUID string, which means the compiler would
 * happily let you pass an organization id where a user id belongs — a class of
 * bug that is silent, plausible-looking, and in a multi-tenant system a
 * potential data leak. Branding makes those swaps a compile error while costing
 * nothing at runtime.
 */

declare const brand: unique symbol;

type Brand<T, TBrand extends string> = T & { readonly [brand]: TBrand };

export type UserId = Brand<string, 'UserId'>;
export type OrganizationId = Brand<string, 'OrganizationId'>;
export type MembershipId = Brand<string, 'MembershipId'>;

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isUuid(value: string): boolean {
  return UUID_PATTERN.test(value);
}

/**
 * Trusted constructors, for values that have already crossed a validation
 * boundary (a database row, a verified JWT claim). Untrusted input should go
 * through the Zod schemas in the module boundary instead.
 */
export const UserId = (value: string): UserId => value as UserId;
export const OrganizationId = (value: string): OrganizationId => value as OrganizationId;
export const MembershipId = (value: string): MembershipId => value as MembershipId;
